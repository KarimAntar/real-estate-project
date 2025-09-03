// src/contexts/AuthContext.tsx
"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { auth, db } from "@/app/firebase/firebaseConfig"; // db = Firestore
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
  updateProfile,
  User,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export interface AppUser {
  uid: string;
  email: string;
  fullName?: string;
  emailVerified?: boolean;
  role: "user" | "admin"; // added role
}

interface AuthContextProps {
  user: AppUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
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

  // 🔹 fetch role from Firestore
  const fetchUserRole = async (uid: string) => {
    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          fullName: data.fullName || "",
          role: data.role || "user",
        };
      }
      return { fullName: "", role: "user" };
    } catch (err) {
      console.error("Failed to fetch user role:", err);
      return { fullName: "", role: "user" };
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await fetchToken(firebaseUser);

        const { fullName: dbFullName, role } = await fetchUserRole(firebaseUser.uid);

        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email || "",
          fullName: firebaseUser.displayName || dbFullName,
          emailVerified: firebaseUser.emailVerified,
          role,
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

    const { fullName: dbFullName, role } = await fetchUserRole(userCredential.user.uid);

    setUser({
      uid: userCredential.user.uid,
      email: userCredential.user.email || "",
      fullName: userCredential.user.displayName || dbFullName,
      emailVerified: userCredential.user.emailVerified,
      role,
    });
  };

  const register = async (fullName: string, email: string, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    if (auth.currentUser) {
      await updateProfile(auth.currentUser, { displayName: fullName });
      await sendEmailVerification(auth.currentUser);
    }

    await fetchToken(userCredential.user);

    // new user default role = "user"
    setUser({
      uid: userCredential.user.uid,
      email: userCredential.user.email || "",
      fullName,
      emailVerified: userCredential.user.emailVerified,
      role: "user",
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
