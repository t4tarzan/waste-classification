import React, { useState } from 'react';
import { FrameAnalyzer } from '../services/frameAnalyzer';
import { VideoAnalysisResult } from '../types';
import {
  Box,
  Container,
  Paper,
  Typography,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Button,
  Card,
  CardMedia,
  CardContent,
} from '@mui/material';
import { styled } from '@mui/material/styles';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const FrameScroller = styled(Box)(({ theme }) => ({
  display: 'flex',
  overflowX: 'auto',
  gap: theme.spacing(2),
  padding: theme.spacing(2),
  '&::-webkit-scrollbar': {
    height: 8,
  },
  '&::-webkit-scrollbar-track': {
    background: theme.palette.grey[200],
    borderRadius: 4,
  },
  '&::-webkit-scrollbar-thumb': {
    background: theme.palette.primary.main,
    borderRadius: 4,
  },
}));

const VideoTest: React.FC = () => {
  const [result, setResult] = useState<VideoAnalysisResult | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setError('');
      setIsProcessing(true);
      setProgress(0);
      
      const analyzer = new FrameAnalyzer({
        frameRate: 1,
        maxFrames: 10,
        batchSize: 2
      });

      const analysisResult = await analyzer.analyzeVideo(file, (progress) => {
        setProgress(Math.round(progress));
      });

      setResult(analysisResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Video Waste Analysis
        </Typography>
        
        <Box sx={{ mb: 4 }}>
          <Button
            component="label"
            variant="contained"
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Upload Video'}
            <VisuallyHiddenInput
              type="file"
              accept="video/*"
              onChange={handleVideoUpload}
            />
          </Button>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            For best results, use a video that is 10-15 seconds long. The analyzer will extract 1 frame per second.
          </Typography>
        </Box>

        {progress > 0 && progress < 100 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Processing: {progress}%
            </Typography>
            <LinearProgress variant="determinate" value={progress} />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}

        {result && (
          <>
            <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
              Analysis Results
            </Typography>
            
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Frame Analysis
              </Typography>
              <FrameScroller>
                {result.frames.map((frameAnalysis, index) => (
                  <Card key={index} sx={{ minWidth: 250, flexShrink: 0 }}>
                    <CardMedia
                      component="img"
                      height="140"
                      image={frameAnalysis.frame.data}
                      alt={`Frame ${frameAnalysis.frame.index}`}
                    />
                    <CardContent>
                      <Typography variant="body2" color="text.secondary">
                        Frame {frameAnalysis.frame.index}
                        <br />
                        Time: {(frameAnalysis.frame.timestamp / 1000).toFixed(2)}s
                        <br />
                        Confidence: {(frameAnalysis.confidence * 100).toFixed(1)}%
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </FrameScroller>
            </Box>

            <Typography variant="h6" gutterBottom>
              Waste Classification Summary
            </Typography>
            <TableContainer component={Paper} sx={{ mb: 4 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Waste Type</TableCell>
                    <TableCell align="right">Confidence</TableCell>
                    <TableCell align="right">Detected in Frames</TableCell>
                    <TableCell align="right">Detection Rate</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {result.summary.dominantWasteTypes.map((type, index) => (
                    <TableRow key={index}>
                      <TableCell component="th" scope="row">
                        {type.wasteType}
                      </TableCell>
                      <TableCell align="right">
                        {(type.confidence * 100).toFixed(1)}%
                      </TableCell>
                      <TableCell align="right">
                        {type.count}
                      </TableCell>
                      <TableCell align="right">
                        {((type.count / result.summary.totalFrames) * 100).toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" gutterBottom>
                Analysis Overview
              </Typography>
              <Typography variant="body2">
                • Total Frames Analyzed: {result.summary.totalFrames}
                <br />
                • Average Confidence: {(result.summary.averageConfidence * 100).toFixed(1)}%
              </Typography>
            </Box>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default VideoTest;
