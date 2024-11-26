import React from 'react';
import { Container, Typography, Box, Paper, Grid } from '@mui/material';
import { RecyclingOutlined, NatureOutlined, PeopleOutlined } from '@mui/icons-material';

export const About: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        About EcoSort
      </Typography>
      
      <Typography variant="h5" component="h2" gutterBottom align="center" color="text.secondary" sx={{ mb: 6 }}>
        Empowering sustainable waste management through AI technology
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <RecyclingOutlined sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom align="center">
              Our Mission
            </Typography>
            <Typography align="center">
              To revolutionize waste management by making it easier for individuals and businesses to properly classify and manage their waste through AI-powered solutions.
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <NatureOutlined sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom align="center">
              Environmental Impact
            </Typography>
            <Typography align="center">
              We&apos;re committed to reducing landfill waste and promoting recycling through education and accessible technology, contributing to a more sustainable future.
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <PeopleOutlined sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom align="center">
              Community Focus
            </Typography>
            <Typography align="center">
              Building a community of environmentally conscious individuals and organizations, sharing knowledge and best practices for waste management.
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ mt: 6 }}>
        <Typography variant="h4" gutterBottom>
          Our Story
        </Typography>
        <Typography paragraph>
          EcoSort was founded with a simple yet powerful vision: to make waste classification and management accessible to everyone. We recognized that proper waste sorting is often confusing and time-consuming, leading to recyclable materials ending up in landfills.
        </Typography>
        <Typography paragraph>
          By leveraging cutting-edge AI technology, we&apos;ve developed a platform that instantly identifies and categorizes waste items, providing clear disposal instructions and educational resources. Our tools and calculators help users understand their waste footprint and make informed decisions about waste reduction.
        </Typography>
        <Typography>
          Today, we&apos;re proud to serve a growing community of environmentally conscious users, from households to large organizations, all working together towards a more sustainable future.
        </Typography>
      </Box>
    </Container>
  );
};
