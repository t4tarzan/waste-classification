import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  CircularProgress,
} from '@mui/material';
import { UserStatistics } from '../../types/user';

interface UsageStatisticsProps {
  statistics: UserStatistics | null;
}

export const UsageStatistics: React.FC<UsageStatisticsProps> = ({ statistics }) => {
  if (!statistics) {
    return (
      <Typography variant="body1" color="textSecondary" align="center">
        No statistics available yet.
      </Typography>
    );
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Never';
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(date);
  };

  const wasteTypeData = Object.entries(statistics.wasteTypes).map(([type, count]) => ({
    id: type,
    value: count,
    label: type.charAt(0).toUpperCase() + type.slice(1)
  }));

  const totalItems = wasteTypeData.reduce((sum, item) => sum + item.value, 0);

  // Generate colors for waste types
  const colors = [
    '#2196f3', // Blue
    '#4caf50', // Green
    '#ff9800', // Orange
    '#f44336', // Red
    '#9c27b0', // Purple
    '#00bcd4', // Cyan
    '#795548', // Brown
    '#607d8b', // Blue Grey
  ];

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Overview
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="textSecondary">
                Total Analyses
              </Typography>
              <Typography variant="h4">
                {statistics.totalAnalyses}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="textSecondary">
                Last Analysis
              </Typography>
              <Typography variant="body1">
                {formatDate(statistics.lastAnalysisDate)}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Waste Distribution
            </Typography>
            {wasteTypeData.length > 0 ? (
              <Box sx={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: 1, 
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: 200 
              }}>
                {wasteTypeData.map((data, index) => (
                  <Box
                    key={data.id}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      p: 1
                    }}
                  >
                    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                      <CircularProgress
                        variant="determinate"
                        value={(data.value / totalItems) * 100}
                        size={60}
                        sx={{ color: colors[index % colors.length] }}
                      />
                      <Box
                        sx={{
                          top: 0,
                          left: 0,
                          bottom: 0,
                          right: 0,
                          position: 'absolute',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Typography variant="caption" component="div" color="text.secondary">
                          {Math.round((data.value / totalItems) * 100)}%
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="caption" sx={{ mt: 1 }}>
                      {data.label}
                    </Typography>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="textSecondary">
                No waste type data available yet.
              </Typography>
            )}
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Waste Type Breakdown
            </Typography>
            {wasteTypeData.map(({ id, value, label }, index) => (
              <Box key={id} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2">{label}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {value} ({((value / totalItems) * 100).toFixed(1)}%)
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(value / totalItems) * 100}
                  sx={{ 
                    height: 8, 
                    borderRadius: 4,
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: colors[index % colors.length]
                    }
                  }}
                />
              </Box>
            ))}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};
