import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

const AUTHENTICATED_DAILY_LIMIT = 30;

interface UserLimitData {
  dailyUsage: {
    date: Timestamp;
    count: number;
  };
}

export const userLimitService = {
  /**
   * Get user's daily usage count
   */
  async getDailyUsageCount(uid: string): Promise<number> {
    try {
      const userRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) return 0;
      
      const userData = userDoc.data() as { dailyUsage?: UserLimitData['dailyUsage'] };
      const dailyUsage = userData.dailyUsage;
      
      if (!dailyUsage) return 0;
      
      const today = new Date();
      const usageDate = dailyUsage.date.toDate();
      
      // Reset count if it's a new day
      if (usageDate.getDate() !== today.getDate() || 
          usageDate.getMonth() !== today.getMonth() || 
          usageDate.getFullYear() !== today.getFullYear()) {
        return 0;
      }
      
      return dailyUsage.count;
    } catch (error) {
      console.error('Error getting daily usage count:', error);
      throw error;
    }
  },

  /**
   * Check if user can perform more analyses
   */
  async canPerformAnalysis(uid: string): Promise<boolean> {
    const count = await this.getDailyUsageCount(uid);
    return count < AUTHENTICATED_DAILY_LIMIT;
  },

  /**
   * Get remaining analyses for today
   */
  async getRemainingAnalyses(uid: string): Promise<number> {
    const count = await this.getDailyUsageCount(uid);
    return AUTHENTICATED_DAILY_LIMIT - count;
  },

  /**
   * Increment daily usage count
   */
  async incrementDailyUsage(uid: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', uid);
      const currentCount = await this.getDailyUsageCount(uid);
      
      if (currentCount >= AUTHENTICATED_DAILY_LIMIT) {
        throw new Error('Daily limit exceeded');
      }

      await updateDoc(userRef, {
        'dailyUsage': {
          date: Timestamp.now(),
          count: currentCount + 1
        }
      });
    } catch (error) {
      console.error('Error incrementing daily usage:', error);
      throw error;
    }
  },

  /**
   * Reset daily usage count
   */
  async resetDailyUsage(uid: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        'dailyUsage': {
          date: Timestamp.now(),
          count: 0
        }
      });
    } catch (error) {
      console.error('Error resetting daily usage:', error);
      throw error;
    }
  }
};
