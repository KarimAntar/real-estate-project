// src/contexts/AuthContext.tsx
"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { auth, db } from "@/app/firebase/firebaseConfig";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
  updateProfile,
  User,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

export interface AppUser {
  uid: string;
  email: string;
  fullName?: string;
  emailVerified?: boolean;
  role: "user" | "admin";
  profilePicture?: string;
  googlePhotoURL?: string;
  signInMethod?: 'email' | 'google.com';
}

interface AuthContextProps {
  user: AppUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  updateUserProfile: (data: { fullName?: string; profilePicture?: string }) => Promise<void>;
  getIdToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchToken = async (firebaseUser: User) => {
    const token = await firebaseUser.getIdToken();
    localStorage.setItem("jwtToken", token);
    return token;
  };

  // 🔹 fetch/create user data in Firestore
  const fetchOrCreateUserData = async (firebaseUser: User) => {
    try {
      const userDocRef = doc(db, "users", firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      let userData;
      
      if (userDoc.exists()) {
        // User exists, get their data
        userData = userDoc.data();
      } else {
        // New user, create their document
        const providerData = firebaseUser.providerData[0];
        const signInMethod = providerData?.providerId || 'email';
        
        userData = {
          fullName: firebaseUser.displayName || "",
          email: firebaseUser.email || "",
          role: "user",
          profilePicture: "", // Will be set later if needed
          googlePhotoURL: signInMethod === 'google.com' ? firebaseUser.photoURL : "",
          signInMethod: signInMethod === 'google.com' ? 'google.com' : 'email',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        await setDoc(userDocRef, userData);
      }

      return {
        fullName: userData.fullName || "",
        role: userData.role || "user",
        profilePicture: userData.profilePicture || "",
        googlePhotoURL: userData.googlePhotoURL || "",
        signInMethod: userData.signInMethod || 'email',
      };
    } catch (err) {
      console.error("Failed to fetch/create user data:", err);
      return { 
        fullName: "", 
        role: "user" as const,
        profilePicture: "",
        googlePhotoURL: "",
        signInMethod: 'email' as const,
      };
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await fetchToken(firebaseUser);

        const userData = await fetchOrCreateUserData(firebaseUser);

        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email || "",
          fullName: userData.fullName,
          emailVerified: firebaseUser.emailVerified,
          role: userData.role,
          profilePicture: userData.profilePicture,
          googlePhotoURL: userData.googlePhotoURL,
          signInMethod: userData.signInMethod,
        });
      } else {
        localStorage.removeItem("jwtToken");
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);

    if (!userCredential.user.emailVerified) {
      await signOut(auth);
      throw new Error("Please verify your email before logging in.");
    }

    await fetchToken(userCredential.user);
    const userData = await fetchOrCreateUserData(userCredential.user);

    setUser({
      uid: userCredential.user.uid,
      email: userCredential.user.email || "",
      fullName: userData.fullName,
      emailVerified: userCredential.user.emailVerified,
      role: userData.role,
      profilePicture: userData.profilePicture,
      googlePhotoURL: userData.googlePhotoURL,
      signInMethod: userData.signInMethod,
    });
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });

    const userCredential = await signInWithPopup(auth, provider);
    await fetchToken(userCredential.user);
    
    const userData = await fetchOrCreateUserData(userCredential.user);

    setUser({
      uid: userCredential.user.uid,
      email: userCredential.user.email || "",
      fullName: userData.fullName,
      emailVerified: userCredential.user.emailVerified,
      role: userData.role,
      profilePicture: userData.profilePicture,
      googlePhotoURL: userData.googlePhotoURL,
      signInMethod: userData.signInMethod,
    });
  };

  const register = async (fullName: string, email: string, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    if (auth.currentUser) {
      await updateProfile(auth.currentUser, { displayName: fullName });
      await sendEmailVerification(auth.currentUser);
    }

    await fetchToken(userCredential.user);
    const userData = await fetchOrCreateUserData(userCredential.user);

    setUser({
      uid: userCredential.user.uid,
      email: userCredential.user.email || "",
      fullName: fullName,
      emailVerified: userCredential.user.emailVerified,
      role: userData.role,
      profilePicture: userData.profilePicture,
      googlePhotoURL: userData.googlePhotoURL,
      signInMethod: userData.signInMethod,
    });
  };

  const updateUserProfile = async (data: { fullName?: string; profilePicture?: string }) => {
    if (!user || !auth.currentUser) throw new Error("No user logged in");

    // Update Firebase Auth profile
    const profileUpdates: { displayName?: string; photoURL?: string } = {};
    if (data.fullName !== undefined) profileUpdates.displayName = data.fullName;
    if (data.profilePicture !== undefined) profileUpdates.photoURL = data.profilePicture;

    if (Object.keys(profileUpdates).length > 0) {
      await updateProfile(auth.currentUser, profileUpdates);
    }

    // Update Firestore document
    const userDocRef = doc(db, "users", user.uid);
    const firestoreUpdates = {
      ...data,
      updatedAt: new Date().toISOString(),
    };

    await updateDoc(userDocRef, firestoreUpdates);

    // Update local state
    setUser({
      ...user,
      fullName: data.fullName !== undefined ? data.fullName : user.fullName,
      profilePicture: data.profilePicture !== undefined ? data.profilePicture : user.profilePicture,
    });
  };

  const logout = async () => {
    await signOut(auth);
    localStorage.removeItem("jwtToken");
    setUser(null);
  };

  const sendVerificationEmail = async () => {
    if (auth.currentUser) await sendEmailVerification(auth.currentUser);
  };

  const getIdToken = async () => {
    if (!auth.currentUser) return null;
    return await auth.currentUser.getIdToken();
  };

  return (
    <AuthContext.Provider
      value={{ 
        user, 
        loading, 
        login, 
        loginWithGoogle,
        register, 
        logout, 
        sendVerificationEmail, 
        updateUserProfile,
        getIdToken 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};