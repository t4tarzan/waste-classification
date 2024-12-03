import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  updateDoc, 
  increment, 
  Timestamp,
  setDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Analysis, AnalysisStats } from '../types/analysis';
import type { WasteType } from '../types/waste';

export const analysisService = {
  async getAnalyses(userId: string): Promise<Analysis[]> {
    const analysesRef = collection(db, 'analyses');
    const q = query(
      analysesRef,
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Analysis[];
  },

  async getRecentAnalyses(userId: string, limitCount = 5): Promise<Analysis[]> {
    const analysesRef = collection(db, 'analyses');
    const q = query(
      analysesRef,
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Analysis[];
  },

  async getAnalysisById(userId: string, analysisId: string): Promise<Analysis | null> {
    const analysisRef = doc(db, 'analyses', analysisId);
    const analysisDoc = await getDoc(analysisRef);

    if (!analysisDoc.exists() || analysisDoc.data()?.userId !== userId) {
      return null;
    }

    return {
      id: analysisDoc.id,
      ...analysisDoc.data()
    } as Analysis;
  },

  async getAnalysisStats(userId: string): Promise<AnalysisStats> {
    const statsRef = doc(db, 'users', userId, 'statistics', 'analysis');
    const statsDoc = await getDoc(statsRef);

    const defaultStats: AnalysisStats = {
      totalAnalyses: 0,
      wasteTypeCounts: {
        plastic: 0,
        metal: 0,
        glass: 0,
        paper: 0,
        organic: 0,
        unknown: 0
      },
      lastAnalysisDate: Timestamp.now(),
      averageConfidence: 0,
      totalStorageUsed: 0,
      recommendationCount: 0
    };

    if (!statsDoc.exists()) {
      await setDoc(statsRef, defaultStats);
      return defaultStats;
    }

    const stats = statsDoc.data() as Partial<AnalysisStats>;
    return {
      ...defaultStats,
      ...stats,
      wasteTypeCounts: {
        ...defaultStats.wasteTypeCounts,
        ...stats.wasteTypeCounts
      }
    };
  },

  async updateAnalysisStats(userId: string, wasteType: WasteType): Promise<void> {
    const statsRef = doc(db, 'users', userId, 'statistics', 'analysis');

    // Create the stats document if it doesn't exist
    const statsDoc = await getDoc(statsRef);
    if (!statsDoc.exists()) {
      await this.initializeAnalysisStats(userId);
    }

    // Update the stats using Firebase's increment function
    await updateDoc(statsRef, {
      totalAnalyses: increment(1),
      [`wasteTypeCounts.${wasteType}`]: increment(1),
      lastAnalysisDate: Timestamp.now()
    });
  },

  async initializeAnalysisStats(userId: string): Promise<void> {
    const statsRef = doc(db, 'users', userId, 'statistics', 'analysis');
    const initialStats: AnalysisStats = {
      totalAnalyses: 0,
      wasteTypeCounts: {
        plastic: 0,
        metal: 0,
        glass: 0,
        paper: 0,
        organic: 0,
        unknown: 0
      },
      lastAnalysisDate: Timestamp.now(),
      averageConfidence: 0,
      totalStorageUsed: 0,
      recommendationCount: 0
    };
    await setDoc(statsRef, initialStats);
  }
};
