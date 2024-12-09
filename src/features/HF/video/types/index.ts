import { HFWastePrediction } from '../../types/analysis';

export interface VideoConfig {
  maxDuration: number;      // Maximum video duration in seconds
  frameRate: number;        // Frames per second to analyze
  batchSize: number;        // Number of frames to process in parallel
  confidenceThreshold: number; // Minimum confidence score
}

export interface Frame {
  data: string;            // Base64 encoded image data
  timestamp: number;       // Frame timestamp in milliseconds
  index: number;          // Frame index in sequence
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FrameAnalysis {
  timestamp: number;
  predictions: HFWastePrediction[];
  confidence: number;
  bbox?: BoundingBox[];
}

export interface VideoAnalysisResult {
  frames: FrameAnalysis[];
  summary: {
    totalFrames: number;
    averageConfidence: number;
    dominantWasteTypes: HFWastePrediction[];
    duration: number;
  };
  timeline: {
    timestamp: number;
    wasteType: string;
    confidence: number;
  }[];
}

export interface VideoAnalyzerProps {
  onAnalysisComplete?: (result: VideoAnalysisResult) => void;
  onError?: (error: Error) => void;
  onProgress?: (progress: number) => void;
  config?: Partial<VideoConfig>;
}
