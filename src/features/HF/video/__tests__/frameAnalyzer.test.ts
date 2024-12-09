import { FrameAnalyzer } from '../services/frameAnalyzer';
import { Frame, VideoConfig } from '../types';

// Mock window to simulate browser environment
const mockWindow = {
  URL: {
    createObjectURL: jest.fn(() => 'mock-url'),
    revokeObjectURL: jest.fn(),
  }
};
(global as any).window = mockWindow;

// Create a mock canvas context with all required methods
const mockCtx = {
  drawImage: jest.fn(),
  getImageData: jest.fn(() => ({
    data: new Uint8ClampedArray(4),
    width: 1280,
    height: 720
  })),
  putImageData: jest.fn(),
  createImageData: jest.fn(),
  scale: jest.fn(),
  translate: jest.fn(),
  fillText: jest.fn(),
  measureText: jest.fn(() => ({ width: 0 })),
  fillRect: jest.fn(),
  clearRect: jest.fn(),
} as unknown as CanvasRenderingContext2D;

// Create a mock canvas element
class MockCanvas {
  width = 1280;
  height = 720;
  style = {};
  getContext = jest.fn(() => mockCtx);
  toDataURL = jest.fn(() => 'mock-data-url');
  remove = jest.fn();
}

// Create a mock video element with event handling
class MockVideo {
  private eventListeners: { [key: string]: ((event?: any) => void)[] } = {};
  src = '';
  currentTime = 0;
  duration = 10;
  videoWidth = 1280;
  videoHeight = 720;
  playsInline = false;
  muted = false;
  autoplay = false;
  style = {};

  constructor() {
    this.reset();
  }

  reset() {
    this.src = '';
    this.currentTime = 0;
    this.duration = 10;
    this.eventListeners = {};
  }

  addEventListener(event: string, callback: (event?: any) => void, options?: any) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(callback);
  }

  removeEventListener(event: string, callback: (event?: any) => void) {
    if (this.eventListeners[event]) {
      this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback);
    }
  }

  triggerEvent(event: string, data?: any) {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach(callback => callback(data));
    }
  }

  play = jest.fn();
  pause = jest.fn();
  load = jest.fn();
  remove = jest.fn();
}

// Mock document.createElement
const mockVideo = new MockVideo();
const mockCanvas = new MockCanvas();
document.createElement = jest.fn((tagName: string) => {
  if (tagName === 'canvas') return mockCanvas as unknown as HTMLCanvasElement;
  if (tagName === 'video') return mockVideo as unknown as HTMLVideoElement;
  return null;
});

