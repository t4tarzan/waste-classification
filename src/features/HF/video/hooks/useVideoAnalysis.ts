import { useState, useCallback } from 'react';
import { VideoAnalysisResult, VideoConfig } from '../types';
import { FrameAnalyzer } from '../services/frameAnalyzer';

export const useVideoAnalysis = (config?: Partial<VideoConfig>) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<VideoAnalysisResult | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [analyzer] = useState(() => new FrameAnalyzer(config));

  const handleVideoSelect = useCallback(async (file: File) => {
    try {
      setIsAnalyzing(true);
      setError(null);
      setResult(null);
      setProgress(0);

      const analysisResult = await analyzer.analyzeVideo(file, (progress: number) => {
        setProgress(progress);
      });

      setResult(analysisResult);
      setIsAnalyzing(false);
      setProgress(1);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Video analysis failed'));
      setIsAnalyzing(false);
    }
  }, [analyzer]);

  const handleAnalysisComplete = useCallback((result: VideoAnalysisResult) => {
    setResult(result);
    setIsAnalyzing(false);
    setProgress(1);
  }, []);

  const handleError = useCallback((error: Error) => {
    setError(error);
    setIsAnalyzing(false);
  }, []);

  const handleProgress = useCallback((progress: number) => {
    setProgress(progress);
  }, []);

  const onReset = useCallback(() => {
    setIsAnalyzing(false);
    setProgress(0);
    setResult(null);
    setError(null);
  }, []);

  return {
    isAnalyzing,
    progress,
    result,
    error,
    handlers: {
      onVideoSelect: handleVideoSelect,
      onAnalysisComplete: handleAnalysisComplete,
      onError: handleError,
      onProgress: handleProgress,
      onReset
    }
  };
};
