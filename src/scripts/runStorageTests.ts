import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, listAll, deleteObject, getDownloadURL } from 'firebase/storage';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Load environment variables
dotenv.config();

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runStorageTests() {
  try {
    console.log('Starting storage tests...');

    // Test 1: Upload a string as a file
    const testString = 'Hello, Firebase Storage!';
    const stringFile = ref(storage, 'test/string-test.txt');
    await uploadBytes(stringFile, Buffer.from(testString));
    console.log('✅ Successfully uploaded string as file');

    // Test 2: Upload a local test image
    const testImagePath = path.join(__dirname, 'test-image.jpg');
    if (!fs.existsSync(testImagePath)) {
      // Create a dummy test image if it doesn't exist
      fs.writeFileSync(testImagePath, 'Dummy image content');
    }
    const imageFile = ref(storage, 'test/test-image.jpg');
    await uploadBytes(imageFile, fs.readFileSync(testImagePath));
    console.log('✅ Successfully uploaded test image');

    // Test 3: List files in the test directory
    const listRef = ref(storage, 'test/');
    const { items } = await listAll(listRef);
    console.log('📁 Files in test directory:', items.map(item => item.name));

    // Test 4: Download the uploaded string file
    const downloadRef = ref(storage, 'test/string-test.txt');
    await uploadBytes(downloadRef, Buffer.from(testString));
    const downloadUrl = await getDownloadURL(downloadRef);
    const response = await fetch(downloadUrl);
    const downloadedContent = await response.text();
    console.log('📥 Downloaded content:', downloadedContent);

    // Test 5: Delete test files
    await Promise.all([
      deleteObject(ref(storage, 'test/string-test.txt')),
      deleteObject(ref(storage, 'test/test-image.jpg')),
    ]);
    console.log('🗑️ Successfully deleted test files');

    console.log('✨ All storage tests completed successfully!');
  } catch (error) {
    console.error('❌ Error during storage tests:', error);
    process.exit(1);
  }
}

runStorageTests();
