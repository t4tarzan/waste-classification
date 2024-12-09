import { Frame, FrameAnalysis, VideoConfig, VideoAnalysisResult, ExtractFramesOptions } from '../types';
import { HFWastePrediction } from '../../types/analysis';
import { ModelError, ModelErrorType } from '../../types/errors';
import { ModelErrorHandler } from '../../services/errorHandler';
import logger from '../../../../utils/logger';
import { createCanvas } from '../../../../utils/canvasMock';

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
  private canvas: HTMLCanvasElement | any;
  private context: CanvasRenderingContext2D | null;
  private frameWidth: number;
  private frameHeight: number;
  private isInitialized: boolean;
  private errorHandler: ModelErrorHandler;

  constructor(config: Partial<VideoConfig> = {}, onNotify?: (message: string) => void) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.videoElement = null;
    this.canvas = createCanvas();
    this.canvas.width = 640;
    this.canvas.height = 480;
    this.context = this.canvas.getContext('2d');
    this.frameWidth = 640;
    this.frameHeight = 480;
    this.isInitialized = false;
    this.errorHandler = new ModelErrorHandler(onNotify);

    if (!this.context) {
      logger.error('Failed to get 2D context from canvas');
      throw new Error('Could not initialize canvas context');
    }

    this.initialize();
  }

  private initialize() {
    try {
      this.isInitialized = true;
    } catch (error) {
      const modelError = ModelErrorHandler.createModelError(error);
      modelError.type = ModelErrorType.INITIALIZATION_ERROR;
      throw modelError;
    }
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

      // Only assign to instance variables after successful creation
      this.videoElement = videoElement;
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

    if (!this.videoElement) {
      throw new Error('Video element not initialized properly');
    }
  }

  private imageDataToBase64(imageData: ImageData): string {
    try {
      // Create a temporary canvas to convert ImageData to base64
      const tempCanvas = createCanvas();
      tempCanvas.width = imageData.width;
      tempCanvas.height = imageData.height;
      const tempCtx = tempCanvas.getContext('2d');
      
      if (!tempCtx) {
        logger.error('Failed to get temporary canvas context');
        return '';
      }

      // In a browser environment, this will work with the native canvas
      // In a non-browser environment, this will use our mock implementation
      tempCtx.putImageData(imageData, 0, 0);
      
      // If we're in a mock environment, return a placeholder
      if (!(tempCanvas instanceof HTMLCanvasElement)) {
        return 'data:image/jpeg;base64,/9j/4AAQSkZJRg=='; // Empty JPEG base64
      }
      
      return tempCanvas.toDataURL('image/jpeg', 0.8);
    } catch (error) {
      logger.error('Error converting ImageData to base64:', error);
      return '';
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
              if (!this.context) {
                logger.error('Canvas context is null');
                return;
              }

              this.context.drawImage(videoElement, 0, 0, this.frameWidth, this.frameHeight);
              const imageData = this.context.getImageData(0, 0, this.frameWidth, this.frameHeight);
              const base64Data = this.imageDataToBase64(imageData);
              
              frames.push({
                data: base64Data,
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
      if (this.context) {
        this.context.clearRect(0, 0, this.frameWidth, this.frameHeight);
      }
      
      this.context = null;
      this.canvas = null;
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
