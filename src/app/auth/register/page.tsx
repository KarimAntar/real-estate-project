"use client";

import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { auth } from "../../firebase/firebaseConfig";
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification, signOut, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { toast } from "react-toastify";
import { UserPlus } from "lucide-react";

export default function RegisterPage() {
  const { sendVerificationEmail } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showVerifyNotice, setShowVerifyNotice] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: fullName });
        await sendEmailVerification(auth.currentUser);
        await signOut(auth); // log out immediately
      }

      toast.success("Registration successful! Please verify your email before logging in.");
      setShowVerifyNotice(true);
    } catch (error: any) {
      toast.error(error.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      setLoading(true);
      await signInWithPopup(auth, provider);
      toast.success("Signed in with Google!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Google sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  if (showVerifyNotice) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-gray-800 rounded-md shadow-md text-center">
        <h2 className="text-2xl font-bold mb-4">Verify Your Email</h2>
        <p className="mb-4">
          A verification email has been sent to <strong>{email}</strong>. Please check your inbox (and spam folder) and click the verification link.
        </p>
        <button
          onClick={async () => {
            try {
              if (auth.currentUser) {
                await sendEmailVerification(auth.currentUser);
                toast.success("Verification email resent!");
              }
            } catch (err: any) {
              toast.error(err.message || "Failed to resend verification email.");
            }
          }}
          className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded"
        >
          Resend Verification Email
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-gray-800 rounded-md shadow-md space-y-6">
      <h2 className="text-2xl font-bold text-center mb-4">Register</h2>

      {/* Google Sign-In Button */}
      <button
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-white text-black px-4 py-2 rounded shadow hover:bg-gray-100 transition-colors"
      >
        <svg
          className="w-5 h-5"
          viewBox="0 0 48 48"
        >
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
        </svg>
        Sign in with Google
      </button>

      {/* OR separator */}
      <div className="text-white text-center font-bold text-xl my-4">OR</div>

      <form onSubmit={handleRegister} className="flex flex-col space-y-4">
        <input
          type="text"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
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

        <button
          type="submit"
          disabled={loading}
          className={`flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors ${
            loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
          }`}
        >
          {loading ? "Registering..." : <><UserPlus size={18}/> Register</>}
        </button>
      </form>
    </div>
  );
}
