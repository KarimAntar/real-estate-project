"use client";
import Link from "next/link";
import { Facebook, Twitter, Instagram } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-800 py-8 mt-12">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-6 text-gray-400">
        <div>
          <h3 className="font-bold text-white mb-3">Real Estate Listings</h3>
          <p>Browse, buy, and rent properties with ease.</p>
        </div>
        <div>
          <h3 className="font-bold text-white mb-3">Quick Links</h3>
          <ul>
            <li><Link href="/about">About Us</Link></li>
            <li><Link href="/contact">Contact</Link></li>
            <li><Link href="/privacy">Privacy Policy</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Follow Us</h3>
          <div className="flex space-x-4">
            <a href="#" className="hover:text-blue-400"><Facebook className="w-5 h-5" /></a>
            <a href="#" className="hover:text-blue-400"><Twitter className="w-5 h-5" /></a>
            <a href="#" className="hover:text-blue-400"><Instagram className="w-5 h-5" /></a>
          </div>
        </div>
      </div>
      <p className="text-center text-gray-500 mt-6">
        © {new Date().getFullYear()} Real Estate Listings. All rights reserved.
      </p>
    </footer>
  );
}
