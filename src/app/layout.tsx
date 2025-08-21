// app/layout.tsx
import "./globals.css";
import Link from "next/link";
import Image from "next/image";
import { Poppins } from "next/font/google";
import { Facebook, Twitter, Instagram } from "lucide-react";
import { Analytics } from '@vercel/analytics/next';

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata = {
  title: "Real Estate Listings",
  description: "Browse properties and find your dream home",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${poppins.className} bg-gray-900 text-white`}>
        {/* Navbar */}
        <nav className="bg-gray-800 p-4 shadow-lg">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            {/* Logo + Title */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="relative w-10 h-10">
                <Image
                  src="https://cdn-icons-png.flaticon.com/512/10365/10365152.png"
                  alt="Real Estate Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <h1 className="text-xl font-bold">Real Estate</h1>
            </Link>

            {/* Links */}
            <div className="space-x-6">
              <Link href="/" className="hover:text-blue-400">
                Home
              </Link>
              <Link href="/listings" className="hover:text-blue-400">
                Listings
              </Link>
              <Link href="/about" className="hover:text-blue-400">
                About
              </Link>
              <Link href="/contact" className="hover:text-blue-400">
                Contact
              </Link>
            </div>
          </div>
        </nav>

        {/* Page Content */}
        <main>{children}</main>

        {/* Footer */}
        <footer className="bg-gray-800 py-8 mt-12">
          <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-6 text-gray-400">
            <div>
              <h3 className="font-bold text-white mb-3">Real Estate Listings</h3>
              <p>Browse, buy, and rent properties with ease.</p>
            </div>
            <div>
              <h3 className="font-bold text-white mb-3">Quick Links</h3>
              <ul>
                <li>
                  <Link href="/about">About Us</Link>
                </li>
                <li>
                  <Link href="/contact">Contact</Link>
                </li>
                <li>
                  <Link href="/privacy">Privacy Policy</Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Follow Us</h3>
              <div className="flex space-x-4">
                <a href="#" className="hover:text-blue-400">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="hover:text-blue-400">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="hover:text-blue-400">
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
          <p className="text-center text-gray-500 mt-6">
            © {new Date().getFullYear()} Real Estate Listings. All rights reserved.
          </p>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
