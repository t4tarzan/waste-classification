import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Link,
  IconButton,
  Button,
} from '@mui/material';
import { InsertDriveFile as FileIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { StorageFile } from '../../types/storage';

interface FileListProps {
  files: StorageFile[];
  onRefresh: () => void;
}

const FileList: React.FC<FileListProps> = ({ files, onRefresh }) => {
  if (files.length === 0) {
    return (
      <Box p={2}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography>No files found</Typography>
          <Button
            startIcon={<RefreshIcon />}
            onClick={onRefresh}
            variant="outlined"
            size="small"
          >
            Refresh
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box p={2}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h6">Storage Files</Typography>
        <Button
          startIcon={<RefreshIcon />}
          onClick={onRefresh}
          variant="outlined"
          size="small"
        >
          Refresh
        </Button>
      </Box>
      <Grid container spacing={2}>
        {files.map((file) => (
          <Grid item xs={12} sm={6} md={4} key={file.fullPath}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <IconButton size="small">
                    <FileIcon />
                  </IconButton>
                  <Typography variant="subtitle1" component="div" ml={1}>
                    {file.name}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Size: {(file.size / 1024).toFixed(2)} KB
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Type: {file.type}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Modified: {new Date(file.lastModified).toLocaleDateString()}
                </Typography>
                <Box mt={1}>
                  <Link href={file.downloadUrl} target="_blank" rel="noopener noreferrer">
                    Download
                  </Link>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default FileList;
