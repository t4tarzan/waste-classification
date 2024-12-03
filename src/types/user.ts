import { Timestamp } from 'firebase/firestore';
import { WasteType } from './waste';
import { AnalysisPreferences } from './analysis';

export interface UserProfile {
  id: string;
  uid?: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Timestamp;
  lastLoginAt: Timestamp;
  updatedAt?: Date;
  settings?: UserSettings;
  statistics?: UserStatistics;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  notifications: {
    email: boolean;
    push: boolean;
  };
  privacy: {
    shareAnalytics: boolean;
    publicProfile: boolean;
  };
  analysisPreferences: AnalysisPreferences;
}

export interface UserStatistics {
  totalAnalyses: number;
  lastAnalysisDate: Timestamp;
  wasteTypes: {
    [key in WasteType]: number;
  };
  averageConfidence: number;
  totalStorageUsed: number; // in bytes
  analysisHistory: {
    daily: number[];
    weekly: number[];
    monthly: number[];
  };
  environmentalImpact: {
    co2Saved: number; // in kg
    treesEquivalent: number;
    waterSaved: number; // in liters
  };
}
