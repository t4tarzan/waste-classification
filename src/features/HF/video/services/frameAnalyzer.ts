import { Frame, FrameAnalysis, VideoConfig, VideoAnalysisResult, ExtractFramesOptions } from '../types';
import { HFWastePrediction } from '../../types/analysis';
import { ModelError, ModelErrorType } from '../../types/errors';
import { ModelErrorHandler } from '../../services/errorHandler';
import logger from '../../../../utils/logger';

const DEFAULT_CONFIG: VideoConfig = {
  maxDuration: 300, // 5 minutes
  frameRate: 1,    // 1 frame per second
  maxFrames: 300,  // Maximum number of frames to process
  minConfidence: 0.5,
  batchSize: 10
};

export class FrameAnalyzer {
  private config: VideoConfig;
  private videoElement: HTMLVideoElement | null;
  private canvas: HTMLCanvasElement | null;
  private ctx: CanvasRenderingContext2D | null;
  private isInitialized: boolean;
  private errorHandler: ModelErrorHandler;

  constructor(config: Partial<VideoConfig> = {}, onNotify?: (message: string) => void) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.videoElement = null;
    this.canvas = null;
    this.ctx = null;
    this.isInitialized = false;
    this.errorHandler = new ModelErrorHandler(onNotify);
  }

  public async initializeElements(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Create video element
      const videoElement = document.createElement('video');
      videoElement.muted = true;
      videoElement.playsInline = true;

      // Create canvas element
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }

      // Only assign to instance variables after successful creation
      this.videoElement = videoElement;
      this.canvas = canvas;
      this.ctx = ctx;
      this.isInitialized = true;
    } catch (error: unknown) {
      const modelError = ModelErrorHandler.createModelError(error);
      modelError.type = ModelErrorType.INITIALIZATION_ERROR;
      await this.errorHandler.handleError(modelError);
      throw new Error('Failed to initialize video elements: ' + (error instanceof Error ? error.message : String(error)));
    }
  }

  public async analyzeVideo(
    videoSource: string | File,
    onProgress?: (progress: number) => void
  ): Promise<VideoAnalysisResult> {
    try {
      await this.initializeElements();
      this.ensureInitialized();

      const frames = await this.extractFrames(videoSource, {
        framesPerSecond: this.config.frameRate,
        maxFrames: this.config.maxFrames,
        onProgress: (extractProgress: number) => {
          if (onProgress) {
            onProgress(extractProgress * 0.5); // First 50% for extraction
          }
        }
      });

      const analyses: FrameAnalysis[] = [];
      let processedFrames = 0;

      // Process frames in batches
      for (let i = 0; i < frames.length; i += this.config.batchSize || 10) {
        const batch = frames.slice(i, i + (this.config.batchSize || 10));
        const batchAnalyses = await Promise.all(
          batch.map((frame: Frame) => this.analyzeFrame(frame))
        );
        analyses.push(...batchAnalyses);

        processedFrames += batch.length;
        if (onProgress) {
          onProgress(50 + (processedFrames / frames.length) * 50); // Last 50% for analysis
          logger.log('Frame analysis progress:', 50 + (processedFrames / frames.length) * 50);
        }
      }

      return this.aggregateResults(analyses);
    } catch (error) {
      const modelError = ModelErrorHandler.createModelError(error);
      modelError.type = ModelErrorType.ANALYSIS_ERROR;
      await this.errorHandler.handleError(modelError);
      throw error;
    }
  }

  private async analyzeFrame(frame: Frame): Promise<FrameAnalysis> {
    // Mock analysis for testing
    const mockPredictions: HFWastePrediction[] = [
      { wasteType: 'organic', confidence: 0.8 },
      { wasteType: 'recyclable', confidence: 0.2 }
    ];

    return {
      frame,
      predictions: mockPredictions,
      confidence: mockPredictions[0].confidence
    };
  }

  private aggregateResults(analyses: FrameAnalysis[]): VideoAnalysisResult {
    const totalFrames = analyses.length;
    if (totalFrames === 0) {
      throw new Error('No frames to analyze');
    }

    const averageConfidence = analyses.reduce((sum, analysis) => sum + analysis.confidence, 0) / totalFrames;

    // Count waste types
    const wasteTypeCounts = new Map<string, { confidence: number; count: number }>();
    analyses.forEach(analysis => {
      analysis.predictions.forEach(pred => {
        const existing = wasteTypeCounts.get(pred.wasteType) || { confidence: 0, count: 0 };
        wasteTypeCounts.set(pred.wasteType, {
          confidence: existing.confidence + pred.confidence,
          count: existing.count + 1
        });
      });
    });

    // Convert to array and sort by count
    const dominantWasteTypes = Array.from(wasteTypeCounts.entries())
      .map(([wasteType, { confidence, count }]) => ({
        wasteType,
        confidence: confidence / count,
        count
      }))
      .sort((a, b) => b.count - a.count);

    return {
      frames: analyses,
      summary: {
        totalFrames,
        averageConfidence,
        dominantWasteTypes
      }
    };
  }

  private ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new Error('FrameAnalyzer not initialized. Call initializeElements() first');
    }

    if (!this.videoElement || !this.canvas || !this.ctx) {
      throw new Error('Video or canvas elements not initialized properly');
    }
  }

  private async extractFrameFromVideo(videoUrl: string): Promise<HTMLVideoElement> {
    return new Promise((resolve, reject) => {
      const videoElement = document.createElement('video');
      
      const handleError = (error: unknown) => {
        const modelError = ModelErrorHandler.createModelError(error);
        modelError.type = ModelErrorType.EXTRACTION_ERROR;
        this.errorHandler.handleError(modelError)
          .catch(err => console.error('Error handler failed:', err));
        reject(error);
      };

      try {
        videoElement.onloadedmetadata = () => resolve(videoElement);
        videoElement.onerror = () => handleError(new Error('Failed to load video'));
        videoElement.src = videoUrl;
        videoElement.load();
      } catch (error) {
        handleError(error);
      }
    });
  }

  public async extractFrames(videoSource: string | File, options: ExtractFramesOptions = {}): Promise<Frame[]> {
    this.ensureInitialized();

    const videoUrl = typeof videoSource === 'string' ? videoSource : URL.createObjectURL(videoSource);
    
    try {
      const videoElement = await this.extractFrameFromVideo(videoUrl);
      const frames: Frame[] = [];

      // Set canvas dimensions
      if (!this.canvas || !this.ctx) {
        throw new Error('Canvas not initialized');
      }

      this.canvas.width = videoElement.videoWidth || 640;
      this.canvas.height = videoElement.videoHeight || 360;

      // Extract frames at specified intervals
      let currentTime = 0;
      const frameRate = options.framesPerSecond || this.config.frameRate;
      const interval = 1 / frameRate;
      const duration = videoElement.duration || 2;

      while (currentTime < duration) {
        if (options.maxFrames && frames.length >= options.maxFrames) {
          break;
        }

        videoElement.currentTime = currentTime;
        
        await new Promise<void>((seekResolve, seekReject) => {
          const seekTimeoutId = setTimeout(() => {
            seekReject(new Error('Seek operation timed out'));
          }, 1000);

          const handleSeeked = () => {
            clearTimeout(seekTimeoutId);
            try {
              if (!this.canvas || !this.ctx) {
                throw new Error('Canvas not initialized');
              }

              this.ctx.drawImage(videoElement, 0, 0);
              frames.push({
                data: this.canvas.toDataURL('image/jpeg', 0.8),
                timestamp: currentTime * 1000,
                index: frames.length
              });
              
              if (options.onProgress) {
                const progress = Math.min(100, (currentTime / duration) * 100);
                options.onProgress(progress);
              }

              seekResolve();
            } catch (error) {
              seekReject(error);
            } finally {
              videoElement.removeEventListener('seeked', handleSeeked);
            }
          };

          videoElement.addEventListener('seeked', handleSeeked);
        });

        currentTime += interval;
      }

      // Cleanup
      if (typeof videoSource !== 'string') {
        URL.revokeObjectURL(videoUrl);
      }
      videoElement.removeAttribute('src');
      videoElement.load();

      return frames;
    } catch (error) {
      const modelError = ModelErrorHandler.createModelError(error);
      modelError.type = ModelErrorType.EXTRACTION_ERROR;
      await this.errorHandler.handleError(modelError);
      throw error;
    }
  }

  public cleanup(): void {
    try {
      if (this.videoElement) {
        // Remove source and force browser to release resources
        this.videoElement.removeAttribute('src');
        this.videoElement.load();
        this.videoElement = null;
      }

      // Clear canvas and release context
      if (this.canvas && this.ctx) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.canvas.width = 0;
        this.canvas.height = 0;
      }
      
      this.canvas = null;
      this.ctx = null;
      this.isInitialized = false;
      logger.log('Cleanup completed successfully');
    } catch (error) {
      const modelError = ModelErrorHandler.createModelError(error);
      modelError.type = ModelErrorType.CLEANUP_ERROR;
      // Handle cleanup errors asynchronously to avoid blocking
      this.errorHandler.handleError(modelError)
        .catch(err => console.error('Error during cleanup:', err));
    }
  }
}
