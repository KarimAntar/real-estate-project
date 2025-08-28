"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";

interface ProtectedRouteProps {
  children: ReactNode;
  requireVerifiedEmail?: boolean;
}

export default function ProtectedRoute({
  children,
  requireVerifiedEmail = false,
}: ProtectedRouteProps) {
  const { user, initializing, sendVerificationEmail } = useAuth(); // get initializing
  const router = useRouter();

  // Redirect if not logged in after Firebase finishes initializing
  useEffect(() => {
    if (!initializing && !user) {
      router.push("/auth/login");
    }
  }, [user, initializing, router]);

  // Show nothing while Firebase is initializing or redirecting
  if (initializing || !user) {
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

  return <>{children}</>;
}
