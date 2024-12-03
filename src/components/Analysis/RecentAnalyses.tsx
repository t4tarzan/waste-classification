import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography
} from '@mui/material';
import { Analysis } from '../../types/analysis';

interface RecentAnalysesProps {
  analyses: Analysis[];
}

export const RecentAnalyses: React.FC<RecentAnalysesProps> = ({ analyses }) => {
  if (!analyses.length) {
    return (
      <Typography variant="body1" color="textSecondary">
        No recent analyses found.
      </Typography>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Waste Type</TableCell>
            <TableCell>Confidence</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {analyses.map((analysis) => (
            <TableRow key={analysis.id}>
              <TableCell>
                {analysis.timestamp.toDate().toLocaleString()}
              </TableCell>
              <TableCell>
                {analysis.result.wasteType.charAt(0).toUpperCase() + 
                 analysis.result.wasteType.slice(1)}
              </TableCell>
              <TableCell>
                {(analysis.result.confidence * 100).toFixed(1)}%
              </TableCell>
              <TableCell>{analysis.status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
