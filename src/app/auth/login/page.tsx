// app/auth/login/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function LoginPage() {
  const { login, sendVerificationEmail } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [showVerifyNotice, setShowVerifyNotice] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // ⏳ Cooldown countdown
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
      await login(email, password);

      // only verified users pass through login
      toast.success("Login successful!");
      router.push("/dashboard");
    } catch (err: any) {
      const message = err.message || "";

      if (message.toLowerCase().includes("verify your email")) {
        toast.warning("Please verify your email before logging in.");
        setShowVerifyNotice(true);
        setCooldown(60); // start cooldown at 60s
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

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-gray-800 rounded-md shadow-md space-y-6">
      {/* 📩 Verification notice appears above form */}
      {showVerifyNotice && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 p-4 rounded-lg text-center">
          <h2 className="text-xl font-bold mb-2">Verify Your Email</h2>
          <p className="mb-4">
            Your email <strong>{email}</strong> is not verified. Please check your
            inbox (or spam folder) and click the verification link.
          </p>
          <button
            onClick={handleResendVerification}
            disabled={cooldown > 0}
            className={`bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded transition-colors ${
              cooldown > 0 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            {cooldown > 0
              ? `Resend available in ${cooldown}s`
              : "Resend Verification Email"}
          </button>
        </div>
      )}

      {/* 🔐 Login form always visible */}
      <div>
        <h2 className="text-2xl font-bold mb-6 text-white">Login</h2>
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
          <button
            type="submit"
            disabled={loading}
            className={`bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors ${
              loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
