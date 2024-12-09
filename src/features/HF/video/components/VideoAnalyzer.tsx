import React, { useCallback, useRef, useState } from 'react';
import { Button, CircularProgress, Box, Typography } from '@mui/material';
import { FrameAnalyzer } from '../services/frameAnalyzer';
import { VideoAnalyzerProps, VideoAnalysisResult } from '../types';

const VideoAnalyzer: React.FC<VideoAnalyzerProps> = ({
  onAnalysisComplete,
  onError,
  onProgress,
  config
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const analyzerRef = useRef<FrameAnalyzer | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAnalysis = useCallback(async (file: File) => {
    try {
      setIsAnalyzing(true);
      setProgress(0);

      if (!analyzerRef.current) {
        analyzerRef.current = new FrameAnalyzer(config);
      }

      const result = await analyzerRef.current.analyzeVideo(
        file,
        (progress: number) => {
          setProgress(progress);
          onProgress?.(progress);
        }
      );

      onAnalysisComplete?.(result);
    } catch (error) {
      console.error('Video analysis error:', error);
      onError?.(error as Error);
    } finally {
      setIsAnalyzing(false);
      analyzerRef.current?.cleanup();
      analyzerRef.current = null;
    }
  }, [config, onAnalysisComplete, onError, onProgress]);

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await handleAnalysis(file);
    }
  }, [handleAnalysis]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <input
        type="file"
        accept="video/*"
        style={{ display: 'none' }}
        ref={fileInputRef}
        onChange={handleFileSelect}
      />
      
      <Button
        variant="contained"
        onClick={() => fileInputRef.current?.click()}
        disabled={isAnalyzing}
      >
        Select Video for Analysis
      </Button>

      {isAnalyzing && (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
          <CircularProgress variant="determinate" value={progress * 100} />
          <Typography variant="body2" color="text.secondary">
            Analyzing... {Math.round(progress * 100)}%
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default VideoAnalyzer;
