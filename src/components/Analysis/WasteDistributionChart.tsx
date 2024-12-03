import React from 'react';
import { Box } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { WasteType } from '../../types/waste';
import { AnalysisStats } from '../../types/analysis';

interface WasteDistributionChartProps {
  stats: AnalysisStats;
}

const COLORS: Record<WasteType, string> = {
  plastic: '#2196f3', // Blue
  metal: '#9e9e9e',  // Grey
  glass: '#4caf50',  // Green
  paper: '#ff9800',  // Orange
  organic: '#795548', // Brown
  unknown: '#607d8b'  // Blue Grey
};

export const WasteDistributionChart: React.FC<WasteDistributionChartProps> = ({ stats }) => {
  const chartData = Object.entries(stats.wasteTypeCounts).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value
  }));

  const total = Object.values(stats.wasteTypeCounts).reduce((sum, value) => sum + value, 0);

  return (
    <Box sx={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, value }) => 
              total > 0 ? `${name} ${((value / total) * 100).toFixed(0)}%` : ''
            }
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[entry.name.toLowerCase() as WasteType]} 
              />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => [
            `${value} items (${((value / total) * 100).toFixed(1)}%)`,
            'Count'
          ]} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Box>
  );
};
