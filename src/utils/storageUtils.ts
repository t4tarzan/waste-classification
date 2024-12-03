import { ref, uploadBytes, getDownloadURL, listAll, getMetadata } from 'firebase/storage';
import { storage } from '../config/firebase';
import type { StorageFile } from '../types/storage';

export const listFiles = async (path = ''): Promise<StorageFile[]> => {
  try {
    console.log('Listing files from path:', path);
    const storageRef = ref(storage, path);
    const result = await listAll(storageRef);

    const filePromises = result.items.map(async (item) => {
      try {
        const metadata = await getMetadata(item);
        const downloadUrl = await getDownloadURL(item);

        return {
          name: item.name,
          path: path,
          fullPath: item.fullPath,
          downloadUrl: downloadUrl,
          contentType: metadata.contentType || 'application/octet-stream',
          size: metadata.size,
          timeCreated: metadata.timeCreated,
          updated: metadata.updated,
          type: metadata.contentType?.split('/')[1] || 'unknown',
          url: downloadUrl,
          lastModified: new Date(metadata.updated),
          metadata: metadata.customMetadata
        } as StorageFile;
      } catch (error) {
        console.error(`Error processing file ${item.name}:`, error);
        return null;
      }
    });

    const files = await Promise.all(filePromises);
    return files.filter((file): file is StorageFile => file !== null);
  } catch (error) {
    console.error('Error listing files:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
    throw error;
  }
};

export const uploadFile = async (path: string, file: File): Promise<{ downloadURL: string }> => {
  try {
    const storageRef = ref(storage, path);
    const metadata = {
      contentType: file.type,
      customMetadata: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    };

    const snapshot = await uploadBytes(storageRef, file, metadata);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return { downloadURL };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

export const getFileUrl = async (path: string): Promise<string> => {
  try {
    const storageRef = ref(storage, path);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error('Error getting file URL:', error);
    throw error;
  }
};
