import React, { useState, useEffect } from 'react';
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
  Grid,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress
} from '@mui/material';
import { Upload, DeleteOutline, Login, Science, Category, Analytics } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Timestamp } from 'firebase/firestore';
import type { WasteType, ClassificationResult, ModelResult } from '../../types/waste';
import type { Analysis } from '../../types/analysis';
import { auth, storage, uploadToStorage, ref, listAll } from '../../config/firebase';
import { userService } from '../../services/userService';
import { guestService } from '../../services/guestService';
import { errorService, ErrorType } from '../../services/errorService';

interface ModelResults {
  trashnet?: ModelResult;
  taco?: ModelResult;
  wastenet?: ModelResult;
}

interface WasteAnalyzerProps {
  onAnalysisComplete?: (result: ClassificationResult) => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
  'aria-labelledby'?: string;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`model-tabpanel-${index}`}
      aria-labelledby={`model-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const initialLoadingState = {
  trashnet: false,
  taco: false,
  wastenet: false
};

const initialModelResults: ModelResults = {
  trashnet: undefined,
  taco: undefined,
  wastenet: undefined
};

const WasteAnalyzer: React.FC<WasteAnalyzerProps> = ({ onAnalysisComplete }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [modelResults, setModelResults] = useState<ModelResults>(initialModelResults);
  const [selectedTab, setSelectedTab] = useState(0); 
  const [storageAvailable, setStorageAvailable] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [user, setUser] = useState(auth.currentUser);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [guestRemainingAnalyses, setGuestRemainingAnalyses] = useState<number | null>(null);
  const [loadingStates, setLoadingStates] = useState(initialLoadingState);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      setUser(auth.currentUser);
      setIsInitializing(false);
    };

    const unsubscribe = auth.onAuthStateChanged(checkAuth);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const checkStorage = async () => {
      try {
        // Check if we can access the root of the storage bucket
        const rootRef = ref(storage, 'waste-images');
        await listAll(rootRef);
        setStorageAvailable(true);
      } catch (error) {
        console.error('Storage not available:', error);
        setStorageAvailable(false);
      }
    };

    checkStorage();
  }, []);

  const handleImageUpload = async (file: File) => {
    setError(null);
    setLoadingStates(initialLoadingState);
    setModelResults(initialModelResults);

    try {
      // Upload image to Firebase Storage
      const fileName = `waste-images/${auth.currentUser?.uid || 'guest'}/${Date.now()}_${file.name}`;
      const { downloadURL } = await uploadToStorage(fileName, file);
      if (!downloadURL || typeof downloadURL !== 'string') {
        throw new Error('Failed to upload image');
      }
      setSelectedImage(downloadURL);

      // Validate Hugging Face API configuration
      const huggingFaceApiKey = process.env.REACT_APP_HUGGINGFACE_API_KEY;
      if (!huggingFaceApiKey) {
        throw new Error('Hugging Face API key is not configured');
      }

      // Convert image to base64
      const base64Image = await convertImageToBase64(file);

      // Process each model independently
      const processModels = async () => {
        // Process WasteNet first (primary model)
        try {
          await processWasteNetModel(base64Image, huggingFaceApiKey);
        } catch (error) {
          console.error('WasteNet model error:', error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          setModelResults(prev => ({
            ...prev,
            wastenet: {
              category: 'error',
              confidence: 0,
              metadata: {
                material: 'unknown',
                recyclable: false,
                subcategories: [],
                error: errorMessage
              }
            }
          }));
        }

        // Process other models in parallel
        Promise.allSettled([
          processTrashNetModel(base64Image, huggingFaceApiKey).catch(error => {
            console.error('TrashNet model error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            setModelResults(prev => ({
              ...prev,
              trashnet: {
                category: 'error',
                confidence: 0,
                metadata: {
                  material: 'unknown',
                  recyclable: false,
                  subcategories: [],
                  error: errorMessage
                }
              }
            }));
          }),
          processTacoModel(base64Image, huggingFaceApiKey).catch(error => {
            console.error('TACO model error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            setModelResults(prev => ({
              ...prev,
              taco: {
                category: 'error',
                confidence: 0,
                metadata: {
                  material: 'unknown',
                  recyclable: false,
                  subcategories: [],
                  error: errorMessage
                }
              }
            }));
          })
        ]);
      };

      await processModels();

      // Save analysis if callback provided and at least one model succeeded
      if (onAnalysisComplete && modelResults) {
        const successfulModel = modelResults.trashnet?.category !== 'error' ? modelResults.trashnet :
                              modelResults.taco?.category !== 'error' ? modelResults.taco :
                              modelResults.wastenet?.category !== 'error' ? modelResults.wastenet : null;

        if (successfulModel) {
          const result: ClassificationResult = {
            imageUrl: downloadURL,
            timestamp: Timestamp.now(),
            wasteType: successfulModel.category as WasteType,
            confidence: successfulModel.confidence,
            analysis: {
              trashnet: modelResults.trashnet,
              taco: modelResults.taco,
              wastenet: modelResults.wastenet
            }
          };
          onAnalysisComplete(result);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setError(errorMessage);
      errorService.handleError(error instanceof Error ? error : new Error(String(error)), ErrorType.ANALYSIS);
    }
  };

  const convertImageToBase64 = async (file: File): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result.split(',')[1]);
        } else {
          reject(new Error('Failed to convert image to base64'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const processTrashNetModel = async (base64Image: string, apiKey: string): Promise<void> => {
    setLoadingStates(prev => ({ ...prev, trashnet: true }));
    try {
      const response = await fetch(
        'https://api-inference.huggingface.co/models/yangy50/garbage-classification',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ inputs: base64Image })
        }
      );

      await handleModelResponse(response, 'trashnet');
    } catch (error) {
      handleModelError(error);
    } finally {
      setLoadingStates(prev => ({ ...prev, trashnet: false }));
    }
  };

  const processTacoModel = async (base64Image: string, apiKey: string): Promise<void> => {
    setLoadingStates(prev => ({ ...prev, taco: true }));
    try {
      const response = await fetch(
        'https://api-inference.huggingface.co/models/nateraw/vit-age-classifier',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ inputs: base64Image })
        }
      );

      await handleModelResponse(response, 'taco');
    } catch (error) {
      handleModelError(error);
    } finally {
      setLoadingStates(prev => ({ ...prev, taco: false }));
    }
  };

  const processWasteNetModel = async (base64Image: string, apiKey: string): Promise<void> => {
    setLoadingStates(prev => ({ ...prev, wastenet: true }));
    try {
      const response = await fetch(
        'https://api-inference.huggingface.co/models/watersplash/waste-classification',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ inputs: base64Image })
        }
      );

      await handleModelResponse(response, 'wastenet');
    } catch (error) {
      handleModelError(error);
    } finally {
      setLoadingStates(prev => ({ ...prev, wastenet: false }));
    }
  };

  const handleModelResponse = async (response: Response, modelType: keyof ModelResults): Promise<void> => {
    if (!response.ok) {
      let errorMessage = `Failed to analyze image with ${modelType} model`;
      try {
        const errorData = await response.json();
        if (errorData.error) {
          errorMessage = errorData.error;
        }
      } catch {
        // If parsing error response fails, use default message
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    let transformedData: ModelResult;

    // Transform HuggingFace response format
    if (Array.isArray(data) && data.length > 0) {
      const prediction = data[0];
      transformedData = {
        category: prediction.label,
        confidence: prediction.score,
        metadata: {
          material: prediction.label,
          recyclable: isRecyclable(prediction.label),
          subcategories: [prediction.label]
        }
      };
    } else {
      transformedData = {
        category: 'unknown',
        confidence: 0,
        metadata: {
          material: 'unknown',
          recyclable: false,
          subcategories: []
        }
      };
    }

    switch (modelType) {
      case 'taco':
        transformedData = {
          category: getMostConfidentCategory(data),
          confidence: getHighestConfidence(data),
          metadata: {
            material: getMostConfidentCategory(data),
            recyclable: isRecyclable(getMostConfidentCategory(data)),
            subcategories: getDetectedObjects(data)
          }
        };
        break;
      case 'wastenet':
        transformedData = {
          category: getMaterialCategory(data[0].label),
          confidence: data[0].score,
          metadata: {
            material: data[0].label,
            recyclable: isRecyclable(getMaterialCategory(data[0].label)),
            subcategories: [data[0].label]
          }
        };
        break;
      default:
        break;
    }

    setModelResults(prev => ({
      ...prev,
      [modelType]: transformedData
    }));
  };

  const handleModelError = (error: unknown): void => {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    setError(errorMessage);
    errorService.handleError(error instanceof Error ? error : new Error(String(error)), ErrorType.ANALYSIS);
  };

  const isRecyclable = (category: string): boolean => {
    const recyclableCategories = ['plastic', 'metal', 'paper', 'cardboard', 'glass'];
    return recyclableCategories.some(recyclable => 
      category.toLowerCase().includes(recyclable.toLowerCase())
    );
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const event = {
        target: {
          files: [file]
        }
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleImageUpload(file);
    } else {
      errorService.handleError('Please upload an image file', ErrorType.VALIDATION);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDelete = () => {
    setSelectedImage(null);
    setModelResults(initialModelResults);
    setError(null);
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  if (isInitializing) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  const renderModelResults = (result?: ModelResult) => {
    if (!result) return null;

    // If the model encountered an error
    if (result.category === 'error') {
      return (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Status</TableCell>
                <TableCell>Message</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>
                  <Chip label="Error" color="error" />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="error">
                    {result.metadata?.error || 'Model analysis failed'}
                  </Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      );
    }

    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Category</TableCell>
              <TableCell>Confidence</TableCell>
              <TableCell>Details</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>
                <Chip label={result.category} color="primary" />
              </TableCell>
              <TableCell>
                {(result.confidence * 100).toFixed(2)}%
              </TableCell>
              <TableCell>
                {result.metadata?.material && (
                  <Typography variant="body2" color="text.secondary">
                    Material: {result.metadata.material}
                    {result.metadata.recyclable !== undefined && (
                      <span>
                        {' '}
                        ({result.metadata.recyclable ? 'Recyclable' : 'Non-recyclable'})
                      </span>
                    )}
                  </Typography>
                )}
                {result.metadata?.subcategories && (
                  <Typography variant="body2" color="text.secondary">
                    Subcategories: {result.metadata.subcategories.join(', ')}
                  </Typography>
                )}
                {result.predictions && (
                  <Typography variant="body2" color="text.secondary">
                    Top alternatives: {
                      Object.entries(result.predictions)
                        .sort(([, a], [, b]) => b - a)
                        .slice(1, 3)
                        .map(([cat, conf]) => `${cat} (${(conf * 100).toFixed(1)}%)`)
                        .join(', ')
                    }
                  </Typography>
                )}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const getMostConfidentCategory = (detectionData: any): string => {
    if (!detectionData || !Array.isArray(detectionData)) return 'unknown';
    const sortedObjects = detectionData
      .sort((a: any, b: any) => b.score - a.score);
    return sortedObjects[0]?.label?.toLowerCase() || 'unknown';
  };

  const getHighestConfidence = (detectionData: any): number => {
    if (!detectionData || !Array.isArray(detectionData)) return 0;
    const sortedObjects = detectionData
      .sort((a: any, b: any) => b.score - a.score);
    return sortedObjects[0]?.score || 0;
  };

  const getDetectedObjects = (detectionData: any): string[] => {
    if (!detectionData || !Array.isArray(detectionData)) return [];
    return detectionData
      .filter((obj: any) => obj.score > 0.5)
      .map((obj: any) => obj.label.toLowerCase());
  };

  const getMaterialCategory = (label: string): string => {
    const materialMap: { [key: string]: string } = {
      'plastic': 'plastic',
      'metal': 'metal',
      'glass': 'glass',
      'paper': 'paper',
      'cardboard': 'paper',
      'organic': 'organic',
      'food': 'organic',
      'wood': 'organic'
    };

    const lowerLabel = label.toLowerCase();
    for (const [key, value] of Object.entries(materialMap)) {
      if (lowerLabel.includes(key)) {
        return value;
      }
    }
    return 'other';
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto', p: 2 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {!user && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Guest mode: {guestRemainingAnalyses} analyses remaining today. <Button color="inherit" onClick={handleLoginClick}>Sign in</Button> for unlimited analyses.
        </Alert>
      )}

      <Paper
        sx={{
          border: '2px dashed #ccc',
          borderRadius: 2,
          p: 3,
          textAlign: 'center',
          mb: 2,
          cursor: 'pointer',
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleImageUpload(e.target.files![0])}
          style={{ display: 'none' }}
          id="image-upload"
        />
        <label htmlFor="image-upload">
          <Button
            component="span"
            variant="contained"
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

      {isLoading && (
        <Box sx={{ width: '100%', mt: 2 }}>
          <LinearProgress />
        </Box>
      )}

      {selectedImage && !isLoading && (
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardMedia
                component="img"
                image={selectedImage}
                alt="Selected waste image"
                sx={{ height: 400, objectFit: 'contain' }}
              />
              <Divider />
              <CardActions>
                <IconButton onClick={handleDelete} color="error">
                  <DeleteOutline />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper>
              <Tabs
                value={selectedTab}
                onChange={handleTabChange}
                variant="fullWidth"
                sx={{ borderBottom: 1, borderColor: 'divider' }}
              >
                <Tab icon={<Analytics />} label="WasteNet" />
                <Tab icon={<Science />} label="TrashNet" />
                <Tab icon={<Category />} label="TACO" />
              </Tabs>
              <TabPanel value={selectedTab} index={0}>
                {loadingStates.wastenet ? (
                  <Box display="flex" justifyContent="center" p={3}>
                    <CircularProgress />
                  </Box>
                ) : modelResults.wastenet ? (
                  renderModelResults(modelResults.wastenet)
                ) : null}
              </TabPanel>

              <TabPanel value={selectedTab} index={1}>
                {loadingStates.trashnet ? (
                  <Box display="flex" justifyContent="center" p={3}>
                    <CircularProgress />
                  </Box>
                ) : modelResults.trashnet ? (
                  renderModelResults(modelResults.trashnet)
                ) : null}
              </TabPanel>

              <TabPanel value={selectedTab} index={2}>
                {loadingStates.taco ? (
                  <Box display="flex" justifyContent="center" p={3}>
                    <CircularProgress />
                  </Box>
                ) : modelResults.taco ? (
                  renderModelResults(modelResults.taco)
                ) : null}
              </TabPanel>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default WasteAnalyzer;
