import { WasteNetResult, ClassificationError } from './types';
import { Timestamp } from 'firebase/firestore';

const WASTENET_API_ENDPOINT = process.env.REACT_APP_WASTENET_API_URL || 'http://localhost:5002/mock/wastenet';
const WASTENET_API_KEY = process.env.REACT_APP_WASTENET_API_KEY || 'mock_key';

export class WasteNetService {
  private static instance: WasteNetService;
  private readonly API_URL: string;
  private readonly API_KEY: string;

  private constructor() {
    if (!WASTENET_API_ENDPOINT || !WASTENET_API_KEY) {
      throw new Error('WasteNet API configuration missing');
    }
    this.API_URL = WASTENET_API_ENDPOINT;
    this.API_KEY = WASTENET_API_KEY;
  }

  public static getInstance(): WasteNetService {
    if (!WasteNetService.instance) {
      WasteNetService.instance = new WasteNetService();
    }
    return WasteNetService.instance;
  }

  private async urlToFile(url: string): Promise<File> {
    const response = await fetch(url);
    const blob = await response.blob();
    return new File([blob], 'image.jpg', { type: blob.type });
  }

  public async classifyImage(imageUrl: string): Promise<WasteNetResult> {
    try {
      // Convert URL to File
      const file = await this.urlToFile(imageUrl);
      
      // Create FormData
      const formData = new FormData();
      formData.append('image', file);

      console.log('Sending request to:', `${this.API_URL}/analyze`);
      
      const response = await fetch(`${this.API_URL}/analyze`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`WasteNet API error: ${response.statusText}. ${errorText}`);
      }

      const data = await response.json();
      console.log('WasteNet response:', data);

      // Create predictions object from material types and confidence scores
      const predictions: Record<string, number> = {
        [data.category]: data.confidenceScore
      };

      if (data.materialType) {
        predictions[`${data.materialType}`] = data.confidenceScore;
      }

      if (data.alternativeMaterials) {
        data.alternativeMaterials.forEach((alt: { type: string; confidence: number }) => {
          predictions[alt.type] = alt.confidence;
        });
      }

      // Ensure recyclability is one of the allowed values
      const recyclability = this.normalizeRecyclability(data.recyclability);

      const result: WasteNetResult = {
        category: data.category,
        confidence: data.confidenceScore, // Required by BaseModelResult
        materialType: data.materialType,
        recyclability,
        confidenceScore: data.confidenceScore,
        predictions,
        timestamp: Timestamp.now(),
        source: 'wastenet' as const
      };

      return result;
    } catch (error) {
      console.error('WasteNet classification error:', error);
      const classificationError: ClassificationError = {
        code: 'WASTENET_API_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        source: 'wastenet'
      };
      throw classificationError;
    }
  }

  private normalizeRecyclability(value: string): 'recyclable' | 'non-recyclable' | 'special-disposal' {
    value = value.toLowerCase();
    if (value === 'recyclable' || value === 'non-recyclable' || value === 'special-disposal') {
      return value;
    }
    // Default to special-disposal if the value doesn't match expected values
    return 'special-disposal';
  }

  public async getMaterialGuidelines(materialType: string): Promise<{
    recyclable: boolean;
    guidelines: string[];
    specialInstructions?: string;
  }> {
    try {
      const response = await fetch(
        `${this.API_URL}/material-guidelines?type=${encodeURIComponent(materialType)}`,
        {
          headers: {
            'Authorization': `Bearer ${this.API_KEY}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch material guidelines: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching material guidelines:', error);
      throw error;
    }
  }

  public async getCategories(): Promise<string[]> {
    try {
      const response = await fetch(
        `${this.API_URL}/categories`,
        {
          headers: {
            'Authorization': `Bearer ${this.API_KEY}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.statusText}`);
      }

      const data = await response.json();
      return data.categories;
    } catch (error) {
      console.error('Error fetching WasteNet categories:', error);
      throw error;
    }
  }

  public async getModelMetrics(): Promise<{
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    lastUpdated: Date;
    totalPredictions: number;
  }> {
    try {
      const response = await fetch(
        `${this.API_URL}/metrics`,
        {
          headers: {
            'Authorization': `Bearer ${this.API_KEY}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch model metrics: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching WasteNet metrics:', error);
      throw error;
    }
  }
}
