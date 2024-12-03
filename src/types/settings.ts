import { AnalysisPreferences } from './analysis';

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
