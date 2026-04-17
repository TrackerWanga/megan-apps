import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signUp,
  signIn,
  signInWithGoogle,
  logOut,
  getUserProfile,
  auth
} from '../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Save token to localStorage
  const saveToken = async (firebaseUser) => {
    if (firebaseUser) {
      const token = await firebaseUser.getIdToken();
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        await saveToken(firebaseUser);
        const userProfile = await getUserProfile(firebaseUser.uid);
        setProfile(userProfile);
      } else {
        setUser(null);
        setProfile(null);
        localStorage.removeItem('token');
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleSignUp = async (email, password, displayName) => {
    const user = await signUp(email, password, displayName);
    setUser(user);
    await saveToken(user);
    const userProfile = await getUserProfile(user.uid);
    setProfile(userProfile);
    return user;
  };

  const handleSignIn = async (email, password) => {
    const user = await signIn(email, password);
    setUser(user);
    await saveToken(user);
    const userProfile = await getUserProfile(user.uid);
    setProfile(userProfile);
    return user;
  };

  const handleGoogleSignIn = async () => {
    const user = await signInWithGoogle();
    setUser(user);
    await saveToken(user);
    const userProfile = await getUserProfile(user.uid);
    setProfile(userProfile);
    return user;
  };

  const handleLogOut = async () => {
    await logOut();
    setUser(null);
    setProfile(null);
    localStorage.removeItem('token');
  };

  const value = {
    user,
    profile,
    loading,
    signUp: handleSignUp,
    signIn: handleSignIn,
    signInWithGoogle: handleGoogleSignIn,
    logOut: handleLogOut,
    isDeveloper: profile?.userType === 'developer'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
