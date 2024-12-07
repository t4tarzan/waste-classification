import { Timestamp } from 'firebase/firestore';
import { WasteType } from './waste';

export interface Analysis {
  id: string;
  userId: string;
  imageUrl: string;
  processedImageUrl?: string;
  timestamp: Timestamp;
  status: 'pending' | 'completed' | 'failed';
  result: {
    wasteType: WasteType;
    confidence: number;
    metadata?: {
      material?: string;
      recyclable?: boolean;
      recommendations?: string[];
      source?: string;
      analysisId?: string;
    };
  };
  notes?: string;
}

export interface AnalysisStats {
  totalAnalyses: number;
  wasteTypes: Record<WasteType, number>;
  wasteTypeCounts: Record<WasteType, number>;
  averageConfidence: number;
  totalStorageUsed: number;
  analysisHistory: {
    daily: Array<{ date: string; count: number }>;
    weekly: Array<{ date: string; count: number }>;
    monthly: Array<{ date: string; count: number }>;
  };
  environmentalImpact: {
    co2Saved: number;
    treesEquivalent: number;
    waterSaved: number;
  };
}

export interface AnalysisPreferences {
  autoProcess: boolean;
  autoAnalyze: boolean;
  preferredModel: string;
  notificationsEnabled: boolean;
  saveHistory: boolean;
  saveOriginalImages: boolean;
  confidenceThreshold: number;
  maxStorageSize: number;
  compressionQuality: number;
  modelSettings: {
    [key: string]: {
      enabled: boolean;
      threshold: number;
    };
  };
}

// Alias for backward compatibility
export type AnalysisStatistics = AnalysisStats;
