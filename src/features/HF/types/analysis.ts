// HuggingFace specific prediction types
export interface HFWastePrediction {
  wasteType: string;
  confidence: number;
}

// Keep this separate from the main application's types
export interface HFAnalysisResult {
  predictions: HFWastePrediction[];
  timestamp: number;
  metadata?: {
    modelName: string;
    processingTime: number;
  };
}
