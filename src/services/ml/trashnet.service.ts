import { TrashNetResult, ClassificationError } from './types';
import { Timestamp } from 'firebase/firestore';

// Base URL and endpoints
const BASE_URL = process.env.REACT_APP_TRASHNET_API_URL || 'http://localhost:5001';
const ENDPOINTS = {
  classify: '/api/classify',
  categories: '/api/categories'
};

export class TrashNetService {
  private static instance: TrashNetService;
  private readonly baseUrl: string;
  private readonly API_KEY: string;

  private constructor() {
    if (!BASE_URL) {
      throw new Error('TrashNet API endpoint not configured');
    }
    this.baseUrl = BASE_URL;
    this.API_KEY = process.env.REACT_APP_TRASHNET_API_KEY || 'mock_key';
  }

  public static getInstance(): TrashNetService {
    if (!TrashNetService.instance) {
      TrashNetService.instance = new TrashNetService();
    }
    return TrashNetService.instance;
  }

  private async urlToFile(url: string): Promise<File> {
    const response = await fetch(url);
    const blob = await response.blob();
    return new File([blob], 'image.jpg', { type: blob.type });
  }

  public async classifyImage(imageUrl: string): Promise<TrashNetResult> {
    try {
      // Convert URL to File
      const file = await this.urlToFile(imageUrl);
      
      // Create FormData
      const formData = new FormData();
      formData.append('image', file);

      const url = `${this.baseUrl}${ENDPOINTS.classify}`;
      console.log('Sending request to:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`TrashNet API error: ${response.statusText}. ${errorText}`);
      }

      const data = await response.json();
      console.log('TrashNet response:', data);
      
      // Ensure predictions are properly formatted
      const predictions: Record<string, number> = {};
      if (data.predictions) {
        Object.entries(data.predictions).forEach(([category, confidence]) => {
          predictions[category] = Number(confidence);
        });
      } else {
        // If no detailed predictions, use main category and confidence
        predictions[data.category] = data.confidence;
      }

      return {
        category: data.category,
        confidence: data.confidence,
        predictions,
        timestamp: Timestamp.now(),
        source: 'trashnet' as const
      };
    } catch (error) {
      console.error('TrashNet classification error:', error);
      const classificationError: ClassificationError = {
        code: 'TRASHNET_API_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        source: 'trashnet'
      };
      throw classificationError;
    }
  }

  public async getCategories(): Promise<string[]> {
    try {
      const url = `${this.baseUrl}${ENDPOINTS.categories}`;
      console.log('Fetching categories from:', url);

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.statusText}`);
      }

      const data = await response.json();
      return data.categories || [
        'glass',
        'paper',
        'cardboard',
        'plastic',
        'metal',
        'trash'
      ];
    } catch (error) {
      console.error('Error fetching TrashNet categories:', error);
      // Return default categories if API fails
      return [
        'glass',
        'paper',
        'cardboard',
        'plastic',
        'metal',
        'trash'
      ];
    }
  }
}
