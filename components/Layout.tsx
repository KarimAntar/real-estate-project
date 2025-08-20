import Link from "next/link";
import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <header className="bg-white shadow-md">
        <nav className="container mx-auto flex justify-between items-center py-4 px-6">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            RealEstateCo
          </Link>
          <ul className="flex space-x-6">
            <li>
              <Link href="/" className="hover:text-blue-600">
                Home
              </Link>
            </li>
            <li>
              <Link href="/listings" className="hover:text-blue-600">
                Listings
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-blue-600">
                About Us
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-blue-600">
                Contact
              </Link>
            </li>
          </ul>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-grow">{children}</main>

      {/* Footer */}
      <footer className="bg-gray-100 text-center py-6 mt-10">
        <p className="text-gray-600">
          © {new Date().getFullYear()} RealEstateCo. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
