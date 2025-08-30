// app/layout.tsx
import "./globals.css";
import { poppins } from "./fonts";
import ClientProviders from "./ClientProviders";
import { Analytics } from "@vercel/analytics/next";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const metadata = {
  title: "Real Estate Listings",
  description: "Browse properties and find your dream home",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={poppins.className}>
      <body className="bg-gray-900 text-white">
        {/* ClientProviders is a client component */}
        <ClientProviders>{children}</ClientProviders>
        <Analytics />
        
        {/* Global Toast Notifications */}
        <ToastContainer
          position="top-center"   // ✅ Centered
          autoClose={3000}        // ⏱ auto close after 3s
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          draggable               // ✅ Draggable to clear
          pauseOnHover
          theme="colored"
        />
      </body>
    </html>
  );
}
