// listings.ts
export interface Listing {
  id: number;
  title: string;
  location: string;
  price: string;
  image: string;
  description: string;
  type: "Home" | "Villa" | "Apartment" | "Commercial"; // added type
}

export const listings: Listing[] = [
  {
    id: 1,
    title: "Modern Family House",
    location: "New York, NY",
    price: "$450,000",
    image: "https://images.unsplash.com/photo-1572120360610-d971b9d7767c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    description: "A beautiful modern family home with 4 bedrooms and 3 bathrooms.",
    type: "Home",
  },
  {
    id: 2,
    title: "Luxury Villa",
    location: "Los Angeles, CA",
    price: "$1,200,000",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    description: "Spacious villa with swimming pool, garden, and amazing views.",
    type: "Villa",
  },
  {
    id: 3,
    title: "Cozy City Apartment",
    location: "Chicago, IL",
    price: "$320,000",
    image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    description: "A cozy apartment in the heart of the city with modern amenities.",
    type: "Apartment",
  },
  {
    id: 4,
    title: "Beachside Bungalow",
    location: "Miami, FL",
    price: "$600,000",
    image: "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    description: "Relaxing beach bungalow just steps from the ocean.",
    type: "Home",
  },
  {
    id: 5,
    title: "Mountain Cabin",
    location: "Aspen, CO",
    price: "$750,000",
    image: "https://plus.unsplash.com/premium_photo-1684863505736-c2016528804a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    description: "Rustic mountain cabin with scenic views and cozy interiors.",
    type: "Home",
  },
  {
    id: 6,
    title: "Downtown Loft",
    location: "San Francisco, CA",
    price: "$850,000",
    image: "https://images.unsplash.com/photo-1753182372047-5118a851913f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    description: "Trendy downtown loft with open space and natural light.",
    type: "Apartment",
  },
  {
    id: 7,
    title: "Suburban Home",
    location: "Seattle, WA",
    price: "$500,000",
    image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    description: "Comfortable suburban home with backyard and garage.",
    type: "Home",
  },
  {
    id: 8,
    title: "Modern Condo",
    location: "Boston, MA",
    price: "$420,000",
    image: "https://images.unsplash.com/photo-1572120360610-d971b9d7767c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    description: "Stylish condo with city views and amenities.",
    type: "Apartment",
  },
  {
    id: 9,
    title: "Luxury Penthouse",
    location: "New York, NY",
    price: "$2,500,000",
    image: "https://plus.unsplash.com/premium_photo-1661913412680-c274b6fea096?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    description: "Top-floor penthouse with panoramic city views and high-end finishes.",
    type: "Apartment",
  },
];
