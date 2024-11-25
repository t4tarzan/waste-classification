import { useRef, useCallback, useState } from 'react';
import { CameraConfig } from '../types';

const defaultConfig: CameraConfig = {
  width: 1280,
  height: 720,
  facingMode: 'user'
};

export const useCamera = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isActive, setIsActive] = useState(false);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: defaultConfig,
        audio: false
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsActive(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setIsActive(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setIsActive(false);
    }
  }, []);

  const captureImage = useCallback((): string | null => {
    if (!videoRef.current || !isActive) return null;

    const canvas = document.createElement('canvas');
    canvas.width = defaultConfig.width;
    canvas.height = defaultConfig.height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg');
  }, [isActive]);

  return {
    videoRef,
    config: defaultConfig,
    isActive,
    startCamera,
    stopCamera,
    captureImage
  };
};
