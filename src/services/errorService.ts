import { toast, ToastOptions } from 'react-toastify';

export enum ErrorType {
  AUTHENTICATION = 'AUTHENTICATION',
  UPLOAD = 'UPLOAD',
  ANALYSIS = 'ANALYSIS',
  NETWORK = 'NETWORK',
  STORAGE = 'STORAGE',
  VALIDATION = 'VALIDATION',
  RATE_LIMIT = 'RATE_LIMIT',
  UNKNOWN = 'UNKNOWN'
}

export interface ErrorDetails {
  type: ErrorType;
  message: string;
  technical?: string;
  actionRequired?: string;
  retry?: boolean;
}

const defaultToastOptions: ToastOptions = {
  position: "top-right",
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: "light"
};

class ErrorService {
  private logError(error: ErrorDetails) {
    console.error(`[${error.type}] ${error.message}`, {
      technical: error.technical,
      actionRequired: error.actionRequired,
      retry: error.retry
    });
  }

  public handleError(error: Error | string, type: ErrorType = ErrorType.UNKNOWN): ErrorDetails {
    let errorDetails: ErrorDetails;

    switch (type) {
      case ErrorType.AUTHENTICATION:
        errorDetails = this.handleAuthError(error);
        break;
      case ErrorType.UPLOAD:
        errorDetails = this.handleUploadError(error);
        break;
      case ErrorType.ANALYSIS:
        errorDetails = this.handleAnalysisError(error);
        break;
      case ErrorType.NETWORK:
        errorDetails = this.handleNetworkError(error);
        break;
      case ErrorType.STORAGE:
        errorDetails = this.handleStorageError(error);
        break;
      case ErrorType.VALIDATION:
        errorDetails = this.handleValidationError(error);
        break;
      case ErrorType.RATE_LIMIT:
        errorDetails = this.handleRateLimitError(error);
        break;
      default:
        errorDetails = this.handleUnknownError(error);
    }

    this.logError(errorDetails);
    this.showUserFriendlyError(errorDetails);
    return errorDetails;
  }

  private handleAuthError(error: Error | string): ErrorDetails {
    const message = error instanceof Error ? error.message : error;
    return {
      type: ErrorType.AUTHENTICATION,
      message: 'Authentication error occurred',
      technical: message,
      actionRequired: 'Please sign in again or continue as guest',
      retry: false
    };
  }

  private handleUploadError(error: Error | string): ErrorDetails {
    const message = error instanceof Error ? error.message : error;
    return {
      type: ErrorType.UPLOAD,
      message: 'Failed to upload image',
      technical: message,
      actionRequired: 'Please try uploading again with a different image',
      retry: true
    };
  }

  private handleAnalysisError(error: Error | string): ErrorDetails {
    const message = error instanceof Error ? error.message : error;
    return {
      type: ErrorType.ANALYSIS,
      message: 'Failed to analyze image',
      technical: message,
      actionRequired: 'Please try again with a different image',
      retry: true
    };
  }

  private handleNetworkError(error: Error | string): ErrorDetails {
    const message = error instanceof Error ? error.message : error;
    return {
      type: ErrorType.NETWORK,
      message: 'Network connection error',
      technical: message,
      actionRequired: 'Please check your internet connection and try again',
      retry: true
    };
  }

  private handleStorageError(error: Error | string): ErrorDetails {
    const message = error instanceof Error ? error.message : error;
    return {
      type: ErrorType.STORAGE,
      message: 'Storage service error',
      technical: message,
      actionRequired: 'Please try again later',
      retry: true
    };
  }

  private handleValidationError(error: Error | string): ErrorDetails {
    const message = error instanceof Error ? error.message : error;
    return {
      type: ErrorType.VALIDATION,
      message: message,
      technical: message,
      actionRequired: 'Please check the requirements and try again',
      retry: false
    };
  }

  private handleRateLimitError(error: Error | string): ErrorDetails {
    const message = error instanceof Error ? error.message : error;
    return {
      type: ErrorType.RATE_LIMIT,
      message: 'Rate limit exceeded',
      technical: message,
      actionRequired: 'Please try again later or sign in for unlimited analyses',
      retry: false
    };
  }

  private handleUnknownError(error: Error | string): ErrorDetails {
    const message = error instanceof Error ? error.message : error;
    return {
      type: ErrorType.UNKNOWN,
      message: 'An unexpected error occurred',
      technical: message,
      actionRequired: 'Please try again later',
      retry: true
    };
  }

  private showUserFriendlyError(error: ErrorDetails) {
    const toastMessage = `${error.message}${error.actionRequired ? ` - ${error.actionRequired}` : ''}`;
    toast.error(toastMessage, defaultToastOptions);
  }
}

export const errorService = new ErrorService();
