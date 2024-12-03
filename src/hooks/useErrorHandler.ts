import { useState, useCallback } from 'react';
import { errorService, ErrorType, ErrorDetails } from '../services/errorService';

export const useErrorHandler = () => {
  const [error, setError] = useState<ErrorDetails | null>(null);

  const handleError = useCallback((error: Error | string, type: ErrorType = ErrorType.UNKNOWN) => {
    const errorDetails = errorService.handleError(error, type);
    setError(errorDetails);
    return errorDetails;
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    handleError,
    clearError
  };
};
