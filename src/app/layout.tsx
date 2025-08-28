// app/layout.tsx
import "./globals.css";
import ClientProviders from "./ClientProviders";
import { Analytics } from "@vercel/analytics/next";

export const metadata = {
  title: "Real Estate Listings",
  description: "Browse properties and find your dream home",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-900 text-white">
        {/* ClientProviders is a client component */}
        <ClientProviders>{children}</ClientProviders>
        <Analytics />
      </body>
    </html>
  );
}
