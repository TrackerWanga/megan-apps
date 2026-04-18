// Native Google Sign-In for Capacitor
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { 
  getAuth, 
  signInWithCredential, 
  GoogleAuthProvider,
  signOut as firebaseSignOut
} from 'firebase/auth';

// Initialize Google Auth
export const initializeGoogleAuth = async () => {
  try {
    await GoogleAuth.initialize({
      clientId: '599593422056-f4lpouihf09j8r33ibd6b6n8u9oqo81f.apps.googleusercontent.com',
      scopes: ['profile', 'email']
    });
    console.log('✅ Google Auth initialized');
  } catch (error) {
    console.error('Google Auth init error:', error);
  }
};

// Sign in with Google natively
export const signInWithGoogleNative = async () => {
  try {
    // 1. Sign in with Google natively
    const googleUser = await GoogleAuth.signIn();
    
    // 2. Get the ID token
    const idToken = googleUser.authentication.idToken;
    
    // 3. Create Firebase credential
    const credential = GoogleAuthProvider.credential(idToken);
    
    // 4. Sign in to Firebase
    const auth = getAuth();
    const result = await signInWithCredential(auth, credential);
    
    return result.user;
  } catch (error) {
    console.error('Native Google Sign-In failed:', error);
    throw error;
  }
};

// Sign out from Google
export const signOutGoogle = async () => {
  try {
    await GoogleAuth.signOut();
  } catch (error) {
    console.error('Google Sign-Out error:', error);
  }
};

// Refresh Google Auth (call on app resume)
export const refreshGoogleAuth = async () => {
  try {
    await GoogleAuth.refresh();
  } catch (error) {
    console.error('Google Auth refresh error:', error);
  }
};
