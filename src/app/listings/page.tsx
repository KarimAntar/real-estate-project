// src/app/listings/page.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { FaBed, FaBath, FaRulerCombined, FaMapMarkerAlt, FaSearch, FaFilter } from "react-icons/fa";
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "@/app/firebase/firebaseConfig";
import { Listing } from "@/types/listing";

interface FilterState {
  city: string;
  type: string;
  minPrice: string;
  maxPrice: string;
  minBedrooms: string;
  minBathrooms: string;
}

export default function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState<FilterState>({
    city: "",
    type: "",
    minPrice: "",
    maxPrice: "",
    minBedrooms: "",
    minBathrooms: "",
  });

  // Search state
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch listings from Firestore
  const fetchListings = async () => {
    try {
      setLoading(true);
      setError(null);

      // Create query to get all listings
      const listingsRef = collection(db, "listings");
      const q = query(
        listingsRef,
        orderBy("createdAt", "desc"),
        limit(50) // Limit to prevent large data loads
      );

      const querySnapshot = await getDocs(q);
      const fetchedListings: Listing[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedListings.push({
          id: data.id || doc.id,
          docId: doc.id,
          title: data.title || "",
          description: data.description || "",
          price: data.price || 0,
          city: data.city || "",
          type: data.type || "Home",
          bedrooms: data.bedrooms || 0,
          bathrooms: data.bathrooms || 0,
          area: data.area || 0,
          images: data.images || [],
          ownerId: data.ownerId || data.userId || "",
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        } as Listing);
      });

      setListings(fetchedListings);
      setFilteredListings(fetchedListings);
    } catch (err) {
      console.error("Error fetching listings:", err);
      setError("Failed to load listings. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Apply filters and search
  const applyFilters = () => {
    let filtered = [...listings];

    // Search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (listing) =>
          listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          listing.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          listing.city.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // City filter
    if (filters.city) {
      filtered = filtered.filter((listing) =>
        listing.city.toLowerCase().includes(filters.city.toLowerCase())
      );
    }

    // Property type filter
    if (filters.type) {
      filtered = filtered.filter((listing) => listing.type === filters.type);
    }

    // Price range filter
    if (filters.minPrice) {
      filtered = filtered.filter((listing) => listing.price >= Number(filters.minPrice));
    }
    if (filters.maxPrice) {
      filtered = filtered.filter((listing) => listing.price <= Number(filters.maxPrice));
    }

    // Bedrooms filter
    if (filters.minBedrooms) {
      filtered = filtered.filter((listing) => listing.bedrooms >= Number(filters.minBedrooms));
    }

    // Bathrooms filter
    if (filters.minBathrooms) {
      filtered = filtered.filter((listing) => listing.bathrooms >= Number(filters.minBathrooms));
    }

    setFilteredListings(filtered);
  };

  // Handle filter changes
  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      city: "",
      type: "",
      minPrice: "",
      maxPrice: "",
      minBedrooms: "",
      minBathrooms: "",
    });
    setSearchTerm("");
    setFilteredListings(listings);
  };

  // Format price for display
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Get placeholder image if no images
  const getImageSrc = (listing: Listing) => {
    if (listing.images && listing.images.length > 0) {
      return listing.images[0];
    }
    return "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80";
  };

  // Load listings on component mount
  useEffect(() => {
    fetchListings();
  }, []);

  // Apply filters when filters or search term change
  useEffect(() => {
    applyFilters();
  }, [filters, searchTerm, listings]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-xl text-gray-300">Loading amazing properties...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold mb-2 text-red-400">Oops! Something went wrong</h2>
              <p className="text-gray-300 mb-4">{error}</p>
              <button
                onClick={fetchListings}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Discover Your Dream Home
          </h1>
          <p className="text-xl text-blue-100 mb-8">
            Browse through {listings.length} carefully curated properties
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
              <input
                type="text"
                placeholder="Search by title, description, or city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-4 pl-12 pr-4 rounded-xl bg-white text-gray-900 placeholder-gray-500 text-lg focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filter Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-semibold">
                {filteredListings.length} Properties Found
              </h2>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors"
              >
                <FaFilter className="text-blue-400" />
                {showFilters ? "Hide Filters" : "Show Filters"}
              </button>
            </div>
            
            {(Object.values(filters).some(v => v) || searchTerm) && (
              <button
                onClick={clearFilters}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors"
              >
                Clear All Filters
              </button>
            )}
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="bg-gray-800 rounded-xl p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">City</label>
                  <input
                    type="text"
                    placeholder="Enter city"
                    value={filters.city}
                    onChange={(e) => handleFilterChange("city", e.target.value)}
                    className="w-full p-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Property Type</label>
                  <select
                    value={filters.type}
                    onChange={(e) => handleFilterChange("type", e.target.value)}
                    className="w-full p-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">All Types</option>
                    <option value="Home">Home</option>
                    <option value="Villa">Villa</option>
                    <option value="Apartment">Apartment</option>
                    <option value="Commercial">Commercial</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Min Price</label>
                  <input
                    type="number"
                    placeholder="Min price"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange("minPrice", e.target.value)}
                    className="w-full p-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Max Price</label>
                  <input
                    type="number"
                    placeholder="Max price"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
                    className="w-full p-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Min Bedrooms</label>
                  <select
                    value={filters.minBedrooms}
                    onChange={(e) => handleFilterChange("minBedrooms", e.target.value)}
                    className="w-full p-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Any</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
                    <option value="5">5+</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Min Bathrooms</label>
                  <select
                    value={filters.minBathrooms}
                    onChange={(e) => handleFilterChange("minBathrooms", e.target.value)}
                    className="w-full p-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Any</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Section */}
        {filteredListings.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🏠</div>
            <h3 className="text-2xl font-semibold mb-2">No properties found</h3>
            <p className="text-gray-400 mb-4">
              Try adjusting your search criteria or clearing the filters.
            </p>
            {(Object.values(filters).some(v => v) || searchTerm) && (
              <button
                onClick={clearFilters}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredListings.map((listing) => (
              <Link
                key={listing.docId || listing.id}
                href={`/listings/${listing.id}`}
                className="bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:scale-105 hover:shadow-xl transition-all duration-300 flex flex-col group"
              >
                {/* Image */}
                <div className="relative w-full h-56 overflow-hidden">
                  <Image
                    src={getImageSrc(listing)}
                    alt={listing.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                  <div className="absolute top-3 left-3 bg-blue-600 text-white px-2 py-1 rounded-lg text-sm font-medium">
                    {listing.type}
                  </div>
                  {listing.images && listing.images.length > 1 && (
                    <div className="absolute top-3 right-3 bg-black bg-opacity-70 text-white px-2 py-1 rounded-lg text-sm">
                      +{listing.images.length - 1} more
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-grow">
                  <h3 className="text-xl font-semibold mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
                    {listing.title}
                  </h3>
                  
                  <div className="flex items-center text-gray-400 mb-3">
                    <FaMapMarkerAlt className="text-blue-400 mr-1" />
                    <span className="text-sm">{listing.city}</span>
                  </div>

                  <p className="text-gray-300 text-sm mb-4 line-clamp-3 flex-grow">
                    {listing.description}
                  </p>

                  <div className="text-2xl font-bold text-blue-400 mb-4">
                    {formatPrice(listing.price)}
                  </div>

                  {/* Features */}
                  <div className="flex justify-between text-sm text-gray-300 bg-gray-700 rounded-lg p-3">
                    <div className="flex items-center gap-1">
                      <FaBed className="text-blue-400" />
                      <span>{listing.bedrooms}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FaBath className="text-blue-400" />
                      <span>{listing.bathrooms}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FaRulerCombined className="text-blue-400" />
                      <span>{listing.area}m²</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Load More Button - Future Enhancement */}
        {filteredListings.length >= 50 && (
          <div className="text-center mt-12">
            <button className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-3 rounded-lg font-medium transition-colors">
              Load More Properties
            </button>
          </div>
        )}
      </div>
    </div>
  );
}