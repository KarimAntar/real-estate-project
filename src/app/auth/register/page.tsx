"use client";

import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { auth } from "../../firebase/firebaseConfig";
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification, signOut } from "firebase/auth";
import { toast } from "react-toastify";

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
      // Create user with email/password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Update Firebase displayName
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: fullName });
        await sendEmailVerification(auth.currentUser);
        await signOut(auth); // log out immediately
      }

      toast.success("Registration successful! Please verify your email before logging in.");
      setShowVerifyNotice(true); // Show verification notice
    } catch (error: any) {
      toast.error(error.message || "Registration failed. Please try again.");
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
    <div className="max-w-md mx-auto mt-20 p-6 bg-gray-800 rounded-md shadow-md">
      <h2 className="text-2xl font-bold mb-6">Register</h2>
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
          className={`bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
  );
}
