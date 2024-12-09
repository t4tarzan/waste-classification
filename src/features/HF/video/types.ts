import { HFWastePrediction } from '../types/analysis';

export interface Frame {
  data: string;       // Base64 encoded image data
  timestamp: number;  // Timestamp in milliseconds
  index: number;      // Frame index
}

export interface ExtractFramesOptions {
  framesPerSecond?: number;
  maxFrames?: number;
  onProgress?: (progress: number) => void;
}

export interface FrameAnalysis {
  frame: Frame;
  predictions: HFWastePrediction[];
  confidence: number;  // Average confidence for this frame
}

export interface VideoConfig {
  maxDuration: number;  // Maximum video duration in seconds
  frameRate: number;    // Frames per second to extract
  maxFrames: number;    // Maximum number of frames to process
  minConfidence: number; // Minimum confidence threshold for predictions
  batchSize?: number;    // Number of frames to process in parallel
}

export interface VideoAnalysisResult {
  frames: FrameAnalysis[];
  summary: {
    totalFrames: number;
    averageConfidence: number;
    dominantWasteTypes: Array<{
      wasteType: string;
      confidence: number;
      count: number;
    }>;
  };
}

export interface VideoAnalyzerProps {
  onAnalysisComplete?: (result: VideoAnalysisResult) => void;
  onProgress?: (progress: number) => void;
  onError?: (error: Error) => void;
  config?: Partial<VideoConfig>;
}
