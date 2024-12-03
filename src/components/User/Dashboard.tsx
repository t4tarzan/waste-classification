import React, { useEffect, useState } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';

interface ClassificationStats {
  date: string;
  count: number;
}

interface WasteTypeStats {
  type: string;
  count: number;
}

export const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [classificationStats, setClassificationStats] = useState<ClassificationStats[]>([]);
  const [wasteTypeStats, setWasteTypeStats] = useState<WasteTypeStats[]>([]);
  const [totalClassifications, setTotalClassifications] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      if (!currentUser) return;

      try {
        // Fetch classifications from Firestore
        const classificationsRef = collection(db, 'classifications');
        const userClassificationsQuery = query(
          classificationsRef,
          where('userId', '==', currentUser.uid)
        );

        const querySnapshot = await getDocs(userClassificationsQuery);
        
        // Process data for stats
        const dateStats: { [key: string]: number } = {};
        const typeStats: { [key: string]: number } = {};
        let total = 0;

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const date = new Date(data.timestamp.toDate()).toLocaleDateString();
          const wasteType = data.wasteType;

          dateStats[date] = (dateStats[date] || 0) + 1;
          typeStats[wasteType] = (typeStats[wasteType] || 0) + 1;
          total++;
        });

        // Convert to array format
        const dateStatsArray = Object.entries(dateStats).map(([date, count]) => ({
          date,
          count,
        }));

        const typeStatsArray = Object.entries(typeStats).map(([type, count]) => ({
          type,
          count,
        }));

        setClassificationStats(dateStatsArray);
        setWasteTypeStats(typeStatsArray);
        setTotalClassifications(total);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching stats:', error);
        setLoading(false);
      }
    };

    fetchStats();
  }, [currentUser]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 12, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Total Classifications Card */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="textSecondary">
              Total Classifications
            </Typography>
            <Typography variant="h3" component="div" sx={{ mt: 2 }}>
              {totalClassifications}
            </Typography>
          </Paper>
        </Grid>

        {/* Classifications List */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Classifications
            </Typography>
            <List>
              {classificationStats.slice(0, 5).map((stat, index) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={`${stat.date}`}
                    secondary={`${stat.count} classifications`}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Waste Types List */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Waste Types
            </Typography>
            <List>
              {wasteTypeStats.map((stat, index) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={`${stat.type}`}
                    secondary={`${stat.count} items`}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};
