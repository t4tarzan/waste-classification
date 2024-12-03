import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Chip,
  Box,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Download, Info } from '@mui/icons-material';
import { Analysis } from '../../types/analysis';

interface AnalysisHistoryProps {
  analyses: Analysis[];
}

export const AnalysisHistory: React.FC<AnalysisHistoryProps> = ({ analyses }) => {
  const getWasteTypeColor = (wasteType: string) => {
    const colors: Record<string, string> = {
      recyclable: 'success',
      organic: 'primary',
      hazardous: 'error',
      landfill: 'warning'
    };
    return colors[wasteType] || 'default';
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(date);
  };

  if (analyses.length === 0) {
    return (
      <Typography variant="body1" color="textSecondary" align="center">
        No analysis history found. Start by analyzing your first waste item!
      </Typography>
    );
  }

  return (
    <Grid container spacing={3}>
      {analyses.map((analysis) => (
        <Grid item xs={12} sm={6} md={4} key={analysis.id}>
          <Card>
            <CardMedia
              component="img"
              height="140"
              image={analysis.imageUrl}
              alt="Waste item"
            />
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Chip
                  label={analysis.result.wasteType}
                  color={getWasteTypeColor(analysis.result.wasteType) as any}
                  size="small"
                />
                <Typography variant="caption" color="textSecondary">
                  {formatDate(analysis.timestamp)}
                </Typography>
              </Box>
              
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="body2" color="textSecondary">
                  Confidence: {(analysis.result.confidence * 100).toFixed(1)}%
                </Typography>
                <Tooltip title="View Details">
                  <IconButton size="small">
                    <Info fontSize="small" />
                  </IconButton>
                </Tooltip>
                {analysis.processedImageUrl && (
                  <Tooltip title="Download Processed Image">
                    <IconButton 
                      size="small"
                      onClick={() => analysis.processedImageUrl && window.open(analysis.processedImageUrl, '_blank')}
                    >
                      <Download fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>

              {analysis.notes && (
                <Typography variant="body2" color="text.secondary" mt={1}>
                  {analysis.notes}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};
