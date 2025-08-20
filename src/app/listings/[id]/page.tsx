// src/app/listings/[id]/page.tsx
import { listings } from "@/data/listings";
import Image from "next/image";

// Only define the params shape
interface Props {
  params: {
    id: string;
  };
}

// Default export for the page
export default function ListingPage({ params }: Props) {
  // Convert id to number if your listings use number IDs
  const listing = listings.find((l) => l.id === Number(params.id));

  if (!listing) {
    return <p className="p-8 text-white">Listing not found</p>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-4">{listing.title}</h1>
      <Image
        src={listing.image}
        alt={listing.title}
        width={800}
        height={500}
        className="rounded-lg object-cover mb-4"
      />
      <p className="text-blue-400 text-xl mb-2">{listing.price}</p>
      <p className="text-gray-400 mb-2">{listing.location}</p>
      <p className="text-gray-200">{listing.description}</p>
    </div>
  );
}