describe('FrameAnalyzer', () => {
  let frameAnalyzer: FrameAnalyzer;
  const testConfig: VideoConfig = {
    maxDuration: 30,
    frameRate: 1,
    batchSize: 5,
    confidenceThreshold: 0.5,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockVideo.reset();
    frameAnalyzer = new FrameAnalyzer(testConfig);
  });

  afterEach(() => {
    frameAnalyzer.cleanup();
  });

  describe('extractFrames', () => {
    it('should extract frames from video file', async () => {
      const mockFile = new File([''], 'test.mp4', { type: 'video/mp4' });
      const extractPromise = frameAnalyzer.extractFrames(mockFile);

      // Simulate metadata loaded
      mockVideo.triggerEvent('loadedmetadata');

      // Simulate seeking complete for each frame
      for (let i = 0; i < 10; i++) {
        mockVideo.triggerEvent('seeked');
      }

      const frames = await extractPromise;

      expect(frames).toHaveLength(10); // Based on mock video duration and frame rate
      expect(frames[0]).toHaveProperty('data', 'mock-data-url');
      expect(frames[0]).toHaveProperty('timestamp');
      expect(frames[0]).toHaveProperty('index', 0);
      expect(mockCtx.drawImage).toHaveBeenCalledTimes(10);
      expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/jpeg', 0.8);
    });

    it('should throw error if video duration exceeds maximum', async () => {
      const mockFile = new File([''], 'test.mp4', { type: 'video/mp4' });
      mockVideo.duration = 60; // Longer than maxDuration in testConfig

      const promise = frameAnalyzer.extractFrames(mockFile);
      mockVideo.triggerEvent('loadedmetadata');

      await expect(promise).rejects.toThrow('Video duration exceeds maximum allowed');
      expect(mockWindow.URL.revokeObjectURL).toHaveBeenCalled();
    });

    it('should handle video load errors', async () => {
      const mockFile = new File([''], 'test.mp4', { type: 'video/mp4' });
      const promise = frameAnalyzer.extractFrames(mockFile);
      
      mockVideo.triggerEvent('error', new Event('error'));

      await expect(promise).rejects.toThrow('Failed to load video');
      expect(mockWindow.URL.revokeObjectURL).toHaveBeenCalled();
    });
  });

  describe('analyzeFrame', () => {
    it('should analyze a single frame', async () => {
      const mockFrame: Frame = {
        data: 'mock-data-url',
        timestamp: 1000,
        index: 0,
      };

      const result = await frameAnalyzer.analyzeFrame(mockFrame);

      expect(result).toHaveProperty('timestamp', 1000);
      expect(result).toHaveProperty('predictions');
      expect(result).toHaveProperty('confidence');
      expect(Array.isArray(result.predictions)).toBe(true);
      expect(result.predictions[0]).toHaveProperty('wasteType');
      expect(result.predictions[0]).toHaveProperty('confidence');
    });
  });

  describe('analyzeBatch', () => {
    it('should analyze multiple frames in parallel', async () => {
      const mockFrames: Frame[] = Array(5)
        .fill(null)
        .map((_, index) => ({
          data: 'mock-data-url',
          timestamp: index * 1000,
          index,
        }));

      const results = await frameAnalyzer.analyzeBatch(mockFrames);

      expect(results).toHaveLength(5);
      results.forEach((result, index) => {
        expect(result.timestamp).toBe(index * 1000);
        expect(result.predictions.length).toBeGreaterThan(0);
      });
    });
  });

  describe('analyzeVideo', () => {
    it('should process entire video and return aggregated results', async () => {
      const mockFile = new File([''], 'test.mp4', { type: 'video/mp4' });
      const onProgress = jest.fn();

      const analyzePromise = frameAnalyzer.analyzeVideo(mockFile, onProgress);

      // Simulate metadata loaded
      mockVideo.triggerEvent('loadedmetadata');

      // Simulate seeking complete for each frame
      for (let i = 0; i < 10; i++) {
        mockVideo.triggerEvent('seeked');
      }

      const result = await analyzePromise;

      expect(result).toHaveProperty('frames');
      expect(result).toHaveProperty('summary');
      expect(result).toHaveProperty('timeline');
      expect(result.summary).toHaveProperty('totalFrames');
      expect(result.summary).toHaveProperty('averageConfidence');
      expect(result.summary).toHaveProperty('dominantWasteTypes');
      expect(onProgress).toHaveBeenCalled();
      expect(onProgress).toHaveBeenLastCalledWith(1);
    });

    it('should handle progress callback correctly', async () => {
      const mockFile = new File([''], 'test.mp4', { type: 'video/mp4' });
      const onProgress = jest.fn();

      const analyzePromise = frameAnalyzer.analyzeVideo(mockFile, onProgress);

      // Simulate metadata loaded
      mockVideo.triggerEvent('loadedmetadata');

      // Simulate seeking complete for each frame
      for (let i = 0; i < 10; i++) {
        mockVideo.triggerEvent('seeked');
      }

      await analyzePromise;

      const progressCalls = onProgress.mock.calls.map(call => call[0]);
      expect(progressCalls[progressCalls.length - 1]).toBe(1); // Last call should be 100%
      expect(progressCalls.every(value => value >= 0 && value <= 1)).toBe(true);
    });

    it('should handle empty analysis results', async () => {
      const mockFile = new File([''], 'test.mp4', { type: 'video/mp4' });
      mockVideo.duration = 0; // No frames to extract

      const analyzePromise = frameAnalyzer.analyzeVideo(mockFile);
      mockVideo.triggerEvent('loadedmetadata');

      await expect(analyzePromise).rejects.toThrow('No analyses to aggregate');
    });
  });
});
