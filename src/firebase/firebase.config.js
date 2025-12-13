import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

// Validate environment variables
const requiredEnvVars = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Check for missing environment variables
const missingVars = Object.entries(requiredEnvVars)
  .filter(([key, value]) => !value || value === 'your_firebase_' + key)
  .map(([key]) => `VITE_FIREBASE_${key.toUpperCase().replace(/([A-Z])/g, '_$1')}`);

if (missingVars.length > 0) {
  console.error('Missing Firebase environment variables:', missingVars.join(', '));
  console.error('Please create a .env file in the client folder with your Firebase credentials.');
}

const firebaseConfig = {
  apiKey: requiredEnvVars.apiKey,
  authDomain: requiredEnvVars.authDomain,
  projectId: requiredEnvVars.projectId,
  storageBucket: requiredEnvVars.storageBucket,
  messagingSenderId: requiredEnvVars.messagingSenderId,
  appId: requiredEnvVars.appId,
  measurementId: requiredEnvVars.measurementId,
};

// Only initialize if we have valid config
let app = null;
let auth = null;
let googleProvider = null;
let analytics = null;

// Check if all required config values are present
const hasValidConfig = requiredEnvVars.apiKey && 
                       requiredEnvVars.authDomain && 
                       requiredEnvVars.projectId &&
                       requiredEnvVars.apiKey !== 'your_firebase_apiKey';

if (hasValidConfig) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    
    // Configure Google provider settings
    googleProvider.setCustomParameters({
      prompt: 'select_account'
    });
    
    // Initialize Analytics only in browser environment
    if (typeof window !== 'undefined') {
      try {
        analytics = getAnalytics(app);
      } catch (analyticsError) {
        console.warn('Firebase Analytics initialization failed:', analyticsError);
        // Analytics is optional, continue without it
      }
    }
  } catch (error) {
    console.error('Firebase initialization error:', error);
    console.error('Please check your Firebase configuration in .env file');
    // Set to null if initialization fails
    app = null;
    auth = null;
    googleProvider = null;
  }
} else {
  console.warn('Firebase configuration incomplete. Firebase features will be disabled.');
  console.warn('To enable Firebase, add Firebase credentials to .env file.');
}

export { auth, googleProvider, analytics };
export default app;

