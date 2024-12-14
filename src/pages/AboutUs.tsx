import React from 'react';
import { Box, Container, Typography } from '@mui/material';

const AboutUs: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
        About Us
      </Typography>

      <Box
        sx={{
          width: '100%',
          height: 'calc(100vh - 200px)',
          minHeight: '600px',
          bgcolor: 'background.paper',
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow: 1,
        }}
      >
        <iframe
          src="/IC DTP (Grade 10).pdf"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
          }}
          title="About Us PDF"
        />
      </Box>
    </Container>
  );
};

export default AboutUs;
