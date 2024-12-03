import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { analysisService } from '../../services/analysisService';
import type { Analysis, AnalysisStats } from '../../types/analysis';
import { WasteDistributionChart } from './WasteDistributionChart';
import { AnalysisTimeline } from './AnalysisTimeline';
import { RecentAnalyses } from './RecentAnalyses';

const AnalysisPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<AnalysisStats | null>(null);
  const [recentAnalyses, setRecentAnalyses] = useState<Analysis[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser?.uid) {
        setLoading(false);
        return;
      }

      try {
        const [analysisStats, analyses] = await Promise.all([
          analysisService.getAnalysisStats(currentUser.uid),
          analysisService.getRecentAnalyses(currentUser.uid, 5)
        ]);

        setStats(analysisStats);
        setRecentAnalyses(analyses);
      } catch (err) {
        console.error('Error fetching analysis data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load analysis data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser?.uid]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!currentUser) {
    return (
      <Box p={3}>
        <Typography>Please sign in to view your analysis history.</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Analysis Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Statistics Cards */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Analyses
              </Typography>
              <Typography variant="h4">
                {stats?.totalAnalyses.toLocaleString() || '0'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Average Confidence
              </Typography>
              <Typography variant="h4">
                {stats ? `${(stats.averageConfidence * 100).toFixed(1)}%` : '0%'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Storage Used
              </Typography>
              <Typography variant="h4">
                {stats ? `${(stats.totalStorageUsed / (1024 * 1024)).toFixed(1)} MB` : '0 MB'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Charts and Graphs */}
        <Grid item xs={12} md={6}>
          {stats && <WasteDistributionChart stats={stats} />}
        </Grid>

        <Grid item xs={12} md={6}>
          {recentAnalyses.length > 0 && <AnalysisTimeline analyses={recentAnalyses} />}
        </Grid>

        {/* Recent Analyses */}
        <Grid item xs={12}>
          <RecentAnalyses analyses={recentAnalyses} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalysisPage;
