// src/app/listings/[id]/page.tsx
import Image from "next/image";
import { notFound } from "next/navigation";
import { listings } from "@/data/listings";

// define the expected params shape
interface PageParams {
  id: string;
}

// the props type for App Router dynamic page
interface PageProps {
  params: PageParams;
}

export default function ListingPage({ params }: PageProps) {
  const listing = listings.find((item) => item.id === Number(params.id));

  if (!listing) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
        <div className="relative w-full h-96">
          <Image
            src={listing.image}
            alt={listing.title}
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-2">{listing.title}</h1>
          <p className="text-blue-400 text-xl mb-2">{listing.price}</p>
          <p className="text-gray-400 mb-4">{listing.location}</p>
          <p className="text-gray-300">
            {listing.description ?? "No description available."}
          </p>
        </div>
      </div>
    </div>
  );
}
