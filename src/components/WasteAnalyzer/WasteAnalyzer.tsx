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
import type { WasteType, ClassificationResult, ModelResult, Prediction } from '../../types/waste';
import type { Analysis, AnalysisStats } from '../../types/analysis';
import type { VideoAnalysisResults } from '../../types/video';
import { auth, storage, uploadToStorage, ref, listAll } from '../../config/firebase';
import { userService } from '../../services/userService';
import { guestService } from '../../services/guestService';
import { errorService, ErrorType } from '../../services/errorService';
import { WasteDistributionChart } from '../Charts/WasteDistributionChart';
import VideoTest from '../../features/HF/video/components/VideoTest';

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
  const [selectedTab, setSelectedTab] = useState(-1); 
  const [storageAvailable, setStorageAvailable] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [user, setUser] = useState(auth.currentUser);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [guestRemainingAnalyses, setGuestRemainingAnalyses] = useState<number | null>(null);
  const [loadingStates, setLoadingStates] = useState(initialLoadingState);
  const [activeModels, setActiveModels] = useState<Record<keyof ModelResults, boolean>>({
    wastenet: false,
    trashnet: false,
    taco: false
  });
  const navigate = useNavigate();
  const [videoResults, setVideoResults] = useState<VideoAnalysisResults[]>([]);

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

  useEffect(() => {
    const newActiveModels = {
      wastenet: Boolean(modelResults.wastenet && modelResults.wastenet.category !== 'error'),
      trashnet: Boolean(modelResults.trashnet && modelResults.trashnet.category !== 'error'),
      taco: Boolean(modelResults.taco && modelResults.taco.category !== 'error')
    };
    setActiveModels(newActiveModels);

    // Auto-select first working model
    if (selectedTab === -1) {
      const firstWorkingModel = Object.entries(newActiveModels)
        .find(([_, isActive]) => isActive);
      if (firstWorkingModel) {
        setSelectedTab(['wastenet', 'trashnet', 'taco'].indexOf(firstWorkingModel[0]));
      }
    }
  }, [modelResults]);

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

  const handleModelResponse = async (response: Response, modelType: keyof ModelResults) => {
    if (!response.ok) {
      if (response.status === 503) {
        // Model is loading - silently set loading state and wait
        setLoadingStates(prev => ({ ...prev, [modelType]: true }));
        // Retry after a delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        return;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    
    // Process the result based on model type
    let category = '';
    let confidence = 0;
    
    try {
      if (Array.isArray(result)) {
        const prediction = result[0];
        if (prediction) {
          if ('label' in prediction) {
            category = prediction.label.toLowerCase();
            confidence = prediction.score || 0;
          } else if ('scores' in prediction && 'labels' in prediction) {
            const maxIndex = prediction.scores.indexOf(Math.max(...prediction.scores));
            category = prediction.labels[maxIndex].toLowerCase();
            confidence = prediction.scores[maxIndex];
          }
        }
      }

      setModelResults(prev => ({
        ...prev,
        [modelType]: {
          category,
          confidence,
          metadata: {
            material: getMaterialCategory(category),
            recyclable: ['plastic', 'metal', 'paper', 'cardboard', 'glass'].includes(getMaterialCategory(category)),
            subcategories: [],
          }
        }
      }));
    } catch (error) {
      console.error(`Error processing ${modelType} result:`, error);
      // Don't update model results on error - keep previous state
    } finally {
      setLoadingStates(prev => ({ ...prev, [modelType]: false }));
    }
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
      console.error('TrashNet error:', error);
      // Don't set error state, just clear loading
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
      console.error('TACO error:', error);
      // Don't set error state, just clear loading
      setLoadingStates(prev => ({ ...prev, taco: false }));
    }
  };

  const processWasteNetModel = async (base64Image: string, apiKey: string): Promise<void> => {
    setLoadingStates(prev => ({ ...prev, wastenet: true }));
    try {
      const response = await fetch(
        'https://api-inference.huggingface.co/models/microsoft/resnet-50',
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
      console.error('WasteNet error:', error);
      // Don't set error state, just clear loading
      setLoadingStates(prev => ({ ...prev, wastenet: false }));
    }
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

  const combineModelResults = (results: ModelResults): Record<WasteType, number> => {
    const wasteTypeCounts: Record<WasteType, number> = {
      plastic: 0,
      metal: 0,
      glass: 0,
      paper: 0,
      organic: 0,
      unknown: 0,
      'non-recyclable': 0,
      hazardous: 0
    };

    // Process TrashNet results
    if (results.trashnet?.category) {
      const category = results.trashnet.category as WasteType;
      wasteTypeCounts[category] += results.trashnet.confidence || 0;
    }

    // Process TACO results
    if (results.taco?.category) {
      const category = getMaterialCategory(results.taco.category) as WasteType;
      wasteTypeCounts[category] += results.taco.confidence || 0;
    }

    // Process WasteNet results
    if (results.wastenet?.category) {
      const category = getMaterialCategory(results.wastenet.category) as WasteType;
      wasteTypeCounts[category] += results.wastenet.confidence || 0;
    }

    // Normalize the values
    const total = Object.values(wasteTypeCounts).reduce((a, b) => a + b, 0);
    if (total > 0) {
      Object.keys(wasteTypeCounts).forEach(key => {
        wasteTypeCounts[key as WasteType] /= total;
      });
    }

    return wasteTypeCounts;
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

  const calculateAverageConfidence = (results: ModelResults): number => {
    const confidences = Object.values(results)
      .filter(Boolean)
      .map(result => result.confidence || 0);
    return confidences.length > 0 
      ? confidences.reduce((a, b) => a + b, 0) / confidences.length 
      : 0;
  };

  const getEnvironmentalImpact = (results: ModelResults) => {
    // Calculate environmental impact based on waste types
    // These are placeholder calculations
    const recyclableTypes = ['plastic', 'metal', 'glass', 'paper'];
    const recyclableCount = Object.values(results)
      .filter(Boolean)
      .filter(result => recyclableTypes.includes(result.category || '')).length;

    return {
      co2Saved: recyclableCount * 2.5, // kg of CO2
      treesEquivalent: recyclableCount * 0.1,
      waterSaved: recyclableCount * 1000 // liters
    };
  };

  const combineAllResults = (imageResults: ModelResults, videoResults: VideoAnalysisResults[]): AnalysisStats => {
    // Initialize combinedCounts with all WasteType values set to 0
    const combinedCounts: Record<WasteType, number> = {
      'plastic': 0,
      'metal': 0,
      'glass': 0,
      'paper': 0,
      'organic': 0,
      'unknown': 0,
      'non-recyclable': 0,
      'hazardous': 0
    };
    let totalConfidence = 0;
    let totalItems = 0;

    // Helper function to map category to WasteType
    const mapToWasteType = (category: string): WasteType => {
      const normalized = category.toLowerCase();
      switch (normalized) {
        case 'plastic':
        case 'metal':
        case 'glass':
        case 'paper':
        case 'organic':
        case 'hazardous':
          return normalized as WasteType;
        case 'non-recyclable':
          return 'non-recyclable';
        default:
          return 'unknown';
      }
    };

    // Process image results
    Object.values(imageResults).forEach(result => {
      if (result && result.predictions) {
        result.predictions.forEach((pred: Prediction) => {
          const wasteType = mapToWasteType(pred.category);
          combinedCounts[wasteType] += 1;
          totalConfidence += pred.confidence;
          totalItems++;
        });
      }
    });

    // Process video results
    videoResults.forEach(result => {
      if (result && result.predictions) {
        result.predictions.forEach((pred: Prediction) => {
          const wasteType = mapToWasteType(pred.category);
          combinedCounts[wasteType] += 1;
          totalConfidence += pred.confidence;
          totalItems++;
        });
      }
    });

    const today = new Date().toISOString().split('T')[0];

    return {
      wasteTypeCounts: combinedCounts,
      wasteTypes: combinedCounts,
      totalAnalyses: totalItems,
      averageConfidence: totalItems > 0 ? (totalConfidence / totalItems) * 100 : 0,
      totalStorageUsed: 0,
      analysisHistory: {
        daily: [{ date: today, count: totalItems }],
        weekly: [{ date: today, count: totalItems }],
        monthly: [{ date: today, count: totalItems }]
      },
      environmentalImpact: {
        co2Saved: calculateEnvironmentalImpact(combinedCounts).co2Saved,
        waterSaved: calculateEnvironmentalImpact(combinedCounts).waterSaved,
        treesEquivalent: calculateEnvironmentalImpact(combinedCounts).energySaved * 0.0057 // Rough conversion factor
      }
    };
  };

  const calculateEnvironmentalImpact = (wasteTypeCounts: Record<string, number>) => {
    // Environmental impact factors (example values - should be adjusted based on actual data)
    const impactFactors = {
      plastic: { co2: 2.5, water: 5.0, energy: 3.0 },
      paper: { co2: 1.5, water: 2.0, energy: 1.5 },
      metal: { co2: 3.0, water: 4.0, energy: 4.0 },
      glass: { co2: 2.0, water: 1.5, energy: 2.5 },
      organic: { co2: 0.5, water: 1.0, energy: 0.5 }
    };

    let co2Saved = 0;
    let waterSaved = 0;
    let energySaved = 0;

    Object.entries(wasteTypeCounts).forEach(([type, count]) => {
      const factor = impactFactors[type as keyof typeof impactFactors];
      if (factor) {
        co2Saved += factor.co2 * count;
        waterSaved += factor.water * count;
        energySaved += factor.energy * count;
      }
    });

    return { co2Saved, waterSaved, energySaved };
  };

  if (isInitializing) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  const renderModelResult = (result?: ModelResult) => {
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

  return (
    <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto', p: 2 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Image Upload and Analysis Section */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Waste Analysis
            </Typography>
            
            {/* Upload Section */}
            <Box sx={{ mb: 3 }}>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e.target.files![0])}
                style={{ display: 'none' }}
                id="image-upload-input"
              />
              <label htmlFor="image-upload-input">
                <Button
                  variant="contained"
                  component="span"
                  startIcon={<Upload />}
                  disabled={isLoading}
                >
                  Upload Image
                </Button>
              </label>
              {(isLoading) && (
                <Box sx={{ mt: 2 }}>
                  <LinearProgress />
                </Box>
              )}
            </Box>

            {/* Image Preview and Analysis Results */}
            {selectedImage && (
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardMedia
                      component="img"
                      image={selectedImage}
                      alt="Selected waste"
                      sx={{ height: 250, objectFit: 'contain' }}
                    />
                    <CardActions>
                      <Button
                        startIcon={<DeleteOutline />}
                        onClick={handleDelete}
                        size="small"
                      >
                        Clear
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
                <Grid item xs={12} md={8}>
                  {modelResults && (
                    <Box>
                      <Tabs 
                        value={selectedTab} 
                        onChange={handleTabChange} 
                        aria-label="model results tabs"
                        sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
                      >
                        <Tab label="TrashNet" />
                        <Tab label="TACO" />
                        <Tab label="WasteNet" />
                      </Tabs>

                      <TabPanel value={selectedTab} index={0}>
                        {loadingStates.trashnet ? (
                          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                            <CircularProgress size={24} />
                          </Box>
                        ) : modelResults.trashnet ? (
                          renderModelResult(modelResults.trashnet)
                        ) : null}
                      </TabPanel>

                      <TabPanel value={selectedTab} index={1}>
                        {loadingStates.taco ? (
                          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                            <CircularProgress size={24} />
                          </Box>
                        ) : modelResults.taco ? (
                          renderModelResult(modelResults.taco)
                        ) : null}
                      </TabPanel>

                      <TabPanel value={selectedTab} index={2}>
                        {loadingStates.wastenet ? (
                          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                            <CircularProgress size={24} />
                          </Box>
                        ) : modelResults.wastenet ? (
                          renderModelResult(modelResults.wastenet)
                        ) : null}
                      </TabPanel>
                    </Box>
                  )}
                </Grid>
              </Grid>
            )}
          </Paper>
        </Grid>

        {/* Video Analysis Section */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Video Analysis
            </Typography>
            <Box sx={{ width: '100%' }}>
              <VideoTest />
            </Box>
          </Paper>
        </Grid>

        {/* Distribution Chart */}
        {(modelResults || videoResults.length > 0) && (
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Analysis Results
              </Typography>
              <WasteDistributionChart 
                stats={combineAllResults(modelResults || {}, videoResults)}
              />
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default WasteAnalyzer;
