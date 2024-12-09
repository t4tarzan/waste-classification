import { FrameAnalyzer } from '../services/frameAnalyzer';
import { WasteClassifier, ClassificationResult } from '../services/wasteClassifier';
import { HFWastePrediction } from '../../types/analysis';
import { Frame } from '../types';

// Increase Jest timeout for all tests in this file
jest.setTimeout(30000);

// Mock the environment variable
process.env.REACT_APP_HUGGINGFACE_API_KEY = 'mock-api-key';

// Create mock response
const mockClassificationResults: ClassificationResult[] = [
  { label: 'organic', score: 0.8 },
  { label: 'recyclable', score: 0.2 }
];

// Create a mock video blob
function createMockVideoBlob(): Blob {
  return new Blob(['mock video data'], { type: 'video/mp4' });
}

describe('Waste Classification Integration Test', () => {
  let frameAnalyzer: FrameAnalyzer;
  let wasteClassifier: WasteClassifier;
  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    // Setup fetch spy
    fetchSpy = jest.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockClassificationResults)
      } as Response)
    );
    
    frameAnalyzer = new FrameAnalyzer();
    wasteClassifier = new WasteClassifier();
  });

  afterEach(() => {
    // Restore all mocks
    fetchSpy.mockRestore();
  });

  it('should analyze video frames and classify waste', async () => {
    // Initialize frame analyzer
    await frameAnalyzer.initializeElements();

    // Create a mock video blob
    const mockVideoBlob = createMockVideoBlob();
    
    // Extract frames with reduced frame rate
    const frames = await frameAnalyzer.extractFrames(mockVideoBlob, {
      framesPerSecond: 0.5, // Only extract 1 frame every 2 seconds
      maxFrames: 2, // Limit to just 2 frames for faster testing
      onProgress: (progress) => {
        console.log(`Frame extraction progress: ${progress}%`);
      },
    });

    // Verify frames were extracted
    expect(frames).toBeDefined();
    expect(frames.length).toBeGreaterThan(0);
    expect(frames.length).toBeLessThanOrEqual(2);

    // Verify frame structure
    frames.forEach(frame => {
      expect(frame).toHaveProperty('data');
      expect(frame).toHaveProperty('timestamp');
      expect(frame).toHaveProperty('index');
      expect(frame.data).toContain('data:image/jpeg;base64,');
    });

    // Classify each frame
    const classifications = await Promise.all(
      frames.map(frame => wasteClassifier.classifyImage(frame.data))
    );

    // Verify fetch was called with correct parameters
    expect(fetchSpy).toHaveBeenCalledTimes(frames.length);
    fetchSpy.mock.calls.forEach(call => {
      const [url, options] = call;
      expect(url).toBe('https://api-inference.huggingface.co/models/watersplash/waste-classification');
      expect(options).toMatchObject({
        method: 'POST',
        headers: {
          'Authorization': 'Bearer mock-api-key',
          'Content-Type': 'application/json'
        }
      });
    });

    // Verify classifications
    expect(classifications).toBeDefined();
    expect(classifications.length).toBeGreaterThan(0);
    expect(classifications.length).toBeLessThanOrEqual(2);
    
    // Each classification should have results
    classifications.forEach((result) => {
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('label');
      expect(result[0]).toHaveProperty('score');
      expect(result[0].label).toBe('organic');
      expect(result[0].score).toBe(0.8);
      expect(result[1].label).toBe('recyclable');
      expect(result[1].score).toBe(0.2);
    });
  });
});
