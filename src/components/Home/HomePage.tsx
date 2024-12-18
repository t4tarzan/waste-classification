import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
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
import heroBg from '../../assets/images/hero-bg.jpg';

const HeroSection = styled(Box)(({ theme }) => ({
  backgroundImage: `url(${heroBg})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  color: 'white',
  padding: theme.spacing(15, 0),
  textAlign: 'center',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1,
  },
  '& > *': {
    position: 'relative',
    zIndex: 2,
  },
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
    path: '/waste-analyzer',
  },
  {
    title: 'Waste Management',
    description: 'Learn about effective waste management methodologies',
    icon: <RecyclingOutlined color="primary" sx={{ fontSize: 40 }} />,
    path: '/waste-management',
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
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="center"
          >
            <Button
              variant="contained"
              size="large"
              component={Link}
              to="/waste-analyzer"
              sx={{ 
                bgcolor: 'white',
                color: 'primary.main',
                '&:hover': {
                  bgcolor: 'grey.100',
                }
              }}
            >
              Try Waste Analyzer
            </Button>
            <Button
              variant="outlined"
              size="large"
              component={Link}
              to="/waste-management"
              sx={{ 
                color: 'white',
                borderColor: 'white',
                '&:hover': {
                  borderColor: 'grey.100',
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                }
              }}
            >
              Learn More
            </Button>
          </Stack>
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
                component={Link}
                to={feature.path}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: '0.3s',
                  textDecoration: 'none',
                  color: 'inherit',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: (theme) => theme.shadows[8],
                    cursor: 'pointer',
                    backgroundColor: (theme) => theme.palette.action.hover,
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

      <Box sx={{ my: 8, textAlign: 'center' }}>
        <Container>
          <Typography variant="h3" component="h2" gutterBottom>
            Ready to Start?
          </Typography>
          <Typography variant="body1" sx={{ mb: 4 }}>
            Try our AI-powered waste classification tool now
          </Typography>
          <Button
            variant="contained"
            size="large"
            component={Link}
            to="/waste-analyzer"
            startIcon={<Analytics />}
          >
            Go to Waste Analyzer
          </Button>
        </Container>
      </Box>
    </Box>
  );
};
