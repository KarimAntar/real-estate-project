"use client";
import Link from "next/link";
import Image from "next/image";
import { listings } from "@/data/listings";
import { FaBed, FaBath, FaRulerCombined } from "react-icons/fa";

export default function ListingsPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-10 text-center text-blue-400">
        Available Listings
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {listings.map((listing) => (
          <Link
            key={listing.id}
            href={`/listings/${listing.id}`}
            className="bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:scale-105 hover:shadow-xl transition-transform flex flex-col"
          >
            {/* Thumbnail */}
            <div className="relative w-full h-56">
              <Image
                src={
                  listing.images[0] ||
                  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c"
                }
                alt={listing.title}
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Info */}
            <div className="p-5 flex flex-col flex-grow">
              <h2 className="text-2xl font-semibold mb-1">{listing.title}</h2>
              <p className="text-blue-400 font-medium text-lg">{listing.price}</p>
              <p className="text-gray-400 text-sm mb-4">{listing.location}</p>

              {/* Features */}
              <div className="mt-auto grid grid-cols-3 gap-4 text-sm text-gray-300">
                <div className="flex items-center gap-2">
                  <FaBed className="text-blue-400" />
                  <span>{listing.bedrooms} Beds</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaBath className="text-blue-400" />
                  <span>{listing.bathrooms} Baths</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaRulerCombined className="text-blue-400" />
                  <span>{listing.area} sqft</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
