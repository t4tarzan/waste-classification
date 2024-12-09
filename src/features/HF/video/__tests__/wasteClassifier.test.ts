import { WasteClassifier } from '../services/wasteClassifier';

jest.mock('@huggingface/inference', () => ({
  pipeline: jest.fn().mockImplementation(() => {
    return jest.fn().mockResolvedValue([
      { label: 'recyclable', score: 0.95 },
      { label: 'non-recyclable', score: 0.05 },
    ]);
  }),
}));

describe('WasteClassifier', () => {
  const mockApiKey = 'test-api-key';
  let classifier: WasteClassifier;

  beforeEach(() => {
    classifier = new WasteClassifier(mockApiKey);
  });

  it('should initialize successfully', async () => {
    await expect(classifier.initialize()).resolves.not.toThrow();
  });

  it('should classify an image successfully', async () => {
    await classifier.initialize();
    const mockImageData = 'base64-encoded-image-data';
    
    const results = await classifier.classifyImage(mockImageData);
    
    expect(results).toHaveLength(2);
    expect(results[0]).toHaveProperty('label', 'recyclable');
    expect(results[0]).toHaveProperty('score', 0.95);
  });

  it('should throw error if classifying before initialization', async () => {
    const mockImageData = 'base64-encoded-image-data';
    
    await expect(classifier.classifyImage(mockImageData))
      .rejects
      .toThrow('Classifier not initialized');
  });
});
