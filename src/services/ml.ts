import { Timestamp } from 'firebase/firestore';
import { TrashNetService } from './ml/trashnet.service';
import { TACOService } from './ml/taco.service';
import { WasteNetService } from './ml/wastenet.service';
import type { 
  ClassificationResult,
  ModelResults,
  TrashNetResult,
  TACOResult,
  WasteNetResult,
  ClassificationMetadata
} from './ml/types';
import { storage } from '../config/firebase';
import { ref, uploadBytes, getDownloadURL, listAll, deleteObject, getMetadata } from 'firebase/storage';

export type ClassificationSource = 'trashnet' | 'taco' | 'wastenet';

export interface MLServiceResult {
  category: string;
  confidence: number;
  predictions?: Record<string, number>;
  disposalRecommendation?: string;
  locationBasedSuggestion?: string;
  recyclability?: 'recyclable' | 'non-recyclable' | 'partially-recyclable';
  materialType?: string;
}

interface ClassifyOptions {
  imageUrl: string;
  source: ClassificationSource;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export class MLService {
  private static instance: MLService;
  private trashnetService: TrashNetService;
  private tacoService: TACOService;
  private wastenetService: WasteNetService;

  private constructor() {
    this.trashnetService = TrashNetService.getInstance();
    this.tacoService = TACOService.getInstance();
    this.wastenetService = WasteNetService.getInstance();
  }

  public static getInstance(): MLService {
    if (!MLService.instance) {
      MLService.instance = new MLService();
    }
    return MLService.instance;
  }

  private async uploadImage(file: File, userId?: string): Promise<string> {
    try {
      const timestamp = new Date().getTime();
      const safeFileName = encodeURIComponent(file.name.replace(/[^a-zA-Z0-9.-]/g, '_'));
      const filename = `${timestamp}_${safeFileName}`;
      
      // Simple path for all uploads during testing
      const path = `uploads/${filename}`;
      
      console.log('Attempting upload to path:', path);
      
      const storageRef = ref(storage, path);
      
      try {
        const snapshot = await uploadBytes(storageRef, file);
        console.log('Upload successful:', snapshot);
        const downloadURL = await getDownloadURL(snapshot.ref);
        console.log('Download URL obtained:', downloadURL);
        return downloadURL;
      } catch (uploadError: any) {
        console.error('Upload error details:', uploadError);
        throw new Error('Upload failed: ' + uploadError.message);
      }
    } catch (error) {
      console.error('Error in uploadImage:', error);
      throw error;
    }
  }

  private async cleanupTempResults() {
    const guestRef = ref(storage, 'guest-uploads');
    const dayAgo = new Date();
    dayAgo.setDate(dayAgo.getDate() - 1);

    try {
      const items = await listAll(guestRef);
      for (const item of items.items) {
        try {
          const metadata = await getMetadata(item);
          const createdDate = new Date(metadata.timeCreated);
          if (createdDate < dayAgo) {
            await deleteObject(item);
            console.log(`Deleted guest file: ${item.fullPath}`);
          }
        } catch (error) {
          console.error(`Error processing item ${item.fullPath}:`, error);
        }
      }
    } catch (error) {
      console.error('Error cleaning up guest results:', error);
    }
  }

  private determineAggregatedCategory(results: ModelResults): string {
    // Prioritize TrashNet's category if confidence is high
    if (results.trashnet && results.trashnet.confidence > 0.8) {
      return results.trashnet.category;
    }

    // Use WasteNet's category if available and confidence is good
    if (results.wastenet && results.wastenet.confidence > 0.7) {
      return results.wastenet.category;
    }

    // Fallback to TACO's category if available
    if (results.taco?.category) {
      return results.taco.category;
    }

    // Final fallback - use the first available category
    return results.trashnet?.category || 
           results.wastenet?.category || 
           results.taco?.category || 
           'unknown';
  }

  private aggregatePredictions(
    trashnetResult: TrashNetResult,
    tacoResult: TACOResult,
    wastenetResult: WasteNetResult
  ): Record<string, number> {
    const predictions: Record<string, number> = {};
    
    // Add predictions from each model, normalizing confidence scores
    if (trashnetResult.predictions) {
      Object.entries(trashnetResult.predictions).forEach(([category, confidence]) => {
        predictions[`${category} (TrashNet)`] = confidence;
      });
    }

    // Add TACO predictions if available
    if (tacoResult.subcategory) {
      predictions[`${tacoResult.subcategory} (TACO)`] = tacoResult.confidence;
    }

    // Add WasteNet predictions
    predictions[`${wastenetResult.materialType || 'Unknown'} (WasteNet)`] = wastenetResult.confidenceScore;

    return predictions;
  }

  public async analyzeImage(
    file: File,
    userId?: string,
    location?: { latitude: number; longitude: number }
  ): Promise<ClassificationResult> {
    try {
      // Upload image and get URL
      const imageUrl = await this.uploadImage(file, userId);
      console.log('Image uploaded successfully:', imageUrl);

      let trashnetResult: TrashNetResult | null = null;
      let tacoResult: TACOResult | null = null;
      let wastenetResult: WasteNetResult | null = null;

      try {
        // Process with TrashNet first (fastest and most reliable)
        console.log('Starting TrashNet analysis...');
        trashnetResult = await this.trashnetService.classifyImage(imageUrl);
        console.log('TrashNet analysis complete:', trashnetResult);
      } catch (error) {
        console.error('TrashNet analysis failed:', error);
      }

      // Process with TACO and WasteNet in parallel
      try {
        const [taco, wastenet] = await Promise.allSettled([
          this.tacoService.classifyImage(imageUrl, location),
          this.wastenetService.classifyImage(imageUrl)
        ]);

        if (taco.status === 'fulfilled') {
          tacoResult = taco.value;
          console.log('TACO analysis complete:', tacoResult);
        } else {
          console.error('TACO analysis failed:', taco.reason);
        }

        if (wastenet.status === 'fulfilled') {
          wastenetResult = wastenet.value;
          console.log('WasteNet analysis complete:', wastenetResult);
        } else {
          console.error('WasteNet analysis failed:', wastenet.reason);
        }
      } catch (error) {
        console.error('Error in parallel analysis:', error);
      }

      // Ensure we have at least one successful result
      if (!trashnetResult && !tacoResult && !wastenetResult) {
        throw new Error('All classification models failed. Please try again.');
      }

      // Store model results
      const modelResults: ModelResults = {
        trashnet: trashnetResult || undefined,
        taco: tacoResult || undefined,
        wastenet: wastenetResult || undefined
      };

      // Determine category using available results
      const category = this.determineAggregatedCategory(modelResults);

      // Initialize metadata
      const metadata: ClassificationMetadata = {
        source: 'multi-model',
        location: location,
      };

      // Add WasteNet metadata if available
      if (wastenetResult) {
        metadata.material = wastenetResult.materialType;
        metadata.recyclable = wastenetResult.recyclability === 'recyclable';
      }

      // Add TACO metadata if available
      if (tacoResult) {
        metadata.disposalRecommendation = tacoResult.disposalRecommendation;
        metadata.locationBasedSuggestion = tacoResult.locationBasedSuggestion;
      }

      // Initialize predictions object
      const predictions: Record<string, number> = {};
      
      // Add predictions from each successful model
      if (trashnetResult?.predictions) {
        Object.entries(trashnetResult.predictions).forEach(([category, confidence]) => {
          predictions[`${category} (TrashNet)`] = confidence;
        });
      }

      if (tacoResult?.subcategory) {
        predictions[`${tacoResult.subcategory} (TACO)`] = tacoResult.confidence;
      }

      if (wastenetResult) {
        const materialType = wastenetResult.materialType || 'Unknown';
        predictions[`${materialType} (WasteNet)`] = wastenetResult.confidenceScore;
      }
      
      // Calculate overall confidence as the highest confidence from any model
      const confidence = Math.max(
        trashnetResult?.confidence || 0,
        tacoResult?.confidence || 0,
        wastenetResult?.confidence || 0
      );

      // Combine results
      const result: ClassificationResult = {
        category,
        confidence,
        predictions,
        imageUrl,
        timestamp: Timestamp.now(),
        metadata
      };

      // If this is a guest user, schedule cleanup
      if (!userId) {
        this.cleanupTempResults().catch(console.error);
      }

      return result;
    } catch (error) {
      console.error('Error in image analysis:', error);
      throw error;
    }
  }

  public async getModelCategories() {
    try {
      const [trashnetCategories, tacoCategories, wastenetCategories] = await Promise.all([
        this.trashnetService.getCategories(),
        this.tacoService.getCategories(),
        this.wastenetService.getCategories()
      ]);

      return {
        trashnet: trashnetCategories,
        taco: tacoCategories,
        wastenet: wastenetCategories
      };
    } catch (error) {
      console.error('Error getting model categories:', error);
      throw error;
    }
  }
}
