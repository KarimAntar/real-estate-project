// src/app/components/dashboard/ProtectedRoute.tsx
"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";

interface ProtectedRouteProps {
  children: ReactNode;
  requireVerifiedEmail?: boolean;
  requireAdmin?: boolean; // ✅ added
}

export default function ProtectedRoute({
  children,
  requireVerifiedEmail = false,
  requireAdmin = false, // ✅ added
}: ProtectedRouteProps) {
  const { user, loading, sendVerificationEmail } = useAuth();
  const router = useRouter();

  // Redirect if not logged in after Firebase finishes initializing
  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  // Show nothing while Firebase is initializing or redirecting
  if (loading || !user) {
    return null;
  }

  // Handle unverified email
  if (requireVerifiedEmail && !user.emailVerified) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-yellow-100 text-black rounded-lg shadow">
        <p className="mb-4">
          Your email is not verified. Please check your inbox before continuing.
        </p>
        <button
          onClick={async () => {
            try {
              await sendVerificationEmail();
              toast.success("Verification email sent!");
            } catch (err: any) {
              toast.error(err.message || "Failed to send verification email.");
            }
          }}
          className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded"
        >
          Resend Verification Email
        </button>
      </div>
    );
  }

  // Handle admin-only access
  if (requireAdmin && user.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white shadow-lg rounded-xl p-10 text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Access Restricted
          </h1>
          <p className="text-gray-600 mb-6">
            You don’t have permission to view this page. <br />
            Only administrators can access it.
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
