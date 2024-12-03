import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Paper,
  Typography,
  Avatar,
  Button,
  TextField,
  Grid,
  Box,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material';
import { PhotoCamera, Edit as EditIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { auth, storage } from '../../config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const ProfilePage: React.FC = () => {
  const { currentUser, updateUserProfile } = useAuth();
  const [error, setError] = useState<string | null>('');
  const [success, setSuccess] = useState<string | null>('');
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [profilePicUrl, setProfilePicUrl] = useState<string | null>(currentUser?.photoURL || null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadProfilePicture();
  }, []);

  const loadProfilePicture = async () => {
    if (!currentUser) return;

    try {
      const storageRef = ref(storage, `users/${currentUser.uid}/profile-picture`);
      try {
        const url = await getDownloadURL(storageRef);
        setProfilePicUrl(url);
      } catch (error) {
        // Ignore error if file doesn't exist yet
        if (!(error instanceof Error) || !error.message.includes('object-not-found')) {
          console.error('Error loading profile picture:', error);
        }
      }
    } catch (error) {
      console.error('Error accessing storage:', error);
    }
  };

  const handleProfilePicChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.length) return;
    if (!currentUser) {
      setError('You must be logged in to update your profile picture');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const file = event.target.files[0];
      const storageRef = ref(storage, `users/${currentUser.uid}/profile-picture`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      await updateUserProfile({ photoURL: downloadURL });
      setProfilePicUrl(downloadURL);
      setSuccess('Profile picture updated successfully!');
    } catch (err) {
      console.error('Error updating profile picture:', err);
      setError('Failed to update profile picture');
    } finally {
      setLoading(false);
    }
  };

  const handleDisplayNameUpdate = async () => {
    if (!currentUser) {
      setError('You must be logged in to update your profile');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await updateUserProfile({ displayName });
      setSuccess('Profile updated successfully!');
      setEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Grid container spacing={3} direction="column" alignItems="center">
          <Grid item>
            <Box position="relative">
              <Avatar
                src={profilePicUrl || undefined}
                sx={{ width: 120, height: 120 }}
              />
              <input
                type="file"
                hidden
                ref={fileInputRef}
                accept="image/*"
                onChange={handleProfilePicChange}
              />
              <IconButton
                color="primary"
                aria-label="upload picture"
                component="span"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  backgroundColor: 'background.paper',
                }}
              >
                <PhotoCamera />
              </IconButton>
            </Box>
          </Grid>

          <Grid item xs={12} width="100%">
            {editing ? (
              <Box display="flex" gap={1}>
                <TextField
                  fullWidth
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  disabled={loading}
                />
                <Button
                  variant="contained"
                  onClick={handleDisplayNameUpdate}
                  disabled={loading}
                >
                  Save
                </Button>
              </Box>
            ) : (
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="h6">
                  {displayName || 'No display name set'}
                </Typography>
                <IconButton onClick={() => setEditing(true)} size="small">
                  <EditIcon />
                </IconButton>
              </Box>
            )}
          </Grid>

          {error && (
            <Grid item xs={12}>
              <Alert severity="error">{error}</Alert>
            </Grid>
          )}

          {success && (
            <Grid item xs={12}>
              <Alert severity="success">{success}</Alert>
            </Grid>
          )}

          {loading && (
            <Grid item>
              <CircularProgress />
            </Grid>
          )}
        </Grid>
      </Paper>
    </Container>
  );
};
