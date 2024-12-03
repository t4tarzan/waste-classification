// Re-export all types
export * from './analysis';
export * from './waste';
export * from './settings';
export type { UserProfile, UserSettings, UserStatistics } from './user';

// Additional utility types
export interface AnalysisResult {
  id: string;
  imageUrl: string;
  result: {
    wasteType: 'plastic' | 'metal' | 'glass' | 'paper' | 'organic' | 'unknown';
    confidence: number;
    timestamp: Date;
    metadata?: {
      material?: string;
      recyclable?: boolean;
      recommendations?: string[];
    };
  };
}
