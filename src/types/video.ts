export interface VideoAnalysisResults {
  frameId: number;
  predictions: {
    category: string;
    confidence: number;
    metadata?: {
      material?: string;
      recyclable?: boolean;
      subcategories?: string[];
    };
  }[];
  timestamp: number;
}

export interface VideoAnalysisStats {
  wasteTypeCounts: Record<string, number>;
  totalAnalyses: number;
  averageConfidence: number;
  environmentalImpact: {
    co2Saved: number;
    waterSaved: number;
    energySaved: number;
  };
}
