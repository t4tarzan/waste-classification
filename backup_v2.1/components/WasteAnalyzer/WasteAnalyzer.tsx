import React from 'react';
import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Paper,
  Alert,
  IconButton,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Divider,
} from '@mui/material';
import { Upload, DeleteOutline, Login } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Timestamp } from 'firebase/firestore';
import type { WasteType, ClassificationResult } from '../../types/waste';
import type { Analysis } from '../../types/analysis';
import StorageFilesViewer from '../StorageFiles/StorageFilesViewer';
import { auth, storage, uploadToStorage } from '../../config/firebase';
import { userService } from '../../services/userService';
import { guestService } from '../../services/guestService';

// Utility function to create a synthetic change event
const createChangeEvent = (file: File): React.ChangeEvent<HTMLInputElement> => {
  const element = document.createElement('input');
  element.type = 'file';
  const dataTransfer = new DataTransfer();
  dataTransfer.items.add(file);
  element.files = dataTransfer.files;

  return {
    target: element,
    currentTarget: element,
    preventDefault: () => {},
    stopPropagation: () => {},
    bubbles: true,
    cancelable: true,
    timeStamp: Date.now(),
    nativeEvent: new Event('change'),
    type: 'change',
    isTrusted: true,
    defaultPrevented: false,
    isDefaultPrevented: () => false,
    isPropagationStopped: () => false,
  } as unknown as React.ChangeEvent<HTMLInputElement>;
};

interface WasteAnalyzerProps {
  onAnalysisComplete?: (result: ClassificationResult) => void;
}

