// src/app/listings/[id]/page.tsx
import Image from "next/image";
import { listings } from "@/data/listings";

interface PageParams {
  id: string;
}

export default function ListingPage({ params }: { params: PageParams }) {
const listing = listings.find((l) => l.id === Number(params.id));

  if (!listing) return <p className="text-white p-8">Listing not found</p>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">{listing.title}</h1>

      <div className="relative w-full h-96 mb-6 rounded-xl overflow-hidden">
        <Image
          src={listing.image}
          alt={listing.title}
          fill
          className="object-cover"
        />
      </div>

      <p className="text-blue-400 text-xl mb-2">{listing.price}</p>
      <p className="text-gray-400 mb-4">{listing.location}</p>
      <p className="text-gray-300">{listing.description}</p>
    </div>
  );
}
