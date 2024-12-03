export interface ValidationError {
  email?: string;
  password?: string;
}

export const validateEmail = (email: string): string | undefined => {
  if (!email) {
    return 'Email is required';
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address';
  }
};

export const validatePassword = (password: string, isSignUp: boolean): string | undefined => {
  if (!password) {
    return 'Password is required';
  }

  if (isSignUp) {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    
    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    
    if (!/[0-9]/.test(password)) {
      return 'Password must contain at least one number';
    }
    
    if (!/[!@#$%^&*]/.test(password)) {
      return 'Password must contain at least one special character (!@#$%^&*)';
    }
  }
};

export const validateForm = (
  email: string,
  password: string,
  isSignUp: boolean
): ValidationError => {
  const errors: ValidationError = {};
  
  const emailError = validateEmail(email);
  if (emailError) {
    errors.email = emailError;
  }
  
  const passwordError = validatePassword(password, isSignUp);
  if (passwordError) {
    errors.password = passwordError;
  }
  
  return errors;
};
