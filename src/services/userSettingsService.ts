import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { UserSettings } from '../types/user';
import type { AnalysisPreferences } from '../types/analysis';

const defaultUserSettings: UserSettings = {
  theme: 'system',
  notifications: {
    email: true,
    push: true
  },
  privacy: {
    shareAnalytics: false,
    publicProfile: false
  },
  analysisPreferences: {
    autoProcess: true,
    autoAnalyze: true,
    preferredModel: 'trashnet',
    notificationsEnabled: true,
    saveHistory: true,
    saveOriginalImages: true,
    confidenceThreshold: 0.7,
    maxStorageSize: 1000,  // 1GB default
    compressionQuality: 80, // 80% quality default
    modelSettings: {
      trashnet: {
        enabled: true,
        threshold: 0.7
      },
      taco: {
        enabled: true,
        threshold: 0.7
      },
      wastenet: {
        enabled: true,
        threshold: 0.7
      }
    }
  }
};

export const userSettingsService = {
  /**
   * Get user settings, creating default settings if they don't exist
   */
  async getUserSettings(userId: string): Promise<UserSettings> {
    const settingsRef = doc(db, 'users', userId, 'settings', 'preferences');
    const settingsSnap = await getDoc(settingsRef);
    
    if (!settingsSnap.exists()) {
      await setDoc(settingsRef, defaultUserSettings);
      return defaultUserSettings;
    }
    
    const settings = settingsSnap.data() as Partial<UserSettings>;
    // Ensure all required fields are present by merging with defaults
    return {
      theme: settings.theme ?? defaultUserSettings.theme,
      notifications: {
        email: settings.notifications?.email ?? defaultUserSettings.notifications.email,
        push: settings.notifications?.push ?? defaultUserSettings.notifications.push
      },
      privacy: {
        shareAnalytics: settings.privacy?.shareAnalytics ?? defaultUserSettings.privacy.shareAnalytics,
        publicProfile: settings.privacy?.publicProfile ?? defaultUserSettings.privacy.publicProfile
      },
      analysisPreferences: {
        autoProcess: settings.analysisPreferences?.autoProcess ?? defaultUserSettings.analysisPreferences.autoProcess,
        autoAnalyze: settings.analysisPreferences?.autoAnalyze ?? defaultUserSettings.analysisPreferences.autoAnalyze,
        preferredModel: settings.analysisPreferences?.preferredModel ?? defaultUserSettings.analysisPreferences.preferredModel,
        notificationsEnabled: settings.analysisPreferences?.notificationsEnabled ?? defaultUserSettings.analysisPreferences.notificationsEnabled,
        saveHistory: settings.analysisPreferences?.saveHistory ?? defaultUserSettings.analysisPreferences.saveHistory,
        saveOriginalImages: settings.analysisPreferences?.saveOriginalImages ?? defaultUserSettings.analysisPreferences.saveOriginalImages,
        confidenceThreshold: settings.analysisPreferences?.confidenceThreshold ?? defaultUserSettings.analysisPreferences.confidenceThreshold,
        maxStorageSize: settings.analysisPreferences?.maxStorageSize ?? defaultUserSettings.analysisPreferences.maxStorageSize,
        compressionQuality: settings.analysisPreferences?.compressionQuality ?? defaultUserSettings.analysisPreferences.compressionQuality,
        modelSettings: settings.analysisPreferences?.modelSettings ?? defaultUserSettings.analysisPreferences.modelSettings
      }
    };
  },

  /**
   * Update user settings
   */
  async updateUserSettings(
    userId: string,
    settings: Partial<UserSettings>
  ): Promise<void> {
    const settingsRef = doc(db, 'users', userId, 'settings', 'preferences');
    await updateDoc(settingsRef, settings);
  },

  /**
   * Update notification preferences
   */
  async updateNotifications(
    userId: string,
    notifications: Partial<UserSettings['notifications']>
  ): Promise<void> {
    const currentSettings = await this.getUserSettings(userId);
    await this.updateUserSettings(userId, {
      notifications: {
        ...currentSettings.notifications,
        ...notifications
      }
    });
  },

  /**
   * Update privacy preferences
   */
  async updatePrivacy(
    userId: string,
    privacy: Partial<UserSettings['privacy']>
  ): Promise<void> {
    const currentSettings = await this.getUserSettings(userId);
    await this.updateUserSettings(userId, {
      privacy: {
        ...currentSettings.privacy,
        ...privacy
      }
    });
  },

  /**
   * Update analysis preferences
   */
  async updateAnalysisPreferences(
    userId: string,
    preferences: Partial<AnalysisPreferences>
  ): Promise<void> {
    const currentSettings = await this.getUserSettings(userId);
    await this.updateUserSettings(userId, {
      analysisPreferences: {
        ...currentSettings.analysisPreferences,
        ...preferences
      }
    });
  }
};
