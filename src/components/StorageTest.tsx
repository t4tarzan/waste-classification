import React, { useRef, useState } from 'react';
import { Button, Box, CircularProgress, Typography } from '@mui/material';
import { storage, uploadToStorage } from '../config/firebase';
import { useAuth } from '../hooks/useAuth';

const StorageTest: React.FC = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <CircularProgress size={20} />
        <Typography>Loading authentication...</Typography>
      </Box>
    );
  }

  if (!currentUser) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error">
          Please log in first to test storage functionality.
        </Typography>
      </Box>
    );
  }

  const handleTestUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    try {
      const path = `test-uploads/${currentUser.uid}/${Date.now()}-${file.name}`;
      const { downloadURL } = await uploadToStorage(path, file);
      setUploadedUrl(downloadURL);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleTestUpload}
      />
      <Button
        variant="contained"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
      >
        {isUploading ? 'Uploading...' : 'Test Upload'}
      </Button>

      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}

      {uploadedUrl && (
        <Box sx={{ mt: 2 }}>
          <Typography>Upload successful!</Typography>
          <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
            URL: {uploadedUrl}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default StorageTest;
