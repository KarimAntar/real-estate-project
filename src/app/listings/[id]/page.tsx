// src/app/listings/[id]/page.tsx
import { notFound } from "next/navigation";
import { listings } from "@/data/listings";

// Generate static paths for each listing
export function generateStaticParams() {
  return listings.map(listing => ({ id: listing.id.toString() }));
}

// Page component — no custom props type needed
export default function ListingPage({ params }: { params: { id: string } }) {
  const listing = listings.find(item => item.id === Number(params.id));

  if (!listing) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
        <img
          src={listing.image}
          alt={listing.title}
          className="w-full h-96 object-cover"
        />
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-2">{listing.title}</h1>
          <p className="text-blue-400 text-xl mb-2">{listing.price}</p>
          <p className="text-gray-400 mb-4">{listing.location}</p>
          <p className="text-gray-300">
            {listing.description ?? "No description available for this property."}
          </p>
        </div>
      </div>
    </div>
  );
}
