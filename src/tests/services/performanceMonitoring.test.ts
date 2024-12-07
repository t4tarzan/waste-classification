import { renderHook } from '@testing-library/react';
import { usePerformanceMonitoring } from '../../hooks/usePerformanceMonitoring';
import { performanceMonitoring } from '../../services/monitoring/performanceMonitoring';
import { getAnalytics } from 'firebase/analytics';

// Mock Firebase
jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  addDoc: jest.fn(),
  Timestamp: {
    fromDate: (date: Date) => ({ seconds: date.getTime() / 1000, nanoseconds: 0 })
  }
}));

jest.mock('firebase/analytics', () => ({
  getAnalytics: jest.fn(),
  logEvent: jest.fn()
}));

describe('usePerformanceMonitoring', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should record metrics correctly', async () => {
    await performanceMonitoring.recordMetric('test_metric', 100);
    expect(jest.mocked(getAnalytics)).toHaveBeenCalled();
  });

  it('should record model performance', async () => {
    const modelData = {
      modelName: 'test_model',
      inferenceTime: 150,
      imageSize: 1024,
      success: true
    };

    await performanceMonitoring.recordModelPerformance(modelData);
    expect(jest.mocked(getAnalytics)).toHaveBeenCalled();
  });

  it('should calculate percentiles correctly', () => {
    const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    
    expect(performanceMonitoring.calculatePercentile(values, 50)).toBe(5);
    expect(performanceMonitoring.calculatePercentile(values, 90)).toBe(9);
    expect(performanceMonitoring.calculatePercentile(values, 95)).toBe(10);
  });

  it('should handle empty arrays in percentile calculation', () => {
    expect(performanceMonitoring.calculatePercentile([], 50)).toBe(0);
  });
});
