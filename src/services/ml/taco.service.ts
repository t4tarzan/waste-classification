import { TACOResult, ClassificationError } from './types';
import { Timestamp } from 'firebase/firestore';

const TACO_API_ENDPOINT = process.env.REACT_APP_TACO_API_URL || 'http://localhost:5001/mock/taco';
const TACO_API_KEY = process.env.REACT_APP_TACO_API_KEY || 'mock_key';

export class TACOService {
  private static instance: TACOService;
  private readonly API_URL: string;
  private readonly API_KEY: string;

  private constructor() {
    if (!TACO_API_ENDPOINT || !TACO_API_KEY) {
      throw new Error('TACO API configuration missing');
    }
    this.API_URL = TACO_API_ENDPOINT;
    this.API_KEY = TACO_API_KEY;
  }

  public static getInstance(): TACOService {
    if (!TACOService.instance) {
      TACOService.instance = new TACOService();
    }
    return TACOService.instance;
  }

  private async urlToFile(url: string): Promise<File> {
    const response = await fetch(url);
    const blob = await response.blob();
    return new File([blob], 'image.jpg', { type: blob.type });
  }

  public async classifyImage(
    imageUrl: string, 
    location?: { latitude: number; longitude: number }
  ): Promise<TACOResult> {
    try {
      // Convert URL to File
      const file = await this.urlToFile(imageUrl);
      
      // Create FormData
      const formData = new FormData();
      formData.append('image', file);
      if (location) {
        formData.append('location', JSON.stringify(location));
      }

      console.log('Sending request to:', `${this.API_URL}/analyze`);
      
      const response = await fetch(`${this.API_URL}/analyze`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`TACO API error: ${response.statusText}. ${errorText}`);
      }

      const data = await response.json();
      console.log('TACO response:', data);
      
      // Create predictions object from subcategories and confidence scores
      const predictions: Record<string, number> = {
        [data.category]: data.confidence
      };
      
      if (data.subcategory) {
        predictions[data.subcategory] = data.confidence;
      }
      
      if (data.alternativeCategories) {
        data.alternativeCategories.forEach((alt: { category: string; confidence: number }) => {
          predictions[alt.category] = alt.confidence;
        });
      }
      
      return {
        category: data.category,
        subcategory: data.subcategory,
        confidence: data.confidence,
        predictions,
        disposalRecommendation: data.disposalRecommendation,
        locationBasedSuggestion: data.locationBasedSuggestion,
        timestamp: Timestamp.now(),
        source: 'taco' as const
      };
    } catch (error) {
      console.error('TACO classification error:', error);
      const classificationError: ClassificationError = {
        code: 'TACO_API_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        source: 'taco'
      };
      throw classificationError;
    }
  }

  public async getLocalDisposalGuidelines(
    latitude: number,
    longitude: number
  ): Promise<{
    facilities: Array<{
      name: string;
      type: string;
      distance: number;
      address: string;
      acceptedItems: string[];
    }>;
    guidelines: Record<string, string>;
  }> {
    try {
      const response = await fetch(
        `${this.API_URL}/disposal-guidelines?lat=${latitude}&lng=${longitude}`,
        {
          headers: {
            'Authorization': `Bearer ${this.API_KEY}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`TACO API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error('Failed to fetch local disposal guidelines');
    }
  }

  public async getCategories(): Promise<string[]> {
    try {
      const response = await fetch(
        `${this.API_URL}/categories`,
        {
          headers: {
            'Authorization': `Bearer ${this.API_KEY}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.statusText}`);
      }

      const data = await response.json();
      return data.categories;
    } catch (error) {
      console.error('Error fetching TACO categories:', error);
      throw error;
    }
  }
}
