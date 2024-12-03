import React from 'react';
import { Stack, Paper, Typography, Box, Divider } from '@mui/material';
import { Delete, Recycling, Warning } from '@mui/icons-material';
import { Analysis } from '../../types/analysis';
import { WasteType } from '../../types/waste';

interface AnalysisTimelineProps {
  analyses: Analysis[];
}

const getWasteIcon = (wasteType: WasteType) => {
  switch (wasteType) {
    case 'plastic':
    case 'metal':
    case 'glass':
    case 'paper':
      return <Recycling sx={{ color: getTimelineColor(wasteType) }} />;
    case 'organic':
      return <Delete sx={{ color: getTimelineColor(wasteType) }} />;
    default:
      return <Warning sx={{ color: getTimelineColor(wasteType) }} />;
  }
};

const getTimelineColor = (wasteType: WasteType): string => {
  switch (wasteType) {
    case 'plastic':
      return '#2196f3';
    case 'metal':
      return '#9e9e9e';
    case 'glass':
      return '#4caf50';
    case 'paper':
      return '#ff9800';
    case 'organic':
      return '#795548';
    default:
      return '#607d8b';
  }
};

export const AnalysisTimeline: React.FC<AnalysisTimelineProps> = ({ analyses }) => {
  return (
    <Stack spacing={2}>
      {analyses.map((analysis) => (
        <Paper
          key={analysis.id}
          sx={{
            p: 2,
            borderLeft: 4,
            borderColor: getTimelineColor(analysis.result.wasteType)
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            {getWasteIcon(analysis.result.wasteType)}
            <Box flexGrow={1}>
              <Typography variant="subtitle1">
                {analysis.result.wasteType.charAt(0).toUpperCase() + 
                 analysis.result.wasteType.slice(1)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {analysis.timestamp.toDate().toLocaleString()}
              </Typography>
              <Typography variant="body2">
                Confidence: {(analysis.result.confidence * 100).toFixed(1)}%
              </Typography>
              {analysis.notes && (
                <>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body2" color="textSecondary">
                    {analysis.notes}
                  </Typography>
                </>
              )}
            </Box>
          </Stack>
        </Paper>
      ))}
    </Stack>
  );
};
