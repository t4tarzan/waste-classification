import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import WasteAnalyzer from '../components/WasteAnalyzer/WasteAnalyzer';

const WasteAnalyzerPage: React.FC = () => {
  const { currentUser } = useAuth();

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Waste Analyzer
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          {currentUser ? 
            `Welcome back, ${currentUser.email}! Upload an image to analyze waste.` :
            'Upload an image to analyze waste. Sign in to save your results!'}
        </Typography>
        <Paper sx={{ p: 3, mt: 3 }}>
          <WasteAnalyzer />
        </Paper>
      </Box>
    </Container>
  );
};

export default WasteAnalyzerPage;
