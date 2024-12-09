import { ModelError, ModelErrorType, ModelErrorStrategy, RecoveryAction, DEFAULT_ERROR_STRATEGIES } from '../types/errors';

export class ModelErrorHandler {
  private retryAttempts: Map<string, number> = new Map();
  private onNotify?: (message: string) => void;

  constructor(notifyCallback?: (message: string) => void) {
    this.onNotify = notifyCallback;
  }

  /**
   * Handle a model error and execute its recovery strategy
   */
  async handleError(error: ModelError): Promise<boolean> {
    const strategy = error.strategy || DEFAULT_ERROR_STRATEGIES[error.type];
    if (!strategy) {
      console.error('No error strategy found for:', error);
      return false;
    }

    let finalResult = true;
    for (const action of strategy.recovery) {
      const success = await this.executeRecoveryAction(action, error);
      if (!success) {
        finalResult = false;
        break;
      }
    }

    return finalResult;
  }

  /**
   * Execute a single recovery action
   */
  private async executeRecoveryAction(action: RecoveryAction, error: ModelError): Promise<boolean> {
    switch (action.type) {
      case 'retry':
        return await this.handleRetry(error, action.maxAttempts);
      
      case 'fallback':
        return await this.handleFallback(error, action.model);
      
      case 'notify':
        this.handleNotify(action.message);
        return true;
      
      case 'abort':
        this.handleNotify(`Error: ${error.message}`);
        return false;
      
      default:
        console.error('Unknown recovery action:', action);
        return false;
    }
  }

  /**
   * Handle retry recovery action
   */
  private async handleRetry(error: ModelError, maxAttempts: number): Promise<boolean> {
    const errorKey = `${error.type}-${Date.now()}`;
    const attempts = this.retryAttempts.get(errorKey) || 0;

    if (attempts >= maxAttempts) {
      this.retryAttempts.delete(errorKey);
      return false;
    }

    this.retryAttempts.set(errorKey, attempts + 1);
    
    // Add exponential backoff
    const delay = Math.min(1000 * Math.pow(2, attempts), 10000);
    await new Promise(resolve => setTimeout(resolve, delay));

    return true;
  }

  /**
   * Handle fallback recovery action
   */
  private async handleFallback(error: ModelError, fallbackModel: string): Promise<boolean> {
    console.log(`Falling back to model: ${fallbackModel}`);
    // TODO: Implement actual model switching logic
    this.handleNotify(`Switching to ${fallbackModel} model`);
    return true;
  }

  /**
   * Handle notify recovery action
   */
  private handleNotify(message: string): void {
    if (this.onNotify) {
      this.onNotify(message);
    } else {
      console.log('Notification:', message);
    }
  }

  /**
   * Handle abort recovery action
   */
  private handleAbort(reason: string): boolean {
    console.error('Operation aborted:', reason);
    return false;
  }

  /**
   * Create a ModelError from any error
   */
  static createModelError(error: any): ModelError {
    if (error instanceof ModelError) {
      return error;
    }

    // Handle API-specific errors
    if (error.response) {
      const status = error.response.status;
      if (status === 429) {
        return new ModelError(
          ModelErrorType.RESOURCE_UNAVAILABLE,
          'Too many requests. Please try again later.'
        );
      }
      if (status >= 500) {
        return new ModelError(
          ModelErrorType.API_ERROR,
          'Service temporarily unavailable.'
        );
      }
    }

    // Handle timeout errors
    if (error.code === 'ETIMEDOUT' || error.message?.includes('timeout')) {
      return new ModelError(
        ModelErrorType.LOADING_TIMEOUT,
        'Request timed out.'
      );
    }

    // Default to inference error
    return new ModelError(
      ModelErrorType.INFERENCE_ERROR,
      error.message || 'An unknown error occurred'
    );
  }
}
