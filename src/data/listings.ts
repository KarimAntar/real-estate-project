// listings.ts
export interface Listing {
  id: number;
  title: string;
  location: string;
  price: string;
  description: string;
  type: "Home" | "Villa" | "Apartment" | "Commercial";
  bedrooms: number;
  bathrooms: number;
  area: number;
  images: string[];
}

export const listings: Listing[] = [
  {
    id: 1,
    title: "Modern Family House",
    location: "New York, NY",
    price: "$450,000",
    description: "A beautiful modern family home with 4 bedrooms and 3 bathrooms.",
    type: "Home",
    bedrooms: 4,
    bathrooms: 3,
    area: 2400,
    images: [
      "https://images.unsplash.com/photo-1572120360610-d971b9d7767c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    id: 2,
    title: "Luxury Villa",
    location: "Los Angeles, CA",
    price: "$1,200,000",
    description: "Spacious villa with swimming pool, garden, and amazing views.",
    type: "Villa",
    bedrooms: 5,
    bathrooms: 4,
    area: 3800,
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    id: 3,
    title: "Cozy City Apartment",
    location: "Chicago, IL",
    price: "$320,000",
    description: "A cozy apartment in the heart of the city with modern amenities.",
    type: "Apartment",
    bedrooms: 2,
    bathrooms: 1,
    area: 950,
    images: [
      "https://images.unsplash.com/photo-1718980887129-d2162fce2a46?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1648216771482-2f9b9c3d57ee?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1706200234277-3586cd003ba3?auto=format&fit=crop&w=1200&q=80",
    ],
  },
];
