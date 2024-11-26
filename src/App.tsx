import React from 'react';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Layout/Navbar';
import { Footer } from './components/Layout/Footer';
import { createTheme } from '@mui/material/styles';
import { BlogPage } from './components/Blog/BlogPage';
import { BlogPost } from './components/Blog/BlogPost';
import { ToolsPage } from './components/Tools/ToolsPage';
import { WasteAnalyzer } from './components/WasteAnalyzer/WasteAnalyzer';
import { About } from './components/About/About';
import { HomePage } from './components/Home/HomePage';
import { WasteManagementPage } from './components/WasteManagement/WasteManagementPage';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#4caf50',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '3.5rem',
      fontWeight: 700,
    },
    h2: {
      fontSize: '3rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '2.5rem',
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          textTransform: 'none',
          padding: '8px 24px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ 
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <Navbar />
          <Box component="main" sx={{ flexGrow: 1 }}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<About />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:id" element={<BlogPost />} />
              <Route path="/tools/*" element={<ToolsPage />} />
              <Route path="/waste-analyzer" element={<WasteAnalyzer />} />
              <Route path="/waste-management/*" element={<WasteManagementPage />} />
            </Routes>
          </Box>
          <Footer />
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
