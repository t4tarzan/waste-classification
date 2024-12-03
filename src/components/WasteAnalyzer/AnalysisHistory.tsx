import React, { useState, useEffect } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip,
  IconButton,
  TablePagination,
  Tooltip,
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Card,
  CardMedia
} from '@mui/material';
import { Delete, Visibility } from '@mui/icons-material';
import type { Analysis } from '../../types/analysis';
import { userService } from '../../services/userService';

interface AnalysisHistoryProps {
  userId: string;
}

const formatDate = (timestamp: { seconds: number; nanoseconds: number }) => {
  const date = new Date(timestamp.seconds * 1000);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const AnalysisHistory: React.FC<AnalysisHistoryProps> = ({ userId }) => {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAnalyses = async () => {
      try {
        const results: Analysis[] = await userService.getAnalysisHistory(userId);
        setAnalyses(results.sort((a, b) => b.timestamp.seconds - a.timestamp.seconds));
      } catch (error) {
        console.error('Error fetching analysis history:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchAnalyses();
    }
  }, [userId]);

  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDelete = async (analysisId: string) => {
    try {
      await userService.deleteAnalysis(userId, analysisId);
      setAnalyses(analyses.filter(analysis => analysis.id !== analysisId));
    } catch (error) {
      console.error('Error deleting analysis:', error);
    }
  };

  const getConfidenceColor = (confidence: number): 'success' | 'warning' | 'error' => {
    if (confidence >= 0.8) return 'success';
    if (confidence >= 0.6) return 'warning';
    return 'error';
  };

  if (loading) {
    return (
      <Typography variant="body1" color="text.secondary">
        Loading analysis history...
      </Typography>
    );
  }

  if (analyses.length === 0) {
    return (
      <Typography variant="body1" color="text.secondary">
        No analysis history found.
      </Typography>
    );
  }

  return (
    <Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Image</TableCell>
              <TableCell>Waste Type</TableCell>
              <TableCell>Confidence</TableCell>
              <TableCell>Material</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {analyses
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((analysis) => (
                <TableRow key={analysis.id}>
                  <TableCell>
                    {formatDate(analysis.timestamp)}
                  </TableCell>
                  <TableCell>
                    <Box
                      component="img"
                      src={analysis.imageUrl}
                      alt="Waste"
                      sx={{
                        width: 50,
                        height: 50,
                        objectFit: 'cover',
                        cursor: 'pointer',
                        borderRadius: 1
                      }}
                      onClick={() => setSelectedImage(analysis.imageUrl)}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={analysis.result.wasteType}
                      color="primary"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={`${(analysis.result.confidence * 100).toFixed(1)}%`}
                      color={getConfidenceColor(analysis.result.confidence)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {analysis.result.metadata?.material || 'Unknown'}
                  </TableCell>
                  <TableCell>
                    <Tooltip title="View Image">
                      <IconButton
                        size="small"
                        onClick={() => setSelectedImage(analysis.imageUrl)}
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(analysis.id)}
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      <TablePagination
        component="div"
        count={analyses.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      />

      <Dialog
        open={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent>
          <Card>
            <CardMedia
              component="img"
              image={selectedImage || ''}
              alt="Analysis result"
              sx={{ maxHeight: '70vh', objectFit: 'contain' }}
            />
          </Card>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedImage(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AnalysisHistory;
