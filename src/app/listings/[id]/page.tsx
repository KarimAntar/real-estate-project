// src/app/listings/[id]/page.tsx
import { listings } from "@/data/listings";
import Image from "next/image";

// Manually define the type for the `params` prop
interface Props {
  params: {
    id: string;
  };
}

// The `params` object is correctly typed
export default function ListingPage({ params }: Props) {
  // Convert id to number for finding the listing
  const listing = listings.find((l) => l.id === Number(params.id));

  // Handle case where listing is not found
  if (!listing) {
    return (
      <p className="min-h-screen bg-gray-900 p-8 text-white">
        Listing not found
      </p>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl bg-gray-800 shadow-lg">
        {/* Use the Next.js Image component with the new styles */}
        <Image
          src={listing.image}
          alt={listing.title}
          width={1200}
          height={600}
          className="h-96 w-full object-cover"
        />
        <div className="p-6">
          <h1 className="mb-2 text-3xl font-bold">{listing.title}</h1>
          <p className="mb-2 text-xl text-blue-400">{listing.price}</p>
          <p className="mb-4 text-gray-400">{listing.location}</p>
          {/* Use the nullish coalescing operator (??) for a clean fallback */}
          <p className="text-gray-300">
            {listing.description ?? "No description available for this property."}
          </p>
        </div>
      </div>
    </div>
  );
}