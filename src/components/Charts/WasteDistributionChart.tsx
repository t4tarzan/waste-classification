import React from 'react';
import { Box, useTheme } from '@mui/material';
import { PieChart } from '@mui/x-charts';
import { AnalysisStats } from '../../types/analysis';
import { WasteType } from '../../types/waste';

interface WasteDistributionChartProps {
  stats: AnalysisStats;
}

export const WasteDistributionChart: React.FC<WasteDistributionChartProps> = ({ stats }) => {
  const theme = useTheme();

  const wasteTypeColors: Record<WasteType, string> = {
    plastic: '#2196f3',    // Blue
    metal: '#9e9e9e',      // Grey
    glass: '#4fc3f7',      // Light Blue
    paper: '#4caf50',      // Green
    organic: '#8bc34a',    // Light Green
    unknown: '#ff9800',    // Orange
    'non-recyclable': '#f44336',  // Red
    'hazardous': '#d32f2f' // Dark Red
  };

  const data = Object.entries(stats.wasteTypeCounts).map(([type, count]) => ({
    id: type,
    value: count as number,
    label: type.charAt(0).toUpperCase() + type.slice(1),
    color: wasteTypeColors[type as WasteType]
  })).filter(item => item.value > 0);

  if (data.length === 0) {
    return (
      <Box sx={{ 
        height: 300, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: theme.palette.text.secondary 
      }}>
        No waste distribution data available
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', height: 300 }}>
      <PieChart
        series={[
          {
            data,
            highlightScope: { faded: 'global', highlighted: 'item' },
            faded: { innerRadius: 30, additionalRadius: -30 },
          },
        ]}
        slotProps={{
          legend: {
            direction: 'row',
            position: { vertical: 'bottom', horizontal: 'middle' },
            padding: 0,
          },
        }}
      />
    </Box>
  );
};
