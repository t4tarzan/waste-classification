import { useCallback } from 'react';
import { performanceMonitoring } from '../services/monitoring/performanceMonitoring';

export const usePerformanceMonitoring = () => {
  const measureModelInference = useCallback(async (
    modelName: string,
    operation: () => Promise<any>
  ) => {
    const startTime = performance.now();
    try {
      const result = await operation();
      const endTime = performance.now();
      
      await performanceMonitoring.recordModelPerformance({
        modelName,
        inferenceTime: endTime - startTime,
        imageSize: 0, // This will be set by the caller
        success: true
      });
      
      return result;
    } catch (error) {
      const endTime = performance.now();
      
      await performanceMonitoring.recordModelPerformance({
        modelName,
        inferenceTime: endTime - startTime,
        imageSize: 0,
        success: false,
        errorType: error instanceof Error ? error.message : 'Unknown error'
      });
      
      throw error;
    }
  }, []);

  const measureImageProcessing = useCallback(async (
    operation: () => Promise<any>,
    imageSize: number
  ) => {
    const startTime = performance.now();
    try {
      const result = await operation();
      const endTime = performance.now();
      
      await performanceMonitoring.recordImageProcessingTime(
        endTime - startTime,
        imageSize
      );
      
      return result;
    } catch (error) {
      throw error;
    }
  }, []);

  const measureApiCall = useCallback(async (
    apiName: string,
    operation: () => Promise<any>
  ) => {
    const startTime = performance.now();
    try {
      const result = await operation();
      const endTime = performance.now();
      
      await performanceMonitoring.recordApiLatency(
        apiName,
        endTime - startTime,
        true
      );
      
      return result;
    } catch (error) {
      const endTime = performance.now();
      
      await performanceMonitoring.recordApiLatency(
        apiName,
        endTime - startTime,
        false
      );
      
      throw error;
    }
  }, []);

  return {
    measureModelInference,
    measureImageProcessing,
    measureApiCall
  };
};
