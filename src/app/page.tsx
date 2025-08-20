"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { listings, Listing } from "@/data/listings";

export default function HomePage() {
  const [location, setLocation] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [category, setCategory] = useState("");
  const [filteredListings, setFilteredListings] = useState<Listing[]>(listings);

  const handleSearch = (
    newLocation: string = location,
    newType: string = propertyType,
    newPrice: string = priceRange,
    newCategory: string = category
  ) => {
    const filtered = listings.filter((l) => {
      const matchesLocation = l.location.toLowerCase().includes(newLocation.toLowerCase());
      const matchesType = newType ? l.type === newType : true;
      const matchesPrice = newPrice
        ? (() => {
            const priceNum = Number(l.price.replace(/[^0-9]/g, ""));
            if (newPrice === "$500 - $1000") return priceNum >= 500 && priceNum <= 1000;
            if (newPrice === "$1000 - $5000") return priceNum > 1000 && priceNum <= 5000;
            if (newPrice === "$5000+") return priceNum > 5000;
            return true;
          })()
        : true;
      const matchesCategory = newCategory ? l.type === newCategory : true;
      return matchesLocation && matchesType && matchesPrice && matchesCategory;
    });

    setFilteredListings(filtered);
  };

  const featured = filteredListings.slice(0, 3);

  return (
    <main className="bg-gray-900 text-white">
      {/* Hero Section */}
      <section className="relative h-[60vh]">
        <Image
          src="https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1920&q=80"
          alt="Real Estate Hero"
          fill
          className="object-cover opacity-60"
          priority
        />
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Find Your Dream Home</h1>
          <p className="mb-6 text-lg md:text-xl">Browse properties and connect with trusted agents.</p>

          {/* Search Filters */}
          <div className="bg-white text-gray-900 rounded-2xl shadow-xl p-6 flex flex-col md:flex-row gap-4 max-w-4xl w-full items-center">
            <input
              type="text"
              placeholder="Location"
              className="flex-1 p-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 transition outline-none w-full"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <select
              className="flex-1 p-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 transition outline-none w-full"
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
            >
              <option value="">Property Type</option>
              <option value="Home">Home</option>
              <option value="Villa">Villa</option>
              <option value="Apartment">Apartment</option>
              <option value="Commercial">Commercial</option>
            </select>
            <select
              className="flex-1 p-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 transition outline-none w-full"
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
            >
              <option value="">Price Range</option>
              <option>$500 - $1000</option>
              <option>$1000 - $5000</option>
              <option>$5000+</option>
            </select>
            <button
              className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 font-semibold w-full md:w-auto"
              onClick={() => handleSearch()}
            >
              Search
            </button>
          </div>
        </div>
      </section>

      {/* Listings Section */}
      <section className="py-12 px-6 max-w-6xl mx-auto">
        {(location || propertyType || priceRange || category) ? (
          <>
            <h2 className="text-3xl font-bold mb-6">Search Results</h2>
            {filteredListings.length === 0 ? (
              <p className="text-gray-400">No listings match your search.</p>
            ) : (
              <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-6">
                {filteredListings.map((listing) => (
                  <div key={listing.id} className="bg-gray-800 rounded-2xl shadow-lg overflow-hidden transition transform hover:scale-105 hover:shadow-blue-500/50">
                    <Image src={listing.image} alt={listing.title} width={400} height={250} className="w-full h-48 object-cover" />
                    <div className="p-4">
                      <h3 className="text-xl font-semibold">{listing.title}</h3>
                      <p className="text-gray-400">{listing.location}</p>
                      <p className="text-blue-400 font-bold mt-2">{listing.price}</p>
                      <Link href={`/listings/${listing.id}`} className="inline-block mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition">View Details</Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <h2 className="text-3xl font-bold mb-6">Featured Listings</h2>
            <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-6">
              {featured.map((listing) => (
                <div key={listing.id} className="bg-gray-800 rounded-2xl shadow-lg overflow-hidden transition transform hover:scale-105 hover:shadow-blue-500/50">
                  <Image src={listing.image} alt={listing.title} width={400} height={250} className="w-full h-48 object-cover" />
                  <div className="p-4">
                    <h3 className="text-xl font-semibold">{listing.title}</h3>
                    <p className="text-gray-400">{listing.location}</p>
                    <p className="text-blue-400 font-bold mt-2">{listing.price}</p>
                    <Link href={`/listings/${listing.id}`} className="inline-block mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition">View Details</Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      {/* Categories */}
      <section className="bg-gray-800 py-12 px-6">
        <h2 className="text-3xl font-bold text-center mb-8">Browse by Category</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {["Home", "Villa", "Apartment", "Commercial"].map((cat) => (
            <button key={cat} className={`bg-gray-700 text-white rounded-2xl p-6 text-center text-xl font-semibold transition-all duration-300 hover:bg-gray-600 hover:shadow-lg hover:shadow-blue-500/50 ${category === cat ? "border-2 border-blue-400 shadow-lg" : ""} w-full`}
              onClick={() => {
                setCategory(cat);
                setLocation("");
                setPropertyType("");
                setPriceRange("");
                handleSearch("", "", "", cat);
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Stats / Trust Section */}
      <section className="py-12 bg-gray-900 px-6">
        <div className="max-w-5xl mx-auto grid sm:grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <h3 className="text-4xl font-bold text-blue-500">500+</h3>
            <p className="mt-2 text-gray-400">Homes Sold</p>
          </div>
          <div>
            <h3 className="text-4xl font-bold text-blue-500">1200+</h3>
            <p className="mt-2 text-gray-400">Happy Customers</p>
          </div>
          <div>
            <h3 className="text-4xl font-bold text-blue-500">50+</h3>
            <p className="mt-2 text-gray-400">Verified Agents</p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gray-800 py-16 px-6">
        <h2 className="text-3xl font-bold text-center mb-10">What Our Clients Say</h2>
        <div className="max-w-6xl mx-auto grid sm:grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { name: "Sarah M.", text: "Finding my dream home was so easy. The search and agents were amazing!" },
            { name: "David R.", text: "I listed my apartment and it sold in just two weeks. Fantastic platform!" },
            { name: "Priya K.", text: "Professional, reliable, and lots of great listings. Highly recommended." },
          ].map((t, i) => (
            <div key={i} className="bg-gray-700 rounded-2xl p-6 shadow-md text-center">
              <p className="text-gray-300 italic mb-4">"{t.text}"</p>
              <h4 className="font-semibold text-white">- {t.name}</h4>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-center">
        <h2 className="text-4xl font-bold mb-4">Want to List Your Property?</h2>
        <p className="mb-6 text-lg">Reach thousands of buyers by listing your property with us today.</p>
        <Link
          href="/list-your-property"
          className="bg-white text-blue-600 px-6 py-3 rounded-md font-semibold hover:bg-gray-200 transition"
        >
          List a Property
        </Link>
      </section>
    </main>
  );
}