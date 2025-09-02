"use client";

import { useState, useEffect } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/app/firebase/firebaseConfig";
import { toast } from "react-toastify";
import { Mail } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // ⏳ Cooldown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const actionCodeSettings = {
        url: `${window.location.origin}/auth/login`, // redirect after click
        handleCodeInApp: true,
      };

      await sendPasswordResetEmail(auth, email, actionCodeSettings);
      toast.success("Password reset email sent!");
      setCooldown(60); // 60s cooldown
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 text-white p-6 rounded-2xl shadow-md w-full max-w-md space-y-4"
      >
        <h2 className="text-2xl font-bold mb-2 text-center">Forgot Password</h2>
        <p className="text-gray-300 text-sm text-center">
          Enter your email to receive password reset instructions.
        </p>

        <input
          type="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />

        <button
          type="submit"
          disabled={loading || cooldown > 0}
          className={`w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded transition-colors ${
            loading || cooldown > 0 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
          }`}
        >
          <Mail className="w-5 h-5" />
          {loading
            ? "Sending..."
            : cooldown > 0
            ? `Retry in ${cooldown}s`
            : "Send Reset Email"}
        </button>

        <p className="text-center text-gray-400 text-sm">
          Remembered your password?{" "}
          <Link href="/auth/login" className="text-blue-400 hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
