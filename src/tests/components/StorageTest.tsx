import React, { useState } from 'react';
import { Button, Box, Typography, Alert } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { testStorageUpload } from '../storage/storageTest';

const StorageTest: React.FC = () => {
  const { currentUser } = useAuth();
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');

  const runTest = async () => {
    try {
      setError('');
      setResult('Testing...');
      
      // Test guest upload
      if (!currentUser) {
        const guestUrl = await testStorageUpload(false);
        setResult(`Guest upload successful: ${guestUrl}`);
      } else {
        // Test authenticated upload
        const authUrl = await testStorageUpload(true, currentUser.uid);
        setResult(`Authenticated upload successful: ${authUrl}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setResult('');
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Storage Rules Test
      </Typography>
      <Typography variant="body1" gutterBottom>
        Current user: {currentUser ? currentUser.email : 'Guest'}
      </Typography>
      <Button variant="contained" color="primary" onClick={runTest} sx={{ my: 2 }}>
        Test Storage Upload
      </Button>
      {result && (
        <Alert severity="success" sx={{ mt: 2 }}>
          {result}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default StorageTest;
