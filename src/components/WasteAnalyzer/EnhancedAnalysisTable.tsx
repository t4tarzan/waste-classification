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
  IconButton,
  Tooltip,
  Typography,
  TablePagination,
  TableSortLabel,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Button,
  Chip,
  Stack,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent
} from '@mui/material';
import { Visibility, Delete } from '@mui/icons-material';
import { Timestamp } from 'firebase/firestore';
import { Analysis } from '../../types/analysis';
import { WasteType } from '../../types/waste';
import { userService } from '../../services/userService';

interface EnhancedAnalysisTableProps {
  userId: string;
}

type SortableField = 'timestamp' | 'result' | 'tacoResult' | 'wastenetResult';

interface HeadCell {
  id: SortableField | 'imageUrl' | 'actions';
  label: string;
  sortable: boolean;
  width?: number;
}

interface ModelResult {
  category?: string;
  confidence: number;
  metadata?: {
    material?: string;
    recyclable?: boolean;
  };
  wasteType?: WasteType;
}

interface ExtendedAnalysis extends Analysis {
  tacoResult?: ModelResult;
  wastenetResult?: ModelResult;
}

const headCells: HeadCell[] = [
  { id: 'timestamp', label: 'Date', sortable: true },
  { id: 'imageUrl', label: 'Image', sortable: false, width: 80 },
  { id: 'result', label: 'TrashNet', sortable: true },
  { id: 'tacoResult', label: 'TACO', sortable: true },
  { id: 'wastenetResult', label: 'WasteNet', sortable: true },
  { id: 'actions', label: 'Actions', sortable: false, width: 120 }
];

type Order = 'asc' | 'desc';
type FilterModel = 'all' | 'trashnet' | 'taco' | 'wastenet';

