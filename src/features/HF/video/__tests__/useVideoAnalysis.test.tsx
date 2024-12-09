import { renderHook, act } from '@testing-library/react';
import { useVideoAnalysis } from '../hooks/useVideoAnalysis';

// Mock FrameAnalyzer
jest.mock('../services/frameAnalyzer', () => {
  return {
    FrameAnalyzer: jest.fn().mockImplementation(() => ({
      analyzeVideo: jest.fn().mockImplementation(async (file, onProgress) => {
        // Simulate progress updates
        onProgress?.(0.5);
        onProgress?.(1.0);
        return {
          frames: [],
          summary: {
            totalFrames: 10,
            averageConfidence: 0.9,
            dominantWasteTypes: [
              { wasteType: 'plastic', confidence: 0.9 }
            ],
            duration: 10000
          },
          timeline: []
        };
      }),
      cleanup: jest.fn()
    }))
  };
});

describe('useVideoAnalysis', () => {
  const mockFile = new File([''], 'test.mp4', { type: 'video/mp4' });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useVideoAnalysis());

    expect(result.current.isAnalyzing).toBe(false);
    expect(result.current.progress).toBe(0);
    expect(result.current.result).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should handle successful video analysis', async () => {
    const { result } = renderHook(() => useVideoAnalysis());

    await act(async () => {
      await result.current.handlers.onVideoSelect(mockFile);
    });

    expect(result.current.isAnalyzing).toBe(false);
    expect(result.current.progress).toBe(1);
    expect(result.current.result).toBeTruthy();
    expect(result.current.error).toBeNull();
  });

  it('should update progress during analysis', async () => {
    const { result } = renderHook(() => useVideoAnalysis());
    const progressValues: number[] = [];

    await act(async () => {
      await result.current.handlers.onVideoSelect(mockFile);
    });

    expect(result.current.progress).toBe(1);
  });

  it('should handle analysis error', async () => {
    const { result } = renderHook(() => useVideoAnalysis());
    const mockError = new Error('Analysis failed');

    // Mock implementation that throws error
    const originalMock = jest.requireMock('../services/frameAnalyzer');
    originalMock.FrameAnalyzer.mockImplementationOnce(() => ({
      analyzeVideo: jest.fn().mockRejectedValue(mockError),
      cleanup: jest.fn()
    }));

    await act(async () => {
      await result.current.handlers.onVideoSelect(mockFile);
    });

    expect(result.current.isAnalyzing).toBe(false);
    expect(result.current.error).toBeTruthy();
  });

  it('should reset state correctly', () => {
    const { result } = renderHook(() => useVideoAnalysis());

    act(() => {
      result.current.handlers.onReset();
    });

    expect(result.current.isAnalyzing).toBe(false);
    expect(result.current.progress).toBe(0);
    expect(result.current.result).toBeNull();
    expect(result.current.error).toBeNull();
  });
});
