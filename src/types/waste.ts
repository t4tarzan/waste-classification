import { Timestamp } from 'firebase/firestore';

export type WasteType = 'plastic' | 'metal' | 'glass' | 'paper' | 'organic' | 'unknown' | 'non-recyclable' | 'hazardous';

export type ModelType = 'trashnet' | 'taco' | 'wastenet';

export interface ModelResult {
  category: string;
  confidence: number;
  metadata?: {
    material?: string;
    recyclable?: boolean;
    subcategories?: string[];
    error?: string;
  };
  predictions?: Record<string, number>;
}

export interface ClassificationResult {
  imageUrl: string;
  timestamp: Timestamp;
  wasteType: WasteType;
  confidence: number;
  metadata?: {
    material?: string;
    recyclable?: boolean;
    recommendations?: string[];
    source?: string;
    analysisId?: string;
  };
  analysis?: {
    [key in ModelType]?: ModelResult;
  };
}
