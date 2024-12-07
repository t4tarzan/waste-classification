import { renderHook } from '@testing-library/react';
import { usePerformanceMonitoring } from '../../hooks/usePerformanceMonitoring';
import { performanceMonitoring } from '../../services/monitoring/performanceMonitoring';

// Mock the performance monitoring service
jest.mock('../../services/monitoring/performanceMonitoring', () => ({
  performanceMonitoring: {
    recordModelPerformance: jest.fn(),
    recordImageProcessingTime: jest.fn(),
    recordApiLatency: jest.fn(),
  }
}));

describe('usePerformanceMonitoring', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should measure successful model inference', async () => {
    const { result } = renderHook(() => usePerformanceMonitoring());
    const mockOperation = jest.fn().mockResolvedValue('success');

    await result.current.measureModelInference('testModel', mockOperation);

    expect(mockOperation).toHaveBeenCalled();
    expect(performanceMonitoring.recordModelPerformance).toHaveBeenCalledWith(
      expect.objectContaining({
        modelName: 'testModel',
        success: true
      })
    );
  });

  it('should measure failed model inference', async () => {
    const { result } = renderHook(() => usePerformanceMonitoring());
    const mockOperation = jest.fn().mockRejectedValue(new Error('test error'));

    await expect(
      result.current.measureModelInference('testModel', mockOperation)
    ).rejects.toThrow('test error');

    expect(performanceMonitoring.recordModelPerformance).toHaveBeenCalledWith(
      expect.objectContaining({
        modelName: 'testModel',
        success: false,
        errorType: 'test error'
      })
    );
  });

  it('should measure image processing time', async () => {
    const { result } = renderHook(() => usePerformanceMonitoring());
    const mockOperation = jest.fn().mockResolvedValue('success');

    await result.current.measureImageProcessing(mockOperation, 1024);

    expect(mockOperation).toHaveBeenCalled();
    expect(performanceMonitoring.recordImageProcessingTime).toHaveBeenCalled();
  });

  it('should measure API latency', async () => {
    const { result } = renderHook(() => usePerformanceMonitoring());
    const mockOperation = jest.fn().mockResolvedValue('success');

    await result.current.measureApiCall('testApi', mockOperation);

    expect(mockOperation).toHaveBeenCalled();
    expect(performanceMonitoring.recordApiLatency).toHaveBeenCalledWith(
      'testApi',
      expect.any(Number),
      true
    );
  });
});
