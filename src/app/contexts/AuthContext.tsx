// src/app/contexts/AuthContext.tsx
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
  User as FirebaseUser,
  updateProfile,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  query,
  collection,
  limit,
  getDocs,
} from "firebase/firestore";
import { auth, db } from "@/app/firebase/firebaseConfig";
import { AppUser, ProfileUpdateData } from "@/types/user";
import { toast } from "react-toastify";

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  updateUserProfile: (data: ProfileUpdateData) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if this is the first user (should be admin)
  const checkIfFirstUser = async (): Promise<boolean> => {
    try {
      const usersQuery = query(collection(db, "users"), limit(1));
      const snapshot = await getDocs(usersQuery);
      return snapshot.empty; // If no users exist, this is the first user
    } catch (error) {
      console.error("Error checking first user:", error);
      return false;
    }
  };

  // Create or update user document in Firestore
  const createUserDocument = async (
    firebaseUser: FirebaseUser,
    additionalData: any = {}
  ) => {
    const userRef = doc(db, "users", firebaseUser.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      // Check if this is the first user
      const isFirstUser = await checkIfFirstUser();
      
      // Extract Google photo URL if available
      let googlePhotoURL = "";
      let signInMethod = "email";
      
      if (firebaseUser.providerData?.length > 0) {
        const provider = firebaseUser.providerData[0];
        if (provider.providerId === "google.com") {
          googlePhotoURL = provider.photoURL || "";
          signInMethod = "google.com";
        }
      }

      const userData = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || "",
        fullName: additionalData.fullName || firebaseUser.displayName || "",
        emailVerified: firebaseUser.emailVerified,
        role: isFirstUser ? "admin" : "user", // First user gets admin role
        profilePicture: additionalData.profilePicture || "",
        googlePhotoURL: googlePhotoURL,
        signInMethod: signInMethod,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...additionalData,
      };

      await setDoc(userRef, userData);
      return userData;
    } else {
      // Update existing user data
      const existingData = userSnap.data();
      const updatedData = {
        ...existingData,
        emailVerified: firebaseUser.emailVerified,
        updatedAt: new Date().toISOString(),
        ...additionalData,
      };
      
      await updateDoc(userRef, updatedData);
      return updatedData;
    }
  };

  // Convert Firebase user to AppUser
  const convertToAppUser = async (firebaseUser: FirebaseUser): Promise<AppUser> => {
    const userRef = doc(db, "users", firebaseUser.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email || "",
        fullName: userData.fullName || firebaseUser.displayName || "",
        emailVerified: firebaseUser.emailVerified,
        role: userData.role || "user",
        profilePicture: userData.profilePicture || "",
        googlePhotoURL: userData.googlePhotoURL || "",
        signInMethod: userData.signInMethod || "email",
      };
    }

    // If user document doesn't exist, create it
    const userData = await createUserDocument(firebaseUser);
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email || "",
      fullName: userData.fullName || "",
      emailVerified: firebaseUser.emailVerified,
      role: userData.role || "user",
      profilePicture: userData.profilePicture || "",
      googlePhotoURL: userData.googlePhotoURL || "",
      signInMethod: userData.signInMethod || "email",
    };
  };

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const appUser = await convertToAppUser(firebaseUser);
          setUser(appUser);
        } catch (error) {
          console.error("Error converting user:", error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Login with email and password
  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Logged in successfully!");
    } catch (error: any) {
      console.error("Login error:", error);
      throw new Error(error.message || "Login failed");
    }
  };

  // Register with email and password
  const register = async (fullName: string, email: string, password: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update Firebase Auth profile
      await updateProfile(result.user, {
        displayName: fullName,
      });

      // Create Firestore user document
      await createUserDocument(result.user, { fullName });
      
      // Send verification email
      await sendEmailVerification(result.user);
      
      toast.success("Account created! Please verify your email.");
    } catch (error: any) {
      console.error("Registration error:", error);
      throw new Error(error.message || "Registration failed");
    }
  };

  // Login with Google
  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      
      const result = await signInWithPopup(auth, provider);
      
      // Create or update user document
      await createUserDocument(result.user);
      
      toast.success("Logged in with Google successfully!");
    } catch (error: any) {
      console.error("Google login error:", error);
      throw new Error(error.message || "Google login failed");
    }
  };

  // Logout
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error: any) {
      console.error("Logout error:", error);
      throw new Error(error.message || "Logout failed");
    }
  };

  // Send verification email
  const sendVerificationEmail = async () => {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    } else {
      throw new Error("No user signed in");
    }
  };

  // Update user profile
  const updateUserProfile = async (data: ProfileUpdateData) => {
    if (!user) throw new Error("No user signed in");

    try {
      const userRef = doc(db, "users", user.uid);
      const updateData = {
        ...data,
        updatedAt: new Date().toISOString(),
      };
      
      await updateDoc(userRef, updateData);
      
      // Update local user state
      setUser(prevUser => prevUser ? { ...prevUser, ...data } : null);
      
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      console.error("Profile update error:", error);
      throw new Error(error.message || "Profile update failed");
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    loginWithGoogle,
    logout,
    sendVerificationEmail,
    updateUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};