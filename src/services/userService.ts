import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  addDoc,
  type CollectionReference,
  type DocumentReference,
  getDocs,
  query,
  where
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject, getMetadata } from 'firebase/storage';
import { db, storage, auth } from '../config/firebase';
import type { UserProfile, Analysis, WasteType, UserSettings, UserStatistics } from '../types/index';

const defaultUserStatistics: UserStatistics = {
  totalAnalyses: 0,
  lastAnalysisDate: Timestamp.now(),
  wasteTypes: {
    plastic: 0,
    metal: 0,
    glass: 0,
    paper: 0,
    organic: 0,
    unknown: 0,
    'non-recyclable': 0,
    'hazardous': 0
  },
  averageConfidence: 0,
  totalStorageUsed: 0,
  analysisHistory: {
    daily: [],
    weekly: [],
    monthly: []
  },
  environmentalImpact: {
    co2Saved: 0,
    treesEquivalent: 0,
    waterSaved: 0
  }
};

const defaultUserSettings: UserSettings = {
  theme: 'system',
  notifications: {
    email: true,
    push: true
  },
  privacy: {
    shareAnalytics: true,
    publicProfile: false
  },
  analysisPreferences: {
    autoProcess: true,
    autoAnalyze: true,
    preferredModel: 'trashnet',
    notificationsEnabled: true,
    saveHistory: true,
    saveOriginalImages: true,
    confidenceThreshold: 0.8,
    maxStorageSize: 1000,
    compressionQuality: 80,
    modelSettings: {
      trashnet: {
        enabled: true,
        threshold: 0.7
      }
    }
  }
};

