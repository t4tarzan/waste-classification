import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { StorageFile } from '../../types/storage';
import { listFiles } from '../../utils/storageUtils';
import FileList from './FileList';

interface StorageFilesViewerProps {
  userId: string;
}

export const StorageFilesViewer: React.FC<StorageFilesViewerProps> = ({ userId }) => {
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedFiles = await listFiles(`waste-images/${userId}/`);
      setFiles(fetchedFiles);
    } catch (err) {
      console.error('Error loading files:', err);
      setError(err instanceof Error ? err.message : 'Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, [userId]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={2}>
        <Typography color="error">Error: {error}</Typography>
      </Box>
    );
  }

  return <FileList files={files} onRefresh={loadFiles} />;
};

export default StorageFilesViewer;
