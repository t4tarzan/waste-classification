import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SignInDialog } from '../../src/components/Auth/SignInDialog';
import { ResetPasswordDialog } from '../../src/components/Auth/ResetPasswordDialog';
import { AuthProvider } from '../../src/contexts/AuthContext';

// Mock Firebase Auth
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
  sendEmailVerification: jest.fn(),
  signInWithPopup: jest.fn(),
  GoogleAuthProvider: jest.fn(),
}));

describe('Authentication Flow Tests (Phase 1.1)', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Sign In Dialog', () => {
    const renderSignInDialog = () => {
      render(
        <AuthProvider>
          <SignInDialog open={true} onClose={mockOnClose} />
        </AuthProvider>
      );
    };

    test('validates email format', async () => {
      renderSignInDialog();
      
      const emailInput = screen.getByLabelText(/email/i);
      await userEvent.type(emailInput, 'invalid-email');
      
      const signInButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(signInButton);
      
      expect(await screen.findByText(/please enter a valid email address/i)).toBeInTheDocument();
    });

    test('validates password requirements for sign up', async () => {
      renderSignInDialog();
      
      // Switch to sign up mode
      fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
      
      const passwordInput = screen.getByLabelText(/password/i);
      await userEvent.type(passwordInput, 'weak');
      
      const signUpButton = screen.getByRole('button', { name: /create account/i });
      fireEvent.click(signUpButton);
      
      expect(await screen.findByText(/password must be at least 8 characters/i)).toBeInTheDocument();
    });

    test('shows loading state during authentication', async () => {
      renderSignInDialog();
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      
      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'password123');
      
      const signInButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(signInButton);
      
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });

  describe('Reset Password Dialog', () => {
    const renderResetDialog = () => {
      render(
        <AuthProvider>
          <ResetPasswordDialog open={true} onClose={mockOnClose} />
        </AuthProvider>
      );
    };

    test('validates email before sending reset link', async () => {
      renderResetDialog();
      
      const emailInput = screen.getByLabelText(/email/i);
      await userEvent.type(emailInput, 'invalid-email');
      
      const resetButton = screen.getByRole('button', { name: /send reset link/i });
      fireEvent.click(resetButton);
      
      expect(await screen.findByText(/please enter a valid email address/i)).toBeInTheDocument();
    });

    test('shows success message after sending reset link', async () => {
      const mockSendPasswordResetEmail = require('firebase/auth').sendPasswordResetEmail;
      mockSendPasswordResetEmail.mockResolvedValueOnce();
      
      renderResetDialog();
      
      const emailInput = screen.getByLabelText(/email/i);
      await userEvent.type(emailInput, 'test@example.com');
      
      const resetButton = screen.getByRole('button', { name: /send reset link/i });
      fireEvent.click(resetButton);
      
      expect(await screen.findByText(/password reset email sent/i)).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('handles firebase errors appropriately', async () => {
      const mockSignInWithEmailAndPassword = require('firebase/auth').signInWithEmailAndPassword;
      mockSignInWithEmailAndPassword.mockRejectedValueOnce(new Error('auth/user-not-found'));
      
      render(
        <AuthProvider>
          <SignInDialog open={true} onClose={mockOnClose} />
        </AuthProvider>
      );
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      
      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'password123');
      
      const signInButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(signInButton);
      
      expect(await screen.findByText(/invalid email or password/i)).toBeInTheDocument();
    });
  });
});
