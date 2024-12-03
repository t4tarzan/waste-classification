import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Divider,
  IconButton,
  Alert,
  Stack,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import {
  Google as GoogleIcon,
  Close as CloseIcon,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { validateForm, ValidationError } from '../../utils/validation';
import { ResetPasswordDialog } from './ResetPasswordDialog';

interface SignInDialogProps {
  open: boolean;
  onClose: () => void;
}

export const SignInDialog: React.FC<SignInDialogProps> = ({ open, onClose }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<ValidationError>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const { signIn, signUp, signInWithGoogle } = useAuth();

  useEffect(() => {
    if (!open) {
      // Reset form when dialog closes
      setEmail('');
      setPassword('');
      setErrors({});
      setGeneralError('');
      setIsSubmitting(false);
      setShowResetPassword(false);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');
    
    // Validate form
    const validationErrors = validateForm(email, password, isSignUp);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
      onClose();
    } catch (error) {
      if (error instanceof Error) {
        // Handle Firebase auth errors
        const errorMessage = error.message.toLowerCase();
        if (errorMessage.includes('email-already-in-use')) {
          setErrors({ email: 'This email is already registered' });
        } else if (errorMessage.includes('user-not-found') || errorMessage.includes('wrong-password')) {
          setGeneralError('Invalid email or password');
        } else if (errorMessage.includes('too-many-requests')) {
          setGeneralError('Too many attempts. Please try again later');
        } else {
          setGeneralError('An error occurred. Please try again');
        }
      } else {
        setGeneralError('An unexpected error occurred');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGeneralError('');
    setIsSubmitting(true);
    try {
      await signInWithGoogle();
      onClose();
    } catch (error) {
      setGeneralError('Failed to sign in with Google. Please try again');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Dialog 
        open={open} 
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        keepMounted={false}
        disablePortal={false}
        disableEnforceFocus={false}
        disableAutoFocus={false}
        disableScrollLock={false}
        aria-labelledby="sign-in-dialog-title"
        TransitionProps={{
          onEntering: () => {
            // Reset focus trap on dialog open
            document.body.style.overflow = 'hidden';
          },
          onExited: () => {
            document.body.style.overflow = 'unset';
          }
        }}
        PaperProps={{
          sx: {
            borderRadius: 2,
            p: 2
          }
        }}
      >
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>

        <DialogTitle id="sign-in-dialog-title" sx={{ pb: 1, pt: 1 }}>
          <Typography variant="h5" component="div" fontWeight="500">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {isSignUp 
              ? 'Create an account to save and track your waste classification history'
              : 'Sign in to access your waste classification history and saved data'}
          </Typography>
        </DialogTitle>

        <DialogContent>
          <form onSubmit={handleSubmit}>
            <Stack spacing={3} sx={{ mt: 1 }}>
              {generalError && (
                <Alert severity="error" sx={{ width: '100%' }}>
                  {generalError}
                </Alert>
              )}

              <TextField
                label="Email"
                type="email"
                fullWidth
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors({ ...errors, email: undefined });
                }}
                error={!!errors.email}
                helperText={errors.email}
                disabled={isSubmitting}
                required
              />

              <TextField
                label="Password"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrors({ ...errors, password: undefined });
                }}
                error={!!errors.password}
                helperText={errors.password}
                disabled={isSubmitting}
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {!isSignUp && (
                <Button
                  onClick={() => setShowResetPassword(true)}
                  sx={{ alignSelf: 'flex-end' }}
                >
                  Forgot Password?
                </Button>
              )}

              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={isSubmitting}
                sx={{ mt: 2 }}
              >
                {isSubmitting ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  isSignUp ? 'Create Account' : 'Sign In'
                )}
              </Button>

              <Divider>or</Divider>

              <Button
                variant="outlined"
                fullWidth
                startIcon={<GoogleIcon />}
                onClick={handleGoogleSignIn}
                disabled={isSubmitting}
              >
                Continue with Google
              </Button>
            </Stack>
          </form>
        </DialogContent>

        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          <Typography variant="body2">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            <Button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setErrors({});
                setGeneralError('');
              }}
              sx={{ ml: 1 }}
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </Button>
          </Typography>
        </DialogActions>
      </Dialog>
      <ResetPasswordDialog
        open={showResetPassword}
        onClose={() => setShowResetPassword(false)}
      />
    </>
  );
};
