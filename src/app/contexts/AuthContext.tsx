"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { auth } from "@/app/firebase/firebaseConfig";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
  updateProfile,
  User,
} from "firebase/auth";

interface AppUser {
  uid: string;
  email: string;
  fullName?: string;
  emailVerified?: boolean;
}

interface AuthContextProps {
  user: AppUser | null;
  loading: boolean; // 🔹 auth initialization
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true); // 🔹 initializing auth

  const fetchToken = async (firebaseUser: User) => {
    const token = await firebaseUser.getIdToken();
    localStorage.setItem("jwtToken", token);
    return token;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await fetchToken(firebaseUser);
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email || "",
          fullName: firebaseUser.displayName || "",
          emailVerified: firebaseUser.emailVerified,
        });
      } else {
        localStorage.removeItem("jwtToken");
        setUser(null);
      }
      setLoading(false); // ✅ done checking auth state
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

    setUser({
      uid: userCredential.user.uid,
      email: userCredential.user.email || "",
      fullName: userCredential.user.displayName || "",
      emailVerified: userCredential.user.emailVerified,
    });
  };

  const register = async (fullName: string, email: string, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    if (auth.currentUser) {
      await updateProfile(auth.currentUser, { displayName: fullName });
      await sendEmailVerification(auth.currentUser);
    }

    await fetchToken(userCredential.user);

    setUser({
      uid: userCredential.user.uid,
      email: userCredential.user.email || "",
      fullName,
      emailVerified: userCredential.user.emailVerified,
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
      value={{ user, loading, login, register, logout, sendVerificationEmail, getIdToken }}
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
