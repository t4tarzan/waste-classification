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
import { UserMenu } from '../Auth/UserMenu';

const menuItems = [
  { text: 'Home', path: '/', isHash: false },
  { text: 'Waste Analyzer', path: '/waste-analyzer', isHash: false },
  { text: 'Waste Management', path: '/waste-management', isHash: false },
  { text: 'Tools', path: '/tools', isHash: false },
  { text: 'Blog', path: '/blog', isHash: false },
  { text: 'About Us', path: '/about-us', isHash: false },
];

export const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <List>
      {menuItems.map((item) => (
        <ListItem
          button
          key={item.text}
          component={Link}
          to={item.path}
          onClick={() => setMobileOpen(false)}
          sx={{ color: theme.palette.text.primary }}
        >
          <ListItemText primary={item.text} />
        </ListItem>
      ))}
    </List>
  );

  return (
    <>
      <AppBar position="fixed" sx={{ backgroundColor: 'background.paper', zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="primary"
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
              <Button
                key={item.text}
                component={Link}
                to={item.path}
                color="inherit"
                sx={{ color: 'text.primary' }}
              >
                {item.text}
              </Button>
            ))}
          </Box>
          <Box sx={{ ml: 2 }}>
            <UserMenu />
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
