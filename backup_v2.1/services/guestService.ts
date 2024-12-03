import { Timestamp } from 'firebase/firestore';
import type { ClassificationResult, WasteType } from '../types/waste';

const GUEST_STORAGE_KEY = 'guest_analysis';
const DAILY_LIMIT = 5;

interface GuestAnalysis {
  timestamp: number;
  imageUrl: string;
  result: ClassificationResult;
}

export const guestService = {
  // Get the number of analyses done today
  getDailyAnalysisCount: (): number => {
    const today = new Date().setHours(0, 0, 0, 0);
    const analyses = guestService.getStoredAnalyses();
    return analyses.filter(analysis => {
      const analysisDate = new Date(analysis.timestamp).setHours(0, 0, 0, 0);
      return analysisDate === today;
    }).length;
  },

  // Check if guest can perform more analyses
  canPerformAnalysis: (): boolean => {
    return guestService.getDailyAnalysisCount() < DAILY_LIMIT;
  },

  // Get remaining analyses for today
  getRemainingAnalyses: (): number => {
    return DAILY_LIMIT - guestService.getDailyAnalysisCount();
  },

  // Store analysis result
  storeAnalysis: (imageUrl: string, result: ClassificationResult): void => {
    const analyses = guestService.getStoredAnalyses();
    analyses.push({
      timestamp: Date.now(),
      imageUrl,
      result,
    });
    sessionStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(analyses));
  },

  // Get all stored analyses
  getStoredAnalyses: (): GuestAnalysis[] => {
    const stored = sessionStorage.getItem(GUEST_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  // Clear all stored analyses
  clearStoredAnalyses: (): void => {
    sessionStorage.removeItem(GUEST_STORAGE_KEY);
  },

  // Perform mock analysis (this will be replaced with real API calls later)
  performAnalysis: async (imageUrl: string): Promise<ClassificationResult> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock result - this will be replaced with actual API integration
    const mockResult: ClassificationResult = {
      wasteType: 'plastic' as WasteType,
      confidence: 0.85,
      imageUrl,
      timestamp: Timestamp.fromDate(new Date()),
    };

    return mockResult;
  },
};
