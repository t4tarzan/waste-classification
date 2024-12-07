import { WasteType } from '../types/waste';

// Model endpoints
const MODEL_ENDPOINTS = {
  wastenet: 'https://api-inference.huggingface.co/models/Dizex/waste-classification',
  trashnet: 'https://api-inference.huggingface.co/models/keremberke/trashnet-classification',
  taco: 'https://api-inference.huggingface.co/models/microsoft/taco'
} as const;

type ModelType = keyof typeof MODEL_ENDPOINTS;

// Rate limit handling
const RATE_LIMIT_DELAY = 60 * 60 * 1000; // 1 hour in milliseconds
const lastModelCall: { [key in ModelType]?: number } = {};

export interface ModelResult {
  category: WasteType | 'error';
  confidence: number;
  metadata: {
    material: string;
    recyclable: boolean;
    subcategories: string[];
    error?: string;
  };
}

class ModelService {
  private apiKey: string | undefined;

  constructor() {
    this.apiKey = process.env.REACT_APP_HUGGINGFACE_API_KEY;
    if (!this.apiKey) {
      console.error('REACT_APP_HUGGINGFACE_API_KEY is not set in environment variables');
    } else {
      console.log('ModelService initialized with API key:', this.apiKey.substring(0, 5) + '...');
    }
  }

