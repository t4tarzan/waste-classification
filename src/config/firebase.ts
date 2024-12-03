import { initializeApp, FirebaseApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, getMetadata, listAll } from 'firebase/storage';

// Validate required environment variables
const requiredEnvVars = [
  'REACT_APP_FIREBASE_API_KEY',
  'REACT_APP_FIREBASE_AUTH_DOMAIN',
  'REACT_APP_FIREBASE_PROJECT_ID',
  'REACT_APP_FIREBASE_STORAGE_BUCKET',
  'REACT_APP_FIREBASE_MESSAGING_SENDER_ID',
  'REACT_APP_FIREBASE_APP_ID',
] as const;

const missingEnvVars = requiredEnvVars.filter(
  (varName) => !process.env[varName]
);

if (missingEnvVars.length > 0) {
  console.error(
    'Missing required environment variables:',
    missingEnvVars.join(', '),
    '\nPlease check your .env file and ensure all required variables are set.'
  );
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

// Initialize Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  experimentalForceLongPolling: true, // Use long polling instead of QUIC
  experimentalAutoDetectLongPolling: true,
};

// Initialize Firebase services
let app: FirebaseApp;
let auth: ReturnType<typeof getAuth>;
let db: ReturnType<typeof getFirestore>;
let storage: ReturnType<typeof getStorage>;

try {
  // Initialize or get existing Firebase app
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  console.log('Firebase app initialized successfully');

  // Initialize services with error handling
  try {
    auth = getAuth(app);
    console.log('Firebase Auth initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase Auth:', error);
    throw error;
  }

  try {
    db = getFirestore(app);
    console.log('Firestore initialized successfully');
  } catch (error) {
    console.error('Error initializing Firestore:', error);
    throw error;
  }

  try {
    storage = getStorage(app);
    console.log('Firebase Storage initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase Storage:', error);
    throw error;
  }

  // Debug information in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Firebase configuration:', {
      projectId: app.options.projectId,
      storageBucket: app.options.storageBucket,
      authDomain: app.options.authDomain,
    });
  }
} catch (error) {
  console.error('Error initializing Firebase:', error);
  throw error;
}

// Initialize auth provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Custom storage upload function with CORS handling
export const uploadToStorage = async (
  path: string,
  file: File
): Promise<{ downloadURL: string }> => {
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
};

// Export initialized services
export { app, auth, db, storage, googleProvider };
export { ref, getDownloadURL, uploadBytes, listAll, getMetadata };