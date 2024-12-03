import { TrashNetService } from './trashnet.service';
import { TACOService } from './taco.service';
import { WasteNetService } from './wastenet.service';
import type { 
  ClassificationRequest, 
  ClassificationResult,
  ClassificationError,
  ClassificationSource,
  TrashNetResult,
  TACOResult,
  WasteNetResult,
  ClassificationMetadata
} from './types';

// Rate limiting configuration
const RATE_LIMIT = {
  MAX_REQUESTS: 10,
  TIME_WINDOW: 60 * 1000, // 1 minute in milliseconds
  RETRY_DELAY: 5000, // 5 seconds
  MAX_RETRIES: 3
};

export class MLService {
  private static instance: MLService;
  private trashNet: TrashNetService;
  private taco: TACOService;
  private wasteNet: WasteNetService;
  private requestCount: number = 0;
  private lastRequestTime: number = 0;

  private constructor() {
    this.trashNet = TrashNetService.getInstance();
    this.taco = TACOService.getInstance();
    this.wasteNet = WasteNetService.getInstance();
  }

  public static getInstance(): MLService {
    if (!MLService.instance) {
      MLService.instance = new MLService();
    }
    return MLService.instance;
  }

  private async checkRateLimit(): Promise<void> {
    const now = Date.now();
    if (now - this.lastRequestTime > RATE_LIMIT.TIME_WINDOW) {
      // Reset counter if time window has passed
      this.requestCount = 0;
      this.lastRequestTime = now;
    } else if (this.requestCount >= RATE_LIMIT.MAX_REQUESTS) {
      const waitTime = RATE_LIMIT.TIME_WINDOW - (now - this.lastRequestTime);
      const error: ClassificationError = {
        code: 'RATE_LIMIT_EXCEEDED',
        message: `Rate limit exceeded. Please try again in ${Math.ceil(waitTime / 1000)} seconds.`,
        source: 'mlservice'
      };
      throw error;
    }
    this.requestCount++;
    this.lastRequestTime = now;
  }

  private async retryWithBackoff<T>(
    operation: () => Promise<T>,
    retries: number = RATE_LIMIT.MAX_RETRIES
  ): Promise<T> {
    try {
      await this.checkRateLimit();
      return await operation();
    } catch (error) {
      if (
        retries > 0 &&
        error &&
        typeof error === 'object' &&
        'code' in error &&
        (error.code === 'RATE_LIMIT_EXCEEDED' || error.code === 'resource_exhausted')
      ) {
        console.log(`Retrying after ${RATE_LIMIT.RETRY_DELAY}ms. Retries left: ${retries - 1}`);
        await new Promise(resolve => setTimeout(resolve, RATE_LIMIT.RETRY_DELAY));
        return this.retryWithBackoff(operation, retries - 1);
      }
      throw error;
    }
  }

  private transformToClassificationResult(
    result: TrashNetResult | TACOResult | WasteNetResult,
    imageUrl: string
  ): ClassificationResult {
    const metadata: ClassificationMetadata = {
      source: result.source
    };

    if ('materialType' in result) {
      metadata.material = result.materialType;
      metadata.recyclable = result.recyclability === 'recyclable';
    }

    if ('disposalRecommendation' in result) {
      metadata.disposalRecommendation = result.disposalRecommendation;
      metadata.locationBasedSuggestion = result.locationBasedSuggestion;
    }

    return {
      category: result.category,
      confidence: 'confidenceScore' in result ? result.confidenceScore : result.confidence,
      predictions: result.predictions,
      imageUrl,
      timestamp: result.timestamp,
      metadata
    };
  }

  public async classify(request: ClassificationRequest): Promise<ClassificationResult> {
    const { imageUrl, source, location } = request;

    try {
      return await this.retryWithBackoff(async () => {
        let result: TrashNetResult | TACOResult | WasteNetResult;
        
        switch (source) {
          case 'trashnet':
            result = await this.trashNet.classifyImage(imageUrl);
            break;
          case 'taco':
            result = await this.taco.classifyImage(imageUrl, location);
            break;
          case 'wastenet':
          default:
            result = await this.wasteNet.classifyImage(imageUrl);
            break;
        }

        return this.transformToClassificationResult(result, imageUrl);
      });
    } catch (error) {
      if (this.isClassificationError(error)) {
        throw error;
      }
      const classificationError: ClassificationError = {
        code: 'ML_SERVICE_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        source: source || 'mlservice'
      };
      throw classificationError;
    }
  }

  private isClassificationError(error: unknown): error is ClassificationError {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      'message' in error &&
      'source' in error
    );
  }

  public async getAvailableSources(): Promise<Array<{
    id: ClassificationSource;
    name: string;
    description: string;
    accuracy: number;
    features: string[];
  }>> {
    return [
      {
        id: 'trashnet',
        name: 'TrashNet',
        description: 'Basic waste classification into 6 main categories',
        accuracy: 0.89,
        features: ['Basic categorization', 'High accuracy', 'Fast processing']
      },
      {
        id: 'taco',
        name: 'TACO',
        description: 'Detailed waste categorization with location-based disposal suggestions',
        accuracy: 0.85,
        features: ['Detailed categories', 'Location awareness', 'Disposal guidelines']
      },
      {
        id: 'wastenet',
        name: 'WasteNet',
        description: 'Advanced waste classification with material analysis',
        accuracy: 0.92,
        features: ['Material analysis', 'Recyclability check', 'High confidence scoring']
      }
    ];
  }
}
