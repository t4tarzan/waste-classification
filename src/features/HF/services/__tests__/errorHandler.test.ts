import { ModelErrorHandler } from '../errorHandler';
import { ModelError, ModelErrorType } from '../../types/errors';

describe('ModelErrorHandler', () => {
  let errorHandler: ModelErrorHandler;
  let notifyMock: jest.Mock;

  beforeEach(() => {
    notifyMock = jest.fn();
    errorHandler = new ModelErrorHandler(notifyMock);
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('handleError', () => {
    it('should handle retry strategy with exponential backoff', async () => {
      const error = new ModelError(ModelErrorType.API_ERROR, 'API Error');
      
      // Start error handling
      const promise = errorHandler.handleError(error);
      
      // First retry (1s delay)
      jest.advanceTimersByTime(1000);
      await Promise.resolve();
      
      // Second retry (2s delay)
      jest.advanceTimersByTime(2000);
      await Promise.resolve();
      
      // Third retry (4s delay)
      jest.advanceTimersByTime(4000);
      await Promise.resolve();
      
      const result = await promise;
      expect(result).toBe(false); // Should fail after max retries
      expect(notifyMock).toHaveBeenCalledWith('Service temporarily unavailable');
    });

    it('should handle fallback strategy', async () => {
      const error = new ModelError(ModelErrorType.RESOURCE_UNAVAILABLE, 'Resource Error');
      const result = await errorHandler.handleError(error);
      
      expect(result).toBe(true);
      expect(notifyMock).toHaveBeenCalledWith('Using lightweight model due to resource constraints');
    });

    it('should handle notification strategy', async () => {
      const error = new ModelError(
        ModelErrorType.INVALID_INPUT, 
        'Invalid Input',
        {
          recovery: [
            { type: 'notify', message: 'Invalid input format. Please check the image requirements.' },
            { type: 'abort', reason: 'Invalid input cannot be processed' }
          ]
        }
      );
      const result = await errorHandler.handleError(error);
      
      expect(result).toBe(false);
      expect(notifyMock).toHaveBeenCalledWith('Invalid input format. Please check the image requirements.');
    });

    it('should handle abort strategy', async () => {
      const error = new ModelError(
        ModelErrorType.INVALID_INPUT, 
        'Invalid Input',
        {
          recovery: [
            { type: 'abort', reason: 'Critical error occurred' }
          ]
        }
      );
      const result = await errorHandler.handleError(error);
      
      expect(result).toBe(false);
      expect(notifyMock).toHaveBeenCalledWith('Error: Invalid Input');
    });
  });

  describe('createModelError', () => {
    it('should handle API timeout errors', () => {
      const error = { code: 'ETIMEDOUT', message: 'Request timed out' };
      const modelError = ModelErrorHandler.createModelError(error);
      
      expect(modelError.type).toBe(ModelErrorType.LOADING_TIMEOUT);
      expect(modelError.message).toBe('Request timed out.');
    });

    it('should handle API rate limit errors', () => {
      const error = { response: { status: 429 } };
      const modelError = ModelErrorHandler.createModelError(error);
      
      expect(modelError.type).toBe(ModelErrorType.RESOURCE_UNAVAILABLE);
      expect(modelError.message).toBe('Too many requests. Please try again later.');
    });

    it('should handle server errors', () => {
      const error = { response: { status: 500 } };
      const modelError = ModelErrorHandler.createModelError(error);
      
      expect(modelError.type).toBe(ModelErrorType.API_ERROR);
      expect(modelError.message).toBe('Service temporarily unavailable.');
    });

    it('should handle unknown errors', () => {
      const error = new Error('Unknown error');
      const modelError = ModelErrorHandler.createModelError(error);
      
      expect(modelError.type).toBe(ModelErrorType.INFERENCE_ERROR);
      expect(modelError.message).toBe('Unknown error');
    });
  });
});
