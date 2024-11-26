import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Menu as MenuIcon, RecyclingOutlined } from '@mui/icons-material';
import { Link } from 'react-router-dom';

const menuItems = [
  { text: 'Home', path: '/', isHash: false },
  { text: 'Waste Analyzer', path: '/#waste-analyzer', isHash: true },
  { text: 'Waste Management', path: '/waste-management', isHash: false },
  { text: 'Tools', path: '/tools', isHash: false },
  { text: 'Blog', path: '/blog', isHash: false },
];

export const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavClick = (path: string, isHash: boolean) => {
    if (isHash) {
      // If we're already on the home page, just scroll to the section
      if (window.location.pathname === '/') {
        const element = document.getElementById('waste-analyzer');
        element?.scrollIntoView({ behavior: 'smooth' });
      } else {
        // If we're on a different page, navigate to home and then scroll
        window.location.href = path;
      }
    }
  };

  const drawer = (
    <List>
      {menuItems.map((item) => (
        <ListItem
          button
          key={item.text}
          component={item.isHash ? 'button' : Link}
          to={item.isHash ? undefined : item.path}
          onClick={() => item.isHash && handleNavClick(item.path, item.isHash)}
          sx={{ color: theme.palette.text.primary }}
        >
          <ListItemText primary={item.text} />
        </ListItem>
      ))}
    </List>
  );

  return (
    <>
      <AppBar position="fixed" sx={{ backgroundColor: 'background.paper' }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <RecyclingOutlined sx={{ mr: 2, color: 'primary.main' }} />
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              flexGrow: 1,
              textDecoration: 'none',
              color: 'text.primary',
              fontWeight: 'bold',
            }}
          >
            EcoSort
          </Typography>

          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            {menuItems.map((item) => (
              item.isHash ? (
                <Button
                  key={item.text}
                  onClick={() => handleNavClick(item.path, item.isHash)}
                  sx={{ color: 'text.primary', ml: 2 }}
                >
                  {item.text}
                </Button>
              ) : (
                <Button
                  key={item.text}
                  component={Link}
                  to={item.path}
                  sx={{ color: 'text.primary', ml: 2 }}
                >
                  {item.text}
                </Button>
              )
            ))}
          </Box>
        </Toolbar>
      </AppBar>

      <Box component="nav">
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
      <Toolbar /> {/* This toolbar is for spacing */}
    </>
  );
};