const formatDate = (timestamp: Timestamp): string => {
  const date = timestamp.toDate();
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const getConfidenceColor = (confidence: number): 'success' | 'warning' | 'error' => {
  if (confidence >= 0.8) return 'success';
  if (confidence >= 0.6) return 'warning';
  return 'error';
};

const EnhancedAnalysisTable: React.FC<EnhancedAnalysisTableProps> = ({ userId }) => {
  const [analyses, setAnalyses] = useState<ExtendedAnalysis[]>([]);
  const [filteredAnalyses, setFilteredAnalyses] = useState<ExtendedAnalysis[]>([]);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [order, setOrder] = useState<Order>('desc');
  const [orderBy, setOrderBy] = useState<SortableField>('timestamp');
  const [filterModel, setFilterModel] = useState<FilterModel>('all');
  const [filterConfidence, setFilterConfidence] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    const fetchAnalyses = async () => {
      if (!userId) return;
      
      try {
        const results = await userService.getAnalysisHistory(userId);
        const typedResults = results.map(result => ({
          ...result,
          result: {
            ...result.result,
            confidence: result.result?.confidence || 0
          }
        })) as ExtendedAnalysis[];
        
        setAnalyses(typedResults);
        setFilteredAnalyses(typedResults);
      } catch (error) {
        console.error('Error fetching analysis history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyses();
  }, [userId]);

  useEffect(() => {
    let filtered = [...analyses];

    // Apply model filter
    if (filterModel !== 'all') {
      filtered = filtered.filter(analysis => {
        const result = filterModel === 'trashnet' 
          ? analysis.result 
          : filterModel === 'taco' 
            ? analysis.tacoResult 
            : analysis.wastenetResult;
        return result && result.confidence >= filterConfidence;
      });
    }

    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(analysis => {
        const trashnetType = analysis.result?.wasteType?.toLowerCase() || '';
        const tacoType = analysis.tacoResult?.category?.toLowerCase() || '';
        const wastenetType = analysis.wastenetResult?.category?.toLowerCase() || '';
        return (
          trashnetType.includes(term) ||
          tacoType.includes(term) ||
          wastenetType.includes(term)
        );
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      if (orderBy === 'timestamp') {
        comparison = (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0);
      } else {
        const aResult = orderBy === 'result' ? a.result : orderBy === 'tacoResult' ? a.tacoResult : a.wastenetResult;
        const bResult = orderBy === 'result' ? b.result : orderBy === 'tacoResult' ? b.tacoResult : b.wastenetResult;
        comparison = (bResult?.confidence || 0) - (aResult?.confidence || 0);
      }
      return order === 'desc' ? comparison : -comparison;
    });

    setFilteredAnalyses(filtered);
    setPage(0);
  }, [analyses, filterModel, filterConfidence, searchTerm, order, orderBy]);

  const handleRequestSort = (property: SortableField) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterModelChange = (event: SelectChangeEvent<FilterModel>) => {
    setFilterModel(event.target.value as FilterModel);
  };

  const handleFilterConfidenceChange = (event: SelectChangeEvent<number>) => {
    setFilterConfidence(Number(event.target.value));
  };

  const handleDelete = async (analysisId: string) => {
    if (!userId || !analysisId) return;

    try {
      await userService.deleteAnalysis(userId, analysisId);
      setAnalyses(prev => prev.filter(analysis => analysis.id !== analysisId));
    } catch (error) {
      console.error('Error deleting analysis:', error);
    }
  };

  const renderModelResult = (result: ModelResult | undefined, modelType: FilterModel) => {
    if (!result || typeof result.confidence !== 'number') return null;

    const label = modelType === 'trashnet' 
      ? result.wasteType 
      : result.category;

    if (!label) return null;

    return (
      <Stack spacing={1}>
        <Chip
          label={label}
          color="primary"
          size="small"
        />
        <Chip
          label={`${(result.confidence * 100).toFixed(1)}%`}
          color={getConfidenceColor(result.confidence)}
          size="small"
        />
      </Stack>
    );
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
      {/* Filters */}
      <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          label="Search"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Model</InputLabel>
          <Select<FilterModel>
            value={filterModel}
            label="Model"
            onChange={handleFilterModelChange}
          >
            <MenuItem value="all">All Models</MenuItem>
            <MenuItem value="trashnet">TrashNet</MenuItem>
            <MenuItem value="taco">TACO</MenuItem>
            <MenuItem value="wastenet">WasteNet</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Min Confidence</InputLabel>
          <Select
            value={filterConfidence}
            label="Min Confidence"
            onChange={handleFilterConfidenceChange}
          >
            <MenuItem value={0}>Any</MenuItem>
            <MenuItem value={0.6}>60%+</MenuItem>
            <MenuItem value={0.8}>80%+</MenuItem>
            <MenuItem value={0.9}>90%+</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {headCells.map((headCell) => (
                <TableCell
                  key={headCell.id}
                  width={headCell.width}
                  sortDirection={orderBy === headCell.id ? order : false}
                >
                  {headCell.sortable ? (
                    <TableSortLabel
                      active={orderBy === headCell.id}
                      direction={orderBy === headCell.id ? order : 'asc'}
                      onClick={() => handleRequestSort(headCell.id as SortableField)}
                    >
                      {headCell.label}
                    </TableSortLabel>
                  ) : (
                    headCell.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAnalyses
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((analysis) => (
                <TableRow key={analysis.id}>
                  <TableCell>{formatDate(analysis.timestamp)}</TableCell>
                  <TableCell>
                    <Box
                      component="img"
                      src={analysis.imageUrl}
                      alt="Waste"
                      sx={{
                        width: 60,
                        height: 60,
                        objectFit: 'cover',
                        cursor: 'pointer',
                        borderRadius: 1
                      }}
                      onClick={() => setSelectedImage(analysis.imageUrl)}
                    />
                  </TableCell>
                  <TableCell>{renderModelResult(analysis.result, 'trashnet')}</TableCell>
                  <TableCell>{renderModelResult(analysis.tacoResult, 'taco')}</TableCell>
                  <TableCell>{renderModelResult(analysis.wastenetResult, 'wastenet')}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
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
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredAnalyses.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* Image Preview Dialog */}
      <Dialog
        open={Boolean(selectedImage)}
        onClose={() => setSelectedImage(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Image Preview</DialogTitle>
        <DialogContent>
          {selectedImage && (
            <Box
              component="img"
              src={selectedImage}
              alt="Waste Preview"
              sx={{
                width: '100%',
                height: 'auto',
                maxHeight: '70vh',
                objectFit: 'contain'
              }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedImage(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EnhancedAnalysisTable;