  async convertImageToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  async processModel(
    modelName: ModelType,
    base64Image: string,
    maxRetries = 3,
    initialDelay = 1000
  ): Promise<ModelResult> {
    if (!this.apiKey) {
      console.error('Hugging Face API key is not configured');
      return this.createErrorResult('API key not configured');
    }

    // Check rate limit
    const lastCall = lastModelCall[modelName];
    if (lastCall) {
      const timeSinceLastCall = Date.now() - lastCall;
      if (timeSinceLastCall < RATE_LIMIT_DELAY) {
        return this.createErrorResult(`Rate limit in effect. Please try again in ${Math.ceil((RATE_LIMIT_DELAY - timeSinceLastCall) / 1000 / 60)} minutes`);
      }
    }

    let retryCount = 0;
    let delay = initialDelay;

    while (retryCount < maxRetries) {
      try {
        const response = await fetch(MODEL_ENDPOINTS[modelName], {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ inputs: base64Image })
        });

        if (!response.ok) {
          let errorMessage = `Failed to analyze image with ${modelName} model`;
          let errorData;
          
          try {
            errorData = await response.json();
            if (errorData.error) {
              errorMessage = errorData.error;
            }
          } catch {
            // If parsing error response fails, use default message
          }

          // Set error result for the model
          return {
            category: 'error',
            confidence: 0,
            metadata: {
              material: 'unknown',
              recyclable: false,
              subcategories: [],
              error: errorMessage
            }
          };

          // Throw error for retry logic
          if (response.status === 503) {
            throw new Error('Service Unavailable');
          }
          
          throw new Error(errorMessage);
        }

        const data = await response.json();
        console.log(`${modelName} model response:`, data);

        if (!data || !Array.isArray(data) || data.length === 0) {
          throw new Error('Invalid response format');
        }

        const predictions = data[0] as Record<string, number>;
        lastModelCall[modelName] = Date.now();
        
        switch (modelName) {
          case 'wastenet':
            return this.processWastenetResponse(predictions);
          case 'trashnet':
            return this.processTrashnetResponse(predictions);
          case 'taco':
            return this.processTacoResponse(predictions);
          default:
            throw new Error(`Unsupported model: ${modelName}`);
        }
      } catch (error) {
        console.error(`Error processing image with ${modelName} (attempt ${retryCount + 1}):`, error);
        
        if (retryCount === maxRetries - 1) {
          return this.createErrorResult(error instanceof Error ? error.message : 'Unknown error');
        }

        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
        retryCount++;
      }
    }

    return this.createErrorResult('Max retries exceeded');
  }

  async processModels(base64Image: string): Promise<Record<ModelType, ModelResult>> {
    const modelNames: ModelType[] = ['wastenet', 'trashnet', 'taco'];
    
    // Process models sequentially instead of in parallel to avoid rate limits
    const results: [ModelType, ModelResult][] = [];
    for (const modelName of modelNames) {
      try {
        const result = await this.processModel(modelName, base64Image);
        results.push([modelName, result]);
        // Add a small delay between model calls
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Error processing ${modelName}:`, error);
        results.push([modelName, this.createErrorResult('Processing failed')]);
      }
    }

    return Object.fromEntries(results) as Record<ModelType, ModelResult>;
  }

  private processWastenetResponse(predictions: Record<string, number>): ModelResult {
    try {
      const [label, confidence] = Object.entries(predictions).reduce((prev, curr) => 
        curr[1] > prev[1] ? curr : prev
      );

      const category = this.mapWastenetLabel(label);
      return {
        category,
        confidence,
        metadata: {
          material: this.inferMaterial(label),
          recyclable: this.isRecyclable(label),
          subcategories: []
        }
      };
    } catch (error) {
      console.error('Error processing wastenet response:', error);
      return this.createErrorResult('Failed to process wastenet response');
    }
  }

  private processTrashnetResponse(predictions: Record<string, number>): ModelResult {
    try {
      const [label, confidence] = Object.entries(predictions).reduce((prev, curr) => 
        curr[1] > prev[1] ? curr : prev
      );

      const category = this.mapTrashnetLabel(label);
      return {
        category,
        confidence,
        metadata: {
          material: this.inferMaterial(label),
          recyclable: this.isRecyclable(label),
          subcategories: []
        }
      };
    } catch (error) {
      console.error('Error processing trashnet response:', error);
      return this.createErrorResult('Failed to process trashnet response');
    }
  }

  private processTacoResponse(predictions: Record<string, number>): ModelResult {
    try {
      const [label, confidence] = Object.entries(predictions).reduce((prev, curr) => 
        curr[1] > prev[1] ? curr : prev
      );

      const category = this.mapTacoLabel(label);
      return {
        category,
        confidence,
        metadata: {
          material: this.inferMaterial(label),
          recyclable: this.isRecyclable(label),
          subcategories: this.getTacoSubcategories(label)
        }
      };
    } catch (error) {
      console.error('Error processing taco response:', error);
      return this.createErrorResult('Failed to process taco response');
    }
  }

  private createErrorResult(error: string): ModelResult {
    return {
      category: 'error',
      confidence: 0,
      metadata: {
        material: 'unknown',
        recyclable: false,
        subcategories: [],
        error
      }
    };
  }

  private mapWastenetLabel(label: string): WasteType | 'error' {
    const mapping: Record<string, WasteType> = {
      'paper': 'paper',
      'plastic': 'plastic',
      'metal': 'metal',
      'glass': 'glass',
      'organic': 'organic',
      'non-recyclable': 'non-recyclable',
      'hazardous': 'hazardous'
    };
    return mapping[label.toLowerCase()] || 'error';
  }

  private mapTrashnetLabel(label: string): WasteType | 'error' {
    const mapping: Record<string, WasteType> = {
      'paper': 'paper',
      'plastic': 'plastic',
      'metal': 'metal',
      'glass': 'glass',
      'organic': 'organic'
    };
    return mapping[label.toLowerCase()] || 'error';
  }

  private mapTacoLabel(label: string): WasteType | 'error' {
    const mapping: Record<string, WasteType> = {
      'paper': 'paper',
      'plastic': 'plastic',
      'metal': 'metal',
      'glass': 'glass',
      'organic': 'organic',
      'other': 'non-recyclable'
    };
    return mapping[label.toLowerCase()] || 'error';
  }

  private inferMaterial(label: string): string {
    return label.toLowerCase();
  }

  private isRecyclable(label: string): boolean {
    const recyclableCategories = ['paper', 'plastic', 'metal', 'glass'];
    return recyclableCategories.includes(label.toLowerCase());
  }

  private getTacoSubcategories(label: string): string[] {
    return [];
  }
}

export const modelService = new ModelService();
