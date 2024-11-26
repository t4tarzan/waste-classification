import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Stack,
  Paper,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Analytics,
  RecyclingOutlined,
  Calculate,
  Article,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { WasteAnalyzer } from '../WasteAnalyzer/WasteAnalyzer';

const HeroSection = styled(Box)(({ theme }) => ({
  background: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?ixlib=rb-4.0.3')`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  color: 'white',
  padding: theme.spacing(15, 0),
  textAlign: 'center',
}));

const StatsCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: 'center',
  background: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[3],
}));

const features = [
  {
    title: 'Waste Analyzer',
    description: 'Upload images of waste items for instant AI-powered classification',
    icon: <Analytics color="primary" sx={{ fontSize: 40 }} />,
    path: '/analyzer',
  },
  {
    title: 'Waste Management',
    description: 'Learn about effective waste management methodologies',
    icon: <RecyclingOutlined color="primary" sx={{ fontSize: 40 }} />,
    path: '/management',
  },
  {
    title: 'Tools & Calculators',
    description: 'Calculate your waste footprint and environmental impact',
    icon: <Calculate color="primary" sx={{ fontSize: 40 }} />,
    path: '/tools',
  },
  {
    title: 'Blog & Resources',
    description: 'Stay updated with the latest in sustainable waste management',
    icon: <Article color="primary" sx={{ fontSize: 40 }} />,
    path: '/blog',
  },
];

export const HomePage: React.FC = () => {
  return (
    <Box>
      <HeroSection>
        <Container>
          <Typography variant="h2" component="h1" gutterBottom>
            Smart Waste Classification
          </Typography>
          <Typography variant="h5" gutterBottom sx={{ mb: 4 }}>
            Revolutionizing waste management with AI technology
          </Typography>
          <Button
            variant="contained"
            size="large"
            component="a"
            href="#waste-analyzer"
            sx={{ mr: 2 }}
          >
            Try Waste Analyzer
          </Button>
          <Button
            variant="outlined"
            size="large"
            component={Link}
            to="/management"
            sx={{ color: 'white', borderColor: 'white' }}
          >
            Learn More
          </Button>
        </Container>
      </HeroSection>

      <Container sx={{ my: 8 }}>
        <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
          Our Features
        </Typography>
        <Grid container spacing={4} sx={{ mt: 2 }}>
          {features.map((feature) => (
            <Grid item xs={12} sm={6} md={3} key={feature.title}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: '0.3s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: 8,
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                  {feature.icon}
                  <Typography variant="h6" component="h3" sx={{ mt: 2 }}>
                    {feature.title}
                  </Typography>
                  <Typography color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Box sx={{ bgcolor: 'background.paper', py: 8 }}>
        <Container>
          <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
            Impact Statistics
          </Typography>
          <Grid container spacing={4} sx={{ mt: 2 }}>
            <Grid item xs={12} sm={4}>
              <StatsCard>
                <Typography variant="h3" color="primary">1M+</Typography>
                <Typography variant="h6">Items Classified</Typography>
              </StatsCard>
            </Grid>
            <Grid item xs={12} sm={4}>
              <StatsCard>
                <Typography variant="h3" color="primary">85%</Typography>
                <Typography variant="h6">Classification Accuracy</Typography>
              </StatsCard>
            </Grid>
            <Grid item xs={12} sm={4}>
              <StatsCard>
                <Typography variant="h3" color="primary">50K+</Typography>
                <Typography variant="h6">Active Users</Typography>
              </StatsCard>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container sx={{ my: 8 }} id="waste-analyzer">
        <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
          Try Our Waste Analyzer
        </Typography>
        <Typography variant="body1" textAlign="center" sx={{ mb: 4 }}>
          Upload an image of any waste item to get instant AI-powered classification
        </Typography>
        <WasteAnalyzer />
      </Container>
    </Box>
  );
};
