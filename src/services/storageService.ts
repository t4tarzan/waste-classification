import { ref, uploadBytes, getDownloadURL, StorageReference } from 'firebase/storage';
import { storage } from '../config/firebase';

export class StorageService {
  private static instance: StorageService;

  // Private constructor to enforce singleton pattern
  private constructor() {
    // Intentionally empty - no initialization needed
  }

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  async uploadTestImage(file: File): Promise<{ downloadURL: string }> {
    try {
      const testRef = ref(storage, `test/${file.name}`);
      const metadata = {
        contentType: file.type,
        customMetadata: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      };
      const snapshot = await uploadBytes(testRef, file, metadata);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return { downloadURL };
    } catch (error) {
      console.error('Error uploading test image:', error);
      throw error;
    }
  }

  async uploadWasteImage(file: File, userId: string): Promise<{ downloadURL: string }> {
    try {
      const wasteRef = ref(storage, `waste-images/${userId}/${file.name}`);
      const metadata = {
        contentType: file.type,
        customMetadata: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      };
      const snapshot = await uploadBytes(wasteRef, file, metadata);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return { downloadURL };
    } catch (error) {
      console.error('Error uploading waste image:', error);
      throw error;
    }
  }
}
