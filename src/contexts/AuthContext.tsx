import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
  GoogleAuthProvider,
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import { userService } from '../services/userService';
import { userLimitService } from '../services/userLimitService';
import { UserProfile } from '../types/user';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (data: { displayName?: string; photoURL?: string }) => Promise<void>;
  uploadProfilePicture: (file: File) => Promise<string>;
  deleteAccount: () => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  isEmailVerified: () => boolean;
  getRemainingAnalyses: () => Promise<number>;
  canPerformAnalysis: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const profile = await userService.getUserProfile(user.uid);
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signUp = async (email: string, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await userService.createUserProfile(
      userCredential.user.uid,
      email,
      userCredential.user.displayName ?? undefined,
      userCredential.user.photoURL ?? undefined
    );
    await sendEmailVerification(userCredential.user);
  };

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    
    // Check if profile exists, if not create it
    const profile = await userService.getUserProfile(userCredential.user.uid);
    if (!profile) {
      await userService.createUserProfile(
        userCredential.user.uid,
        userCredential.user.email!,
        userCredential.user.displayName ?? undefined,
        userCredential.user.photoURL ?? undefined
      );
    }

    // Update email verification status
    await userService.updateEmailVerificationStatus(
      userCredential.user.uid,
      userCredential.user.emailVerified
    );
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const updateUserProfile = async (data: { displayName?: string; photoURL?: string }) => {
    if (!currentUser) throw new Error('No user logged in');
    
    // Update Firebase Auth profile
    await updateProfile(currentUser, data);
    
    // Update Firestore profile
    await userService.updateUserProfile(currentUser.uid, data);
    const updatedProfile = await userService.getUserProfile(currentUser.uid);
    setUserProfile(updatedProfile);
  };

  const uploadProfilePicture = async (file: File) => {
    if (!currentUser) throw new Error('No user logged in');
    return userService.updateProfilePicture(currentUser.uid, file);
  };

  const deleteAccount = async () => {
    if (!currentUser) throw new Error('No user logged in');
    await userService.deleteUserProfile(currentUser.uid);
    await currentUser.delete();
  };

  const sendVerificationEmail = async () => {
    if (!currentUser) throw new Error('No user logged in');
    if (currentUser.emailVerified) throw new Error('Email already verified');
    await sendEmailVerification(currentUser);
  };

  const isEmailVerified = () => {
    return currentUser?.emailVerified ?? false;
  };

  const getRemainingAnalyses = async () => {
    if (!currentUser) throw new Error('No user logged in');
    return userLimitService.getRemainingAnalyses(currentUser.uid);
  };

  const canPerformAnalysis = async () => {
    if (!currentUser) return false;
    if (!currentUser.emailVerified) return false;
    return userLimitService.canPerformAnalysis(currentUser.uid);
  };

  const value = {
    currentUser,
    userProfile,
    loading,
    signUp,
    signIn,
    signOut,
    signInWithGoogle,
    resetPassword,
    updateUserProfile,
    uploadProfilePicture,
    deleteAccount,
    sendVerificationEmail,
    isEmailVerified,
    getRemainingAnalyses,
    canPerformAnalysis
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
