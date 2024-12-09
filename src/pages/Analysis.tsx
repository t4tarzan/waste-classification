/**
 * @gold
 * Analysis Page Component
 * 
 * This is a GOLD standard component that provides a complete analysis experience
 * for authenticated users. It combines history viewing and new analysis creation
 * in a clean, intuitive interface.
 * 
 * GOLD Features:
 * 1. Authentication Protection:
 *    - Only accessible to authenticated users
 *    - Clear feedback for unauthorized access
 * 
 * 2. Analysis History:
 *    - Chronological display of all analyses
 *    - Image previews and waste type classification
 *    - Confidence scores with visual indicators
 *    - Pagination for large datasets
 *    - Delete functionality with proper cleanup
 * 
 * 3. New Analysis Integration:
 *    - Seamless switching between history and new analysis
 *    - Maintains state between tab switches
 *    - Updates history automatically after new analysis
 * 
 * Extension Points:
 * 1. Statistics View: Add detailed statistics about waste types
 * 2. Filtering: Add ability to filter history by date/type
 * 3. Batch Operations: Add ability to delete multiple analyses
 * 
 * @see WasteAnalyzer
 * @see AnalysisHistory
 */

import React, { Suspense } from 'react';
import { Container, Box, Paper, Typography, Grid, Tab, Tabs, CircularProgress } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import WasteAnalyzer from '../components/WasteAnalyzer/WasteAnalyzer';
import AnalysisHistory from '../components/WasteAnalyzer/AnalysisHistory';
import ErrorBoundary from '../components/ErrorBoundary/ErrorBoundary';

// Lazy load video components
const VideoAnalyzer = React.lazy(() => 
  import('../features/HF/video/components/VideoAnalyzer').then(module => ({
    default: module.default
  }))
);

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const AnalysisPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [tabValue, setTabValue] = React.useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (!currentUser) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, mb: 4 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" color="error">
              Please sign in to view your analysis history.
            </Typography>
          </Paper>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ width: '100%', mt: 4 }}>
        <Paper elevation={3}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              aria-label="analysis tabs"
              centered
            >
              <Tab label="Analysis History" {...a11yProps(0)} />
              <Tab label="New Analysis" {...a11yProps(1)} />
            </Tabs>
          </Box>
          
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h5" gutterBottom>
                  Analysis History
                </Typography>
                {currentUser && <AnalysisHistory userId={currentUser.uid} />}
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <ErrorBoundary>
                  <WasteAnalyzer />
                  <Suspense fallback={
                    <Box display="flex" justifyContent="center" p={3}>
                      <CircularProgress />
                    </Box>
                  }>
                    <VideoAnalyzer />
                  </Suspense>
                </ErrorBoundary>
              </Grid>
            </Grid>
          </TabPanel>
        </Paper>
      </Box>
    </Container>
  );
};

export default AnalysisPage;
