export interface ClassificationResult {
  label: string;
  score: number;
}

export class WasteClassifier {
  private readonly modelEndpoint = 'https://api-inference.huggingface.co/models/watersplash/waste-classification';
  private readonly apiKey: string | undefined;

  constructor() {
    this.apiKey = process.env.REACT_APP_HUGGINGFACE_API_KEY;
    if (!this.apiKey) {
      console.error('REACT_APP_HUGGINGFACE_API_KEY is not set in environment variables');
    }
  }

  async classifyImage(imageData: string): Promise<ClassificationResult[]> {
    if (!this.apiKey) {
      throw new Error('API key not configured');
    }
    
    try {
      const response = await fetch(this.modelEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ inputs: imageData })
      });

      if (!response.ok) {
        let errorMessage = 'Failed to analyze image';
        try {
          const errorData = await response.json();
          if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch {
          // Use default error message if parsing fails
        }
        throw new Error(errorMessage);
      }

      const results = await response.json();
      return results.map((item: any) => ({
        label: item.label,
        score: item.score,
      }));
    } catch (error) {
      console.error('Error classifying image:', error);
      throw error;
    }
  }
}
