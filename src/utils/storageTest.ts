import { ref, uploadBytes, getDownloadURL, listAll, uploadString, deleteObject } from 'firebase/storage';
import { storage } from '../config/firebase';

export const testStorageUpload = async (): Promise<void> => {
  try {
    console.log('Starting storage test...');

    // Test file upload
    const testData = new Blob(['Hello, Firebase Storage!'], { type: 'text/plain' });
    const testFile = new File([testData], 'test.txt', { type: 'text/plain' });
    const testRef = ref(storage, 'test/test.txt');
    
    const metadata = {
      contentType: 'text/plain',
      customMetadata: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    };
    
    await uploadBytes(testRef, testFile, metadata);
    console.log('Test file uploaded successfully');

    // Test file listing
    const listRef = ref(storage, 'test');
    const files = await listAll(listRef);
    console.log('Files listed successfully:', files.items.length);

    // Test download URL
    const downloadURL = await getDownloadURL(testRef);
    console.log('Download URL generated successfully:', downloadURL);

    console.log('Storage test completed successfully');
  } catch (error) {
    console.error('Storage test failed:', error);
    throw error;
  }
};

export const testStorageString = async (): Promise<void> => {
  try {
    const testRef = ref(storage, 'test.txt');
    const testContent = 'Test content: ' + new Date().toISOString();
    
    const metadata = {
      contentType: 'text/plain',
      customMetadata: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    };
    
    await uploadString(testRef, testContent);
    const downloadURL = await getDownloadURL(testRef);
    
    console.log('String upload test successful');
    console.log('Download URL:', downloadURL);
  } catch (error) {
    console.error('String upload test failed:', error);
    throw error;
  }
};

export const uploadTestImage = async (file: File): Promise<{ downloadURL: string }> => {
  try {
    const storageRef = ref(storage, `test-images/${file.name}`);
    const metadata = {
      contentType: file.type,
      customMetadata: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    };
    
    await uploadBytes(storageRef, file, metadata);
    const downloadURL = await getDownloadURL(storageRef);
    return { downloadURL };
  } catch (error) {
    console.error('Test image upload failed:', error);
    throw error;
  }
};