export const userService = {
  /**
   * Create a new user profile
   */
  async createUserProfile(
    uid: string,
    email: string,
    displayName?: string,
    photoURL?: string
  ): Promise<void> {
    try {
      const userRef = doc(db, 'users', uid);
      const now = Timestamp.now();
      
      const newUser: Omit<UserProfile, 'id'> = {
        uid,
        email,
        displayName: displayName || email.split('@')[0],
        photoURL: photoURL || undefined,
        createdAt: now,
        lastLoginAt: now,
        updatedAt: now.toDate(),
        settings: defaultUserSettings,
        statistics: defaultUserStatistics
      };
      
      await setDoc(userRef, newUser);
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  },

  /**
   * Get user profile
   */
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          uid: docSnap.id,
          email: data.email,
          displayName: data.displayName,
          photoURL: data.photoURL,
          createdAt: data.createdAt || Timestamp.now(),
          lastLoginAt: data.lastLoginAt || Timestamp.now(),
          updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date(),
          settings: {
            ...defaultUserSettings,
            ...data.settings
          },
          statistics: {
            ...defaultUserStatistics,
            ...data.statistics
          }
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  },

  /**
   * Update user profile
   */
  async updateUserProfile(
    uid: string,
    data: Partial<Omit<UserProfile, 'id' | 'uid'>>
  ): Promise<void> {
    try {
      const docRef = doc(db, 'users', uid);
      await updateDoc(docRef, {
        ...data,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  },

  /**
   * Update user email verification status
   */
  async updateEmailVerificationStatus(uid: string, isVerified: boolean): Promise<void> {
    try {
      const docRef = doc(db, 'users', uid);
      await updateDoc(docRef, {
        emailVerified: isVerified,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating email verification status:', error);
      throw error;
    }
  },

  /**
   * Get user's analysis statistics
   */
  async getUserStatistics(uid: string): Promise<UserStatistics> {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('User not found');
      }

      const data = docSnap.data();
      return {
        ...defaultUserStatistics,
        ...data.statistics
      };
    } catch (error) {
      console.error('Error getting user statistics:', error);
      throw error;
    }
  },

  /**
   * Update user statistics after analysis
   */
  async updateUserStatistics(
    uid: string, 
    result: Analysis,
    fileSize: number
  ): Promise<void> {
    try {
      const docRef = doc(db, 'users', uid);
      const stats = await this.getUserStatistics(uid);
      
      // Initialize wasteTypes if undefined
      const wasteTypes = stats.wasteTypes || {};
      const wasteType = result.result.wasteType || 'unclassified';
      wasteTypes[wasteType] = (wasteTypes[wasteType] || 0) + 1;

      // Initialize analysis history arrays if undefined
      const today = new Date();
      const daily = Array.from({ length: 7 }, (_, i) => 
        (stats.analysisHistory?.daily?.[i] || 0) + (i === today.getDay() ? 1 : 0)
      );
      const weekly = Array.from({ length: 5 }, (_, i) => 
        (stats.analysisHistory?.weekly?.[i] || 0) + (i === Math.floor(today.getDate() / 7) ? 1 : 0)
      );
      const monthly = Array.from({ length: 12 }, (_, i) => 
        (stats.analysisHistory?.monthly?.[i] || 0) + (i === today.getMonth() ? 1 : 0)
      );

      // Calculate new confidence
      const totalAnalyses = (stats.totalAnalyses || 0) + 1;
      const currentAvgConfidence = stats.averageConfidence || 0;
      const newConfidence = (
        (currentAvgConfidence * (totalAnalyses - 1)) + 
        (result.result.confidence || 0)
      ) / totalAnalyses;

      // Calculate environmental impact
      const currentImpact = stats.environmentalImpact || {
        co2Saved: 0,
        treesEquivalent: 0,
        waterSaved: 0
      };
      
      const environmentalImpact = {
        co2Saved: currentImpact.co2Saved + (wasteType === 'plastic' ? 0.5 : 0.2),
        treesEquivalent: currentImpact.treesEquivalent + 0.01,
        waterSaved: currentImpact.waterSaved + (wasteType === 'paper' ? 10 : 5)
      };

      // Update the document with all fields properly initialized
      await updateDoc(docRef, {
        statistics: {
          totalAnalyses,
          lastAnalysisDate: Timestamp.now(),
          wasteTypes,
          averageConfidence: newConfidence,
          totalStorageUsed: (stats.totalStorageUsed || 0) + (fileSize || 0),
          analysisHistory: {
            daily,
            weekly,
            monthly
          },
          environmentalImpact
        },
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating user statistics:', error);
      throw error;
    }
  },

  /**
   * Get user's analysis history
   */
  async getAnalysisHistory(uid: string): Promise<Analysis[]> {
    try {
      const userRef = doc(db, 'users', uid);
      const analysisRef = collection(userRef, 'analyses');
      const snapshot = await getDocs(analysisRef);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Analysis));
    } catch (error) {
      console.error('Error getting analysis history:', error);
      throw error;
    }
  },

  /**
   * Delete an analysis from user's history
   */
  async deleteAnalysis(uid: string, analysisId: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', uid);
      const analysisRef = doc(collection(userRef, 'analyses'), analysisId);
      await deleteDoc(analysisRef);
    } catch (error) {
      console.error('Error deleting analysis:', error);
      throw error;
    }
  },

  /**
   * Update profile picture
   */
  async updateProfilePicture(
    uid: string,
    file: File
  ): Promise<string> {
    try {
      console.log('Starting profile picture update...');
      const storageRef = ref(storage, `users/${uid}/profile-picture`);
      console.log('Uploading profile picture...');
      
      await uploadBytes(storageRef, file);
      console.log('Profile picture uploaded successfully');

      const downloadURL = await getDownloadURL(storageRef);
      console.log('Profile picture URL:', downloadURL);

      await this.updateUserProfile(uid, {
        photoURL: downloadURL,
        updatedAt: new Date()
      });

      return downloadURL;
    } catch (error) {
      console.error('Error updating profile picture:', error);
      throw error;
    }
  },

  /**
   * Delete profile picture
   */
  async deleteProfilePicture(uid: string): Promise<void> {
    try {
      // Delete profile picture if it exists
      try {
        const storageRef = ref(storage, `users/${uid}/profile-picture`);
        await deleteObject(storageRef);
        console.log('Profile picture deleted successfully');
      } catch (error) {
        // Ignore error if file doesn't exist
        console.log('No profile picture to delete or error deleting:', error);
      }

      // Update user profile
      await this.updateUserProfile(uid, {
        photoURL: undefined,
        updatedAt: new Date()
      });
      
      console.log('Profile picture removed from user profile');
    } catch (error) {
      console.error('Error deleting profile picture:', error);
      throw error;
    }
  },

  /**
   * Delete user profile and all associated data
   */
  async deleteUserProfile(uid: string): Promise<void> {
    try {
      // Delete profile picture if it exists
      try {
        const storageRef = ref(storage, `users/${uid}/profile-picture`);
        await deleteObject(storageRef);
        console.log('Profile picture deleted successfully');
      } catch (error) {
        // Ignore error if file doesn't exist
        console.log('No profile picture to delete or error deleting:', error);
      }

      // Delete user document
      const docRef = doc(db, 'users', uid);
      await deleteDoc(docRef);
      
      console.log('User profile deleted successfully');
    } catch (error) {
      console.error('Error deleting user profile:', error);
      throw error;
    }
  },

  /**
   * Save analysis result to user's history
   */
  async saveAnalysisResult(uid: string, result: Analysis): Promise<void> {
    console.log('Starting saveAnalysisResult with:', { uid, result });
    
    // Get user document reference
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      console.error('User document not found');
      throw new Error('User document not found');
    }

    // Create a new analysis document reference
    const analysisId = doc(collection(db, 'users', uid, 'analyses')).id;
    const analysisRef = doc(collection(db, 'users', uid, 'analyses'), analysisId);

    // Prepare analysis data
    const now = Timestamp.now();
    const analysisData: Analysis = {
      ...result,
      id: analysisId,
      userId: uid,
      timestamp: now,
      status: 'completed'
    };

    console.log('Saving analysis with data:', {
      path: `users/${uid}/analyses/${analysisId}`,
      data: analysisData
    });

    // Save the analysis result
    try {
      await setDoc(analysisRef, analysisData);
      console.log('Analysis document saved successfully');
    } catch (error) {
      console.error('Error saving analysis document:', error);
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          code: (error as any).code,
          name: error.name
        });
      }
      throw error;
    }

    // Update user statistics with the new analysis
    await this.updateUserStatistics(uid, analysisData, 0);
  },

  /**
   * Get remaining analyses for the day for a user
   */
  async getRemainingAnalyses(uid: string): Promise<number> {
    try {
      const userRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();
      
      if (!userData) {
        return 0;
      }

      const dailyLimit = 20; // Default daily limit for authenticated users
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const analysisRef = collection(userRef, 'analyses');
      const startOfDay = Timestamp.fromDate(today);
      
      const q = query(
        analysisRef,
        where('timestamp', '>=', startOfDay)
      );
      
      const snapshot = await getDocs(q);
      const usedToday = snapshot.size;

      return Math.max(0, dailyLimit - usedToday);
    } catch (error) {
      console.error('Error getting remaining analyses:', error);
      return 0;
    }
  },
};
