"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { LogIn } from "lucide-react";
import Link from "next/link";
import { auth, db } from "../../firebase/firebaseConfig";
import {
  GoogleAuthProvider,
  signInWithPopup,
  fetchSignInMethodsForEmail,
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

export default function LoginPage() {
  const { login, sendVerificationEmail } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [showVerifyNotice, setShowVerifyNotice] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await setPersistence(
        auth,
        rememberMe ? browserLocalPersistence : browserSessionPersistence
      );

      await login(email, password);
      toast.success("Login successful!");
      router.push("/dashboard");
    } catch (err: any) {
      const message = err.message || "";
      if (message.toLowerCase().includes("verify your email")) {
        toast.warning("Please verify your email before logging in.");
        setShowVerifyNotice(true);
        setCooldown(60);
      } else if (
        message.includes("auth/wrong-password") ||
        message.includes("auth/user-not-found")
      ) {
        toast.error("Wrong email or password.");
      } else {
        toast.error(message || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      await sendVerificationEmail();
      toast.success("Verification email resent!");
      setCooldown(60);
    } catch (err: any) {
      toast.error(err.message || "Failed to resend verification email.");
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();

    try {
      await setPersistence(
        auth,
        rememberMe ? browserLocalPersistence : browserSessionPersistence
      );

      const result = await signInWithPopup(auth, provider);
      const googleUser = result.user;
      const googleEmail = googleUser.email;

      if (!googleEmail) throw new Error("No email found in Google account.");

      // Check if email exists as email/password
      const methods = await fetchSignInMethodsForEmail(auth, googleEmail);

      if (methods.includes("password")) {
        const existingPassword = prompt(
          `This email is already registered. Enter your password to sign in:`
        );
        if (!existingPassword) throw new Error("Password required to login.");

        await signInWithEmailAndPassword(auth, googleEmail, existingPassword);
        toast.success("Signed in successfully with your registered account!");
      }

      // Add Google user to Firestore if first-time login
      const userDocRef = doc(db, "users", googleUser.uid);
      const docSnap = await getDoc(userDocRef);
      if (!docSnap.exists()) {
        await setDoc(userDocRef, {
          email: googleEmail,
          fullName: googleUser.displayName || "",
          role: "user",
        });
        toast.success("First-time Google login saved to database!");
      }

      router.push("/dashboard");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Google sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-gray-800 rounded-md shadow-md space-y-6">
      {showVerifyNotice && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 p-4 rounded-lg text-center">
          <h2 className="text-xl font-bold mb-2">Verify Your Email</h2>
          <p className="mb-4">
            Your email <strong>{email}</strong> is not verified. Please check your inbox (or spam folder) and click the verification link.
          </p>
          <button
            onClick={handleResendVerification}
            disabled={cooldown > 0}
            className={`bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded transition-colors ${
              cooldown > 0 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            {cooldown > 0 ? `Resend available in ${cooldown}s` : "Resend Verification Email"}
          </button>
        </div>
      )}

      <h2 className="text-2xl font-bold mb-6">Login</h2>

      {/* Google Sign-In */}
      <button
        onClick={handleGoogleSignIn}
        className="w-full flex items-center justify-center gap-2 bg-white text-black px-4 py-2 rounded mb-4 hover:bg-gray-100 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-6 h-6">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          <path fill="none" d="M0 0h48v48H0z"/>
        </svg>
        Sign in with Google
      </button>


      <p className="text-center text-white font-bold my-2">OR</p>

      {/* Email/Password Login Form */}
      <form onSubmit={handleLogin} className="flex flex-col space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 accent-blue-500"
            id="rememberMe"
          />
          <label htmlFor="rememberMe" className="text-gray-300 text-sm">
            Remember me
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors ${
            loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
          }`}
        >
          {loading ? "Logging in..." : <><LogIn size={18} /> Login</>}
        </button>

        <p className="text-center text-sm text-blue-400 hover:underline cursor-pointer">
          <Link href="/auth/forgot-password">Forgot my password?</Link>
        </p>
      </form>

      <p className="text-center text-gray-300 mt-4">
        Not a member?{" "}
        <Link href="/auth/register" className="text-blue-400 hover:underline">
          Register here
        </Link>
      </p>
    </div>
  );
}
