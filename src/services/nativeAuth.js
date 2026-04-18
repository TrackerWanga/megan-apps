import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { 
  getAuth, 
  signInWithCredential, 
  GoogleAuthProvider 
} from 'firebase/auth';

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

export const signInWithGoogleNative = async () => {
  try {
    console.log('Starting native Google Sign-In...');
    
    const googleUser = await GoogleAuth.signIn();
    console.log('Google Sign-In successful:', googleUser);
    
    const idToken = googleUser.authentication.idToken;
    
    const credential = GoogleAuthProvider.credential(idToken);
    const auth = getAuth();
    const result = await signInWithCredential(auth, credential);
    
    console.log('Firebase sign-in successful:', result.user.email);
    return result.user;
  } catch (error) {
    console.error('Native Google Sign-In error details:', JSON.stringify(error));
    
    if (error.message?.includes('popup closed')) {
      throw new Error('Sign-in was cancelled');
    } else if (error.message?.includes('network')) {
      throw new Error('Network error. Please check your connection.');
    } else if (error.message?.includes('DEVELOPER_ERROR')) {
      throw new Error('App configuration error. Please contact support.');
    }
    
    throw error;
  }
};

export const signOutGoogle = async () => {
  try {
    await GoogleAuth.signOut();
  } catch (error) {
    console.error('Google Sign-Out error:', error);
  }
};

export const refreshGoogleAuth = async () => {
  try {
    await GoogleAuth.refresh();
  } catch (error) {
    console.error('Google Auth refresh error:', error);
  }
};
