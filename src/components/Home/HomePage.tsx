import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  IconButton,
  Card,
  CardContent,
  LinearProgress,
  Chip
} from '@mui/material';
import { Upload, DeleteOutline } from '@mui/icons-material';
import { WasteType, ClassificationResult } from '../../types';

const wasteTypeColors: Record<WasteType, string> = {
  dry: '#4caf50',
  wet: '#2196f3',
  plastic: '#ff9800',
  hazardous: '#f44336',
  unknown: '#757575'
};

export const HomePage: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [results, setResults] = useState<ClassificationResult | null>(null);

  // Temporary mock classification for testing
  const mockClassify = async (image: string) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    return {
      wasteType: 'plastic' as WasteType,
      confidence: 0.85,
      timestamp: new Date(),
      imageUrl: image
    };
  };

  const handleImageUpload = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const imageData = e.target?.result as string;
      setSelectedImage(imageData);
      const result = await mockClassify(imageData);
      setResults(result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleImageUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setResults(null);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Waste Classification System
      </Typography>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              height: 400,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              border: isDragging ? '2px dashed #2196f3' : '2px dashed #ccc',
              bgcolor: isDragging ? 'rgba(33, 150, 243, 0.1)' : 'background.paper',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden'
            }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            {selectedImage ? (
              <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
                <img
                  src={selectedImage}
                  alt="Uploaded waste"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain'
                  }}
                />
                <IconButton
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    bgcolor: 'rgba(0, 0, 0, 0.5)',
                    '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.7)' }
                  }}
                  onClick={clearImage}
                >
                  <DeleteOutline sx={{ color: 'white' }} />
                </IconButton>
              </Box>
            ) : (
              <>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileInput}
                  style={{ display: 'none' }}
                  id="image-upload"
                />
                <label htmlFor="image-upload">
                  <Box sx={{ textAlign: 'center' }}>
                    <Upload sx={{ fontSize: 60, color: 'text.secondary' }} />
                    <Typography variant="h6" color="text.secondary">
                      Drag & Drop or Click to Upload
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Supports: JPG, PNG, JPEG
                    </Typography>
                  </Box>
                </label>
              </>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          {results ? (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Classification Results
                </Typography>
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Waste Type
                  </Typography>
                  <Chip
                    label={results.wasteType.toUpperCase()}
                    sx={{
                      bgcolor: wasteTypeColors[results.wasteType],
                      color: 'white',
                      fontSize: '1rem',
                      py: 1
                    }}
                  />
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Confidence Level
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <LinearProgress
                      variant="determinate"
                      value={results.confidence * 100}
                      sx={{
                        height: 10,
                        borderRadius: 5,
                        flexGrow: 1,
                        bgcolor: 'grey.200',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: wasteTypeColors[results.wasteType]
                        }
                      }}
                    />
                    <Typography variant="body1">
                      {(results.confidence * 100).toFixed(1)}%
                    </Typography>
                  </Box>
                </Box>

                <Typography variant="subtitle1" gutterBottom>
                  Timestamp
                </Typography>
                <Typography variant="body1">
                  {results.timestamp.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          ) : (
            <Paper
              sx={{
                p: 3,
                height: 400,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'grey.100'
              }}
            >
              <Typography variant="h6" color="text.secondary" align="center">
                Upload an image to see classification results
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};