const WasteAnalyzer: React.FC<WasteAnalyzerProps> = ({ onAnalysisComplete }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [results, setResults] = useState<ClassificationResult | null>(null);
  const [storageAvailable, setStorageAvailable] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [user, setUser] = useState(auth.currentUser);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [guestRemainingAnalyses, setGuestRemainingAnalyses] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const initializeStorage = async () => {
      if (!user) {
        setStorageAvailable(false);
        setGuestRemainingAnalyses(guestService.getRemainingAnalyses());
        return;
      }

      try {
        // eslint-disable-next-line no-console
        console.log('Starting storage initialization...');
        if (storage) {
          if (mounted) {
            setStorageAvailable(true);
            setError(null);
          }
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Storage initialization failed:', error);
        if (mounted) {
          setStorageAvailable(false);
          setError('Storage service is temporarily unavailable. Please try again later.');
        }
      }
    };

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (mounted) {
        setUser(user);
        if (user) {
          initializeStorage().finally(() => {
            if (mounted) {
              setIsInitializing(false);
            }
          });
        } else {
          setIsInitializing(false);
          setStorageAvailable(false);
        }
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check guest limits if not logged in
    if (!user && !guestService.canPerformAnalysis()) {
      setError('Daily limit reached. Please sign in to analyze more images.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please upload an image file');
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB');
      }

      let downloadURL: string;
      let mockResult: ClassificationResult;

      if (user) {
        // Logged in user flow
        const fileName = `waste-images/${user.uid}/${Date.now()}_${file.name}`;
        const uploadResult = await uploadToStorage(fileName, file);
        downloadURL = uploadResult.downloadURL;

        mockResult = {
          wasteType: 'plastic' as WasteType,
          confidence: 0.85,
          imageUrl: downloadURL,
          timestamp: Timestamp.fromDate(new Date()),
        };

        const analysisResult: Analysis = {
          id: '', // Will be set by Firestore
          userId: user.uid,
          imageUrl: downloadURL,
          result: mockResult,
          timestamp: Timestamp.fromDate(new Date()),
          status: 'completed'
        };

        await userService.saveAnalysisResult(user.uid, analysisResult);
      } else {
        // Guest user flow
        downloadURL = URL.createObjectURL(file);
        mockResult = await guestService.performAnalysis(downloadURL);
        guestService.storeAnalysis(downloadURL, mockResult);
        setGuestRemainingAnalyses(guestService.getRemainingAnalyses());
      }

      setSelectedImage(downloadURL);
      setResults(mockResult);
      if (onAnalysisComplete) {
        onAnalysisComplete(mockResult);
      }

      setError(null);
    } catch (error) {
      console.error('Error uploading file:', error);
      setError(error instanceof Error ? error.message : 'Failed to upload image. Please try again.');
      setSelectedImage(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFileUpload(createChangeEvent(file));
    } else {
      setError('Please upload an image file');
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(e);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setResults(null);
  };

  if (isInitializing) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return (
      <Box>
        <Alert severity="info" sx={{ mb: 2 }}>
          Guest mode: {guestRemainingAnalyses} analyses remaining today. 
          <Button
            size="small"
            startIcon={<Login />}
            onClick={() => navigate('/login')}
            sx={{ ml: 2 }}
          >
            Sign in for more
          </Button>
        </Alert>
        
        <Paper
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          sx={{
            p: 3,
            mb: 3,
            textAlign: 'center',
            backgroundColor: '#f5f5f5',
            border: '2px dashed #ccc',
            cursor: 'pointer',
          }}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            style={{ display: 'none' }}
            id="image-upload"
          />
          <label htmlFor="image-upload">
            <Button
              component="span"
              variant="contained"
              color="primary"
              startIcon={<Upload />}
              disabled={isLoading || guestRemainingAnalyses === 0}
            >
              {isLoading ? 'Uploading...' : 'Upload Image'}
            </Button>
          </label>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            or drag and drop an image here
          </Typography>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {selectedImage && (
          <Card sx={{ mb: 3 }}>
            <CardMedia
              component="img"
              image={selectedImage}
              alt="Selected waste"
              sx={{ height: 300, objectFit: 'contain' }}
            />
            <CardContent>
              {results && (
                <>
                  <Typography variant="h6" gutterBottom>
                    Analysis Results
                  </Typography>
                  <Typography>
                    Waste Type: {results.wasteType}
                  </Typography>
                  <Typography>
                    Confidence: {(results.confidence * 100).toFixed(1)}%
                  </Typography>
                </>
              )}
            </CardContent>
            <CardActions>
              <IconButton onClick={clearImage} color="error">
                <DeleteOutline />
              </IconButton>
            </CardActions>
          </Card>
        )}
      </Box>
    );
  }

  return (
    <Box>
      <Paper
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        sx={{
          p: 3,
          mb: 3,
          textAlign: 'center',
          backgroundColor: '#f5f5f5',
          border: '2px dashed #ccc',
          cursor: 'pointer',
        }}
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          style={{ display: 'none' }}
          id="image-upload"
        />
        <label htmlFor="image-upload">
          <Button
            component="span"
            variant="contained"
            color="primary"
            startIcon={<Upload />}
            disabled={isLoading}
          >
            {isLoading ? 'Uploading...' : 'Upload Image'}
          </Button>
        </label>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
          or drag and drop an image here
        </Typography>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {selectedImage && (
        <Card sx={{ mb: 3 }}>
          <CardMedia
            component="img"
            image={selectedImage}
            alt="Selected waste"
            sx={{ height: 300, objectFit: 'contain' }}
          />
          <CardContent>
            {results && (
              <>
                <Typography variant="h6" gutterBottom>
                  Analysis Results
                </Typography>
                <Typography>
                  Waste Type: {results.wasteType}
                </Typography>
                <Typography>
                  Confidence: {(results.confidence * 100).toFixed(1)}%
                </Typography>
              </>
            )}
          </CardContent>
          <CardActions>
            <IconButton onClick={clearImage} color="error">
              <DeleteOutline />
            </IconButton>
          </CardActions>
        </Card>
      )}

      {storageAvailable && user && (
        <Box mt={4}>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Recent Uploads
          </Typography>
          <StorageFilesViewer userId={user.uid} />
        </Box>
      )}
    </Box>
  );
};

export default WasteAnalyzer;
