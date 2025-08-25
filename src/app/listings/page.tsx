import Link from "next/link";
import Image from "next/image";
import { listings } from "@/data/listings";

export default function ListingsPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-8">Available Listings</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((listing) => (
          <Link
            key={listing.id}
            href={`/listings/${listing.id}`}
            className="bg-gray-800 rounded-2xl shadow-md overflow-hidden hover:scale-105 transition-transform"
          >
            {/* Thumbnail */}
            <div className="relative w-full h-48">
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
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-1">{listing.title}</h2>
              <p className="text-blue-400 font-medium">{listing.price}</p>
              <p className="text-gray-400 text-sm mb-3">{listing.location}</p>

              {/* Features */}
              <div className="flex justify-between text-sm text-gray-300">
                <span>🛏 {listing.bedrooms} Beds</span>
                <span>🛁 {listing.bathrooms} Baths</span>
                <span>📐 {listing.area} sqft</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
