import React from 'react';
import { Box, Typography, LinearProgress, Paper, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import { AnalysisStats } from '../../types/analysis';

interface Prediction {
  category: string;
  confidence: number;
  metadata?: {
    material?: string;
    recyclable?: boolean;
    subcategories?: string[];
  };
}

interface Props {
  stats: AnalysisStats;
}

const StyledLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 20,
  borderRadius: 10,
  [`&.MuiLinearProgress-colorPrimary`]: {
    backgroundColor: theme.palette.grey[200],
  },
  [`& .MuiLinearProgress-bar`]: {
    borderRadius: 10,
  },
}));

const getProgressColor = (wasteType: string): string => {
  const colors: Record<string, string> = {
    plastic: '#2196F3',    // Blue
    paper: '#4CAF50',      // Green
    metal: '#FFC107',      // Yellow
    glass: '#9C27B0',      // Purple
    organic: '#795548',    // Brown
    other: '#607D8B',      // Blue Grey
  };
  return colors[wasteType.toLowerCase()] || colors.other;
};

export const WasteDistributionChart: React.FC<Props> = ({ stats }) => {
  const total = Object.values(stats.wasteTypeCounts).reduce((a, b) => a + b, 0);
  
  // Sort waste types by percentage (descending)
  const sortedWasteTypes = Object.entries(stats.wasteTypeCounts)
    .map(([type, count]) => ({
      type,
      count,
      percentage: (count / total) * 100
    }))
    .sort((a, b) => b.percentage - a.percentage);

  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={3}>
        {/* Waste Distribution */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Waste Distribution
          </Typography>
          {sortedWasteTypes.map(({ type, count, percentage }) => (
            <Box key={type} sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                  {type}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {percentage.toFixed(1)}% ({count} items)
                </Typography>
              </Box>
              <StyledLinearProgress
                variant="determinate"
                value={percentage}
                sx={{
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: getProgressColor(type)
                  }
                }}
              />
            </Box>
          ))}
        </Grid>

        {/* Stats Summary */}
        <Grid item xs={12}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Paper elevation={0} sx={{ p: 1.5, bgcolor: 'background.default' }}>
                <Typography variant="body2" color="text.secondary">
                  Total Analyses
                </Typography>
                <Typography variant="h6">
                  {stats.totalAnalyses}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6}>
              <Paper elevation={0} sx={{ p: 1.5, bgcolor: 'background.default' }}>
                <Typography variant="body2" color="text.secondary">
                  Avg. Confidence
                </Typography>
                <Typography variant="h6">
                  {stats.averageConfidence.toFixed(1)}%
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Grid>

        {/* Environmental Impact */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 1 }}>
            Environmental Impact
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Paper elevation={0} sx={{ p: 1.5, bgcolor: 'background.default' }}>
                <Typography variant="body2" color="text.secondary">
                  CO₂ Saved
                </Typography>
                <Typography variant="h6">
                  {stats.environmentalImpact.co2Saved.toFixed(1)}kg
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={4}>
              <Paper elevation={0} sx={{ p: 1.5, bgcolor: 'background.default' }}>
                <Typography variant="body2" color="text.secondary">
                  Water Saved
                </Typography>
                <Typography variant="h6">
                  {stats.environmentalImpact.waterSaved.toFixed(1)}L
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={4}>
              <Paper elevation={0} sx={{ p: 1.5, bgcolor: 'background.default' }}>
                <Typography variant="body2" color="text.secondary">
                  Trees Equivalent
                </Typography>
                <Typography variant="h6">
                  {stats.environmentalImpact.treesEquivalent.toFixed(1)}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};
