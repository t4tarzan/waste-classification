import { db } from '../config/firebase';
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import type { ClassificationResult } from './ml/types';

class UserService {
  private static instance: UserService;
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000; // 1 second
  private readonly UNLIMITED_ANALYSES = -1; // Special value to indicate unlimited analyses

  private constructor() {}

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  private async retry<T>(
    operation: () => Promise<T>,
    retries = this.MAX_RETRIES
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (retries > 0) {
        console.log(`Retrying operation, ${retries} attempts remaining`);
        await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY));
        return this.retry(operation, retries - 1);
      }
      throw error;
    }
  }

  public async getRemainingAnalyses(userId: string): Promise<number> {
    try {
      return await this.retry(async () => {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (!userDoc.exists()) {
          // Initialize authenticated user with unlimited analyses
          await setDoc(doc(db, 'users', userId), {
            remainingAnalyses: this.UNLIMITED_ANALYSES,
            lastReset: new Date(),
            isUnlimited: true
          });
          return this.UNLIMITED_ANALYSES;
        }
        
        const userData = userDoc.data();
        // If user is marked as unlimited or has UNLIMITED_ANALYSES value
        if (userData.isUnlimited || userData.remainingAnalyses === this.UNLIMITED_ANALYSES) {
          return this.UNLIMITED_ANALYSES;
        }
        
        return userData.remainingAnalyses || 0;
      });
    } catch (error) {
      console.error('Error getting remaining analyses:', error);
      // Return unlimited in case of error to prevent blocking users
      return this.UNLIMITED_ANALYSES;
    }
  }

  public async saveAnalysisResult(userId: string, result: ClassificationResult): Promise<void> {
    try {
      await this.retry(async () => {
        // Save the analysis result
        await setDoc(doc(db, 'users', userId, 'analyses', result.timestamp.toDate().getTime().toString()), {
          ...result,
          createdAt: result.timestamp
        });

        // Only decrement if user doesn't have unlimited analyses
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (!userData.isUnlimited && userData.remainingAnalyses !== this.UNLIMITED_ANALYSES) {
            await updateDoc(doc(db, 'users', userId), {
              remainingAnalyses: increment(-1)
            });
          }
        }
      });
    } catch (error) {
      console.error('Error saving analysis result:', error);
      throw error;
    }
  }
}

export const userService = UserService.getInstance();
