import { useCallback } from 'react';
import { userService } from '../services/userService';
import { WasteType } from '../types/waste';
import { auth } from '../config/firebase';
import { Timestamp } from 'firebase/firestore';

export const useStats = () => {
  const updateUserStats = useCallback(async (wasteType: WasteType) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.error('No user logged in');
        return;
      }
      
      // Create a minimal analysis result for stats update
      const result = {
        id: 'temp-' + Date.now(),
        userId: user.uid,
        imageUrl: '',
        processedImageUrl: '',
        timestamp: Timestamp.now(),
        status: 'completed' as const,
        result: {
          wasteType: wasteType,
          confidence: 1,
          metadata: {
            material: '',
            recyclable: wasteType !== 'non-recyclable'
          }
        }
      };
      
      await userService.updateUserStatistics(user.uid, result, 0);
    } catch (error) {
      console.error('Error updating user stats:', error);
    }
  }, []);

  return {
    updateUserStats
  };
};
