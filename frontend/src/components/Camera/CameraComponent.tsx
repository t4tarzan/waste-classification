import React, { useEffect } from 'react';
import { Box, Button, Paper } from '@mui/material';
import { PhotoCamera, Stop } from '@mui/icons-material';
import { useCamera } from '../../hooks/useCamera';

interface CameraComponentProps {
  onCapture: (imageData: string) => void;
}

export const CameraComponent: React.FC<CameraComponentProps> = ({ onCapture }) => {
  const { config, videoRef, startCamera, stopCamera, captureImage, isActive } = useCamera();

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  const handleCapture = () => {
    const imageData = captureImage();
    if (imageData) {
      onCapture(imageData);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 2, maxWidth: 800, mx: 'auto' }}>
      <Box sx={{ position: 'relative' }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          style={{
            width: '100%',
            maxHeight: '60vh',
            objectFit: 'contain'
          }}
        />
        <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<PhotoCamera />}
            onClick={handleCapture}
            disabled={!isActive}
          >
            Capture
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<Stop />}
            onClick={stopCamera}
            disabled={!isActive}
          >
            Stop Camera
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};
