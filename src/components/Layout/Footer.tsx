import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  RecyclingOutlined,
} from '@mui/icons-material';

export const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: 'background.paper',
        py: 6,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <RecyclingOutlined sx={{ color: 'primary.main', mr: 1 }} />
              <Typography variant="h6" color="text.primary" gutterBottom>
                EcoSort
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Revolutionizing waste management through AI-powered classification.
              Join us in creating a sustainable future.
            </Typography>
            <Box sx={{ mt: 2 }}>
              <IconButton color="primary">
                <Facebook />
              </IconButton>
              <IconButton color="primary">
                <Twitter />
              </IconButton>
              <IconButton color="primary">
                <Instagram />
              </IconButton>
              <IconButton color="primary">
                <LinkedIn />
              </IconButton>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Quick Links
            </Typography>
            <Link href="/analyzer" color="text.secondary" display="block">
              Waste Analyzer
            </Link>
            <Link href="/management" color="text.secondary" display="block">
              Waste Management
            </Link>
            <Link href="/blog" color="text.secondary" display="block">
              Blog
            </Link>
            <Link href="/tools" color="text.secondary" display="block">
              Tools
            </Link>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Contact Us
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Email: info@ecosort.com
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Phone: +1 (555) 123-4567
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Address: 123 Green Street, Eco City, EC 12345
            </Typography>
          </Grid>
        </Grid>
        <Divider sx={{ mt: 4, mb: 2 }} />
        <Typography variant="body2" color="text.secondary" align="center">
          © {new Date().getFullYear()} EcoSort. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};
