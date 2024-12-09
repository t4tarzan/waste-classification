export enum ModelErrorType {
  API_ERROR = 'api_error',
  INFERENCE_ERROR = 'inference_error',
  LOADING_ERROR = 'loading_error',
  RESOURCE_UNAVAILABLE = 'resource_unavailable',
  INVALID_INPUT = 'invalid_input',
  INITIALIZATION_ERROR = 'initialization_error',
  ANALYSIS_ERROR = 'analysis_error',
  EXTRACTION_ERROR = 'extraction_error',
  CLEANUP_ERROR = 'cleanup_error',
  LOADING_TIMEOUT = 'loading_timeout'
}

export type RecoveryAction = 
  | { type: 'retry'; maxAttempts: number }
  | { type: 'fallback'; model: string }
  | { type: 'notify'; message: string }
  | { type: 'abort'; reason: string };

export interface ModelErrorStrategy {
  type: ModelErrorType;
  recovery: RecoveryAction[];
  userMessage: string;
}

export class ModelError extends Error {
  constructor(
    public type: ModelErrorType,
    public message: string,
    public strategy?: ModelErrorStrategy
  ) {
    super(message);
    this.name = 'ModelError';
  }
}

export const DEFAULT_ERROR_STRATEGIES: Record<ModelErrorType, ModelErrorStrategy> = {
  [ModelErrorType.LOADING_TIMEOUT]: {
    type: ModelErrorType.LOADING_TIMEOUT,
    recovery: [
      { type: 'retry', maxAttempts: 3 },
      { type: 'notify', message: 'Loading timed out. Please try again.' }
    ],
    userMessage: 'Video loading timed out'
  },
  [ModelErrorType.INFERENCE_ERROR]: {
    type: ModelErrorType.INFERENCE_ERROR,
    recovery: [
      { type: 'retry', maxAttempts: 2 },
      { type: 'notify', message: 'Error processing video frame' }
    ],
    userMessage: 'Error analyzing video frame'
  },
  [ModelErrorType.RESOURCE_UNAVAILABLE]: {
    type: ModelErrorType.RESOURCE_UNAVAILABLE,
    recovery: [
      { type: 'fallback', model: 'lightweight-model' },
      { type: 'notify', message: 'Using lightweight model due to resource constraints' }
    ],
    userMessage: 'System resources are limited'
  },
  [ModelErrorType.INVALID_INPUT]: {
    type: ModelErrorType.INVALID_INPUT,
    recovery: [
      { type: 'notify', message: 'Invalid input format. Please check the requirements.' },
      { type: 'abort', reason: 'Invalid input' }
    ],
    userMessage: 'Invalid input format'
  },
  [ModelErrorType.API_ERROR]: {
    type: ModelErrorType.API_ERROR,
    recovery: [
      { type: 'retry', maxAttempts: 3 },
      { type: 'notify', message: 'Service temporarily unavailable' }
    ],
    userMessage: 'Service error'
  },
  [ModelErrorType.LOADING_ERROR]: {
    type: ModelErrorType.LOADING_ERROR,
    recovery: [
      { type: 'retry', maxAttempts: 2 },
      { type: 'notify', message: 'Error loading video. Please try a different file.' }
    ],
    userMessage: 'Video loading error'
  },
  [ModelErrorType.INITIALIZATION_ERROR]: {
    type: ModelErrorType.INITIALIZATION_ERROR,
    recovery: [
      { type: 'retry', maxAttempts: 1 },
      { type: 'notify', message: 'Failed to initialize video processor' },
      { type: 'abort', reason: 'Initialization failed' }
    ],
    userMessage: 'Failed to initialize video processor'
  },
  [ModelErrorType.ANALYSIS_ERROR]: {
    type: ModelErrorType.ANALYSIS_ERROR,
    recovery: [
      { type: 'retry', maxAttempts: 2 },
      { type: 'notify', message: 'Error analyzing video' }
    ],
    userMessage: 'Video analysis error'
  },
  [ModelErrorType.EXTRACTION_ERROR]: {
    type: ModelErrorType.EXTRACTION_ERROR,
    recovery: [
      { type: 'retry', maxAttempts: 2 },
      { type: 'notify', message: 'Error extracting video frames' }
    ],
    userMessage: 'Frame extraction error'
  },
  [ModelErrorType.CLEANUP_ERROR]: {
    type: ModelErrorType.CLEANUP_ERROR,
    recovery: [
      { type: 'notify', message: 'Error cleaning up resources' }
    ],
    userMessage: 'Resource cleanup error'
  }
};
