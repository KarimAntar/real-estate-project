// /app/auth/forgot-password.tsx
"use client";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      // TODO: Replace with real API call
      console.log("Send reset email to:", email);
      setMessage("Password reset instructions sent to your email.");
      setError("");
    } catch (err: any) {
      setError(err.message || "Failed to send reset email");
      setMessage("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-20">
      <h2 className="text-2xl font-bold mb-4">Forgot Password</h2>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      {message && <p className="text-green-500 mb-2">{message}</p>}
      <input
        type="email"
        placeholder="Your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border p-2 w-full mb-2"
        required
      />
      <button type="submit" className="bg-blue-600 text-white p-2 w-full">
        Send Reset Email
      </button>
    </form>
  );
}
