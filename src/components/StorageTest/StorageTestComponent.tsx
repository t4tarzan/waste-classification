import React, { useState } from 'react';
import { Box, Button, CircularProgress, Alert, Typography, Grid } from '@mui/material';
import { auth } from '../../config/firebase';
import { testStorageUpload, testStorageString, uploadTestImage } from '../../utils/storageTest';
import { userService } from '../../services/userService';
import { listFiles } from '../../utils/storageUtils';

interface TestResult {
  name: string;
  status: 'success' | 'error';
  message: string;
}

const StorageTestComponent: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);

  const addTestResult = (name: string, status: 'success' | 'error', message: string) => {
    setTestResults(prev => [...prev, { name, status, message }]);
  };

  const runAllTests = async () => {
    setIsLoading(true);
    setTestResults([]);

    try {
      // Test 1: Basic File Upload
      try {
        await testStorageUpload();
        addTestResult(
          'Basic File Upload',
          'success',
          'Successfully uploaded and retrieved test file'
        );
      } catch (error) {
        addTestResult(
          'Basic File Upload',
          'error',
          `Failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }

      // Test 2: String Upload
      try {
        await testStorageString();
        addTestResult(
          'String Upload',
          'success',
          'Successfully uploaded and retrieved test string'
        );
      } catch (error) {
        addTestResult(
          'String Upload',
          'error',
          `Failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }

      // Test 3: Profile Picture Upload
      try {
        const user = auth.currentUser;
        if (!user) {
          throw new Error('No user logged in');
        }

        const testImageData = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]); // PNG header
        const file = new File([testImageData], 'test-profile.png', { type: 'image/png' });
        const url = await userService.updateProfilePicture(user.uid, file);
        addTestResult(
          'Profile Picture Upload',
          'success',
          `Successfully uploaded profile picture: ${url}`
        );
      } catch (error) {
        addTestResult(
          'Profile Picture Upload',
          'error',
          `Failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }

      // Test 4: File Listing
      try {
        const files = await listFiles();
        addTestResult(
          'File Listing',
          'success',
          `Successfully listed ${files.length} files`
        );
      } catch (error) {
        addTestResult(
          'File Listing',
          'error',
          `Failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }

      // Test 5: Error Handling
      try {
        const invalidFile = new File([], '');
        await uploadTestImage(invalidFile);
        addTestResult(
          'Error Handling',
          'error',
          'Failed: Expected error was not thrown'
        );
      } catch (error) {
        addTestResult(
          'Error Handling',
          'success',
          'Successfully caught invalid file error'
        );
      }

    } catch (error) {
      addTestResult(
        'Overall Test Suite',
        'error',
        `Test suite failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box p={3}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Button
            variant="contained"
            onClick={runAllTests}
            disabled={isLoading}
            sx={{ mb: 2 }}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Run All Storage Tests'}
          </Button>
        </Grid>

        <Grid item xs={12}>
          {testResults.map((result, index) => (
            <Box key={index} mb={2}>
              <Alert severity={result.status}>
                <Typography variant="subtitle1" component="div">
                  {result.name}
                </Typography>
                <Typography variant="body2">
                  {result.message}
                </Typography>
              </Alert>
            </Box>
          ))}
        </Grid>
      </Grid>
    </Box>
  );
};

export default StorageTestComponent;
