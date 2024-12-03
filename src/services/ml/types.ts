import { Timestamp } from 'firebase/firestore';

export interface ClassificationMetadata {
  material?: string;
  recyclable?: boolean;
  source?: string;
  disposalRecommendation?: string;
  locationBasedSuggestion?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface ClassificationResult {
  category: string;
  confidence: number;
  predictions: Record<string, number>;
  imageUrl: string;
  timestamp: Timestamp;
  metadata: ClassificationMetadata;
}

export interface BaseModelResult {
  category: string;
  confidence: number;
  predictions: Record<string, number>;
  timestamp: Timestamp;
  source: 'trashnet' | 'taco' | 'wastenet' | 'mlservice';
}

export interface TrashNetResult extends BaseModelResult {
  category: 'glass' | 'paper' | 'cardboard' | 'plastic' | 'metal' | 'trash';
  confidence: number;
  predictions: Record<string, number>;
  source: 'trashnet';
}

export interface TACOResult extends BaseModelResult {
  category: string;
  confidence: number;
  subcategory?: string;
  disposalRecommendation?: string;
  locationBasedSuggestion?: string;
  source: 'taco';
}

export interface WasteNetResult extends BaseModelResult {
  category: string;
  materialType?: string;
  recyclability: 'recyclable' | 'non-recyclable' | 'special-disposal';
  confidenceScore: number;
  source: 'wastenet';
}

export type ClassificationSource = 'trashnet' | 'taco' | 'wastenet' | 'mlservice';

export interface ClassificationRequest {
  imageUrl: string;
  source?: ClassificationSource;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface ClassificationError {
  code: string;
  message: string;
  source: ClassificationSource;
}

export interface ModelResults {
  trashnet?: TrashNetResult;
  taco?: TACOResult;
  wastenet?: WasteNetResult;
}

// Re-export ClassificationResult as MLServiceResult for backward compatibility
export type MLServiceResult = ClassificationResult;
