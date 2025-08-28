// /components/dashboard/ListingCard.tsx
"use client";

interface ListingCardProps {
  title: string;
  price: string;
  location: string;
  image: string;
}

export default function ListingCard({ title, price, location, image }: ListingCardProps) {
  return (
    <div className="border rounded shadow overflow-hidden">
      <img src={image} alt={title} className="w-full h-48 object-cover" />
      <div className="p-4">
        <h3 className="font-bold text-lg">{title}</h3>
        <p>{location}</p>
        <p className="text-blue-600 font-semibold">{price}</p>
      </div>
    </div>
  );
}
