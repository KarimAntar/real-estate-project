//app/ClientProviders.tsx
"use client";

import { ReactNode } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "./components/Navbar"; // public site navbar
import Footer from "./components/Footer";

type Props = {
  children: ReactNode;
};

export default function ClientProviders({ children }: Props) {
  return (
    <AuthProvider>
      {/* Public site navbar */}
      <Navbar />

      {/* Page content */}
      <main>{children}</main>

      {/* Public site footer */}
      <Footer />

      {/* Toast notifications */}
      <ToastContainer position="top-right" autoClose={3000} />
    </AuthProvider>
  );
}
