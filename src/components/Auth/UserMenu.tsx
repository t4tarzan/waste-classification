import React, { useState } from 'react';
import {
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Button,
  Divider,
  Box
} from '@mui/material';
import {
  AccountCircle,
  Dashboard,
  Settings,
  Logout,
  Login,
  Person,
  Assessment
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { SignInDialog } from './SignInDialog';

export const UserMenu: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [signInDialogOpen, setSignInDialogOpen] = useState(false);
  const { currentUser, signOut } = useAuth();
  const navigate = useNavigate();

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      handleClose();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    handleClose();
  };

  if (!currentUser) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Login />}
          onClick={() => setSignInDialogOpen(true)}
          sx={{ 
            fontWeight: 500,
            '&:hover': {
              backgroundColor: 'primary.dark',
            }
          }}
        >
          Sign In
        </Button>
        <SignInDialog
          open={signInDialogOpen}
          onClose={() => setSignInDialogOpen(false)}
        />
      </Box>
    );
  }

  return (
    <>
      <IconButton
        size="large"
        aria-label="account of current user"
        aria-controls="menu-appbar"
        aria-haspopup="true"
        onClick={handleMenu}
        color="inherit"
      >
        {currentUser.photoURL ? (
          <Avatar src={currentUser.photoURL} alt={currentUser.displayName || ''} />
        ) : (
          <AccountCircle />
        )}
      </IconButton>
      <Menu
        id="menu-appbar"
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={() => handleNavigate('/profile')}>
          <ListItemIcon>
            <Person fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Profile" />
        </MenuItem>
        <MenuItem onClick={() => handleNavigate('/analysis')}>
          <ListItemIcon>
            <Assessment fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Analysis" />
        </MenuItem>
        <MenuItem onClick={() => handleNavigate('/settings')}>
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Settings" />
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleSignOut}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </MenuItem>
      </Menu>
    </>
  );
};
