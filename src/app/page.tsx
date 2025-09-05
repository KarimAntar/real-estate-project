"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { listings, Listing } from "@/data/listings";
import { FaBed, FaBath, FaRulerCombined, FaMapMarkerAlt, FaSearch, FaHome, FaUsers, FaHandshake, FaAward, FaChartLine, FaArrowRight } from "react-icons/fa";

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
  
  const stats = [
    { icon: FaHome, number: "500+", label: "Properties Sold", color: "text-blue-400" },
    { icon: FaUsers, number: "1,200+", label: "Happy Customers", color: "text-green-400" },
    { icon: FaHandshake, number: "50+", label: "Verified Agents", color: "text-purple-400" },
    { icon: FaAward, number: "5", label: "Years Experience", color: "text-yellow-400" },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Hero Section */}
      <section className="relative h-[80vh]">
        <Image
          src="https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1920&q=80"
          alt="Real Estate Hero"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/70 to-gray-900/90 flex flex-col justify-center items-center text-center px-6">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Find Your <span className="text-blue-400">Dream Home</span>
          </h1>
          <p className="mb-8 text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Browse our exclusive listings and connect with trusted agents to discover your perfect property
          </p>

          {/* Search Filters */}
          <div className="bg-gray-800 rounded-2xl shadow-xl p-6 flex flex-col md:flex-row gap-4 max-w-4xl w-full items-center">
            <input
              type="text"
              placeholder="Location"
              className="flex-1 p-3 rounded-xl bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition outline-none w-full"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <select
              className="flex-1 p-3 rounded-xl bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition outline-none w-full"
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
              className="flex-1 p-3 rounded-xl bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition outline-none w-full"
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
            >
              <option value="">Price Range</option>
              <option>$500 - $1000</option>
              <option>$1000 - $5000</option>
              <option>$5000+</option>
            </select>
            <button
              className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 font-semibold w-full md:w-auto flex items-center justify-center gap-2 group"
              onClick={() => handleSearch()}
            >
              <FaSearch className="group-hover:scale-110 transition-transform" />
              Search
            </button>
          </div>
        </div>
      </section>

      {/* Listings Section */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        {(location || propertyType || priceRange || category) ? (
          <>
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">
                Search <span className="text-blue-400">Results</span>
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                {filteredListings.length === 0 ? "No properties match your search criteria." : `Found ${filteredListings.length} properties matching your search`}
              </p>
            </div>
            {filteredListings.length === 0 ? (
              <div className="text-center py-16 bg-gray-800 rounded-2xl">
                <div className="text-6xl mb-4">😢</div>
                <h3 className="text-2xl font-semibold mb-2">No properties found</h3>
                <p className="text-gray-400 mb-6 max-w-md mx-auto">
                  Try adjusting your search criteria or explore our featured listings.
                </p>
                <button
                  onClick={() => {
                    setLocation("");
                    setPropertyType("");
                    setPriceRange("");
                    setCategory("");
                    setFilteredListings(listings);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-colors"
                >
                  Clear Search
                </button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-6">
                {filteredListings.map((listing) => (
                  <div key={listing.id} className="bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:scale-105 hover:shadow-xl transition-all duration-300 group">
                    <div className="relative">
                      <Image src={listing.images[0]} alt={listing.title} width={400} height={250} className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-300" />
                      <div className="absolute top-3 left-3 bg-blue-600 text-white px-2 py-1 rounded-lg text-sm font-medium">
                        {listing.type}
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-400 transition-colors">{listing.title}</h3>
                      <div className="flex items-center text-gray-400 mb-3">
                        <FaMapMarkerAlt className="text-blue-400 mr-1" />
                        <span className="text-sm">{listing.location}</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-400 mb-4">{listing.price}</p>
                      <div className="flex justify-between text-sm text-gray-300 bg-gray-700 rounded-lg p-3 mb-4">
                        <div className="flex items-center gap-1">
                          <FaBed className="text-blue-400" />
                          <span>3</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FaBath className="text-blue-400" />
                          <span>2</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FaRulerCombined className="text-blue-400" />
                          <span>200m²</span>
                        </div>
                      </div>
                      <Link href={`/listings/${listing.id}`} className="inline-block w-full text-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl transition-colors font-medium">View Details</Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">
                Featured <span className="text-blue-400">Properties</span>
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Discover our handpicked selection of premium properties
              </p>
            </div>
            <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-6">
              {featured.map((listing) => (
                <div key={listing.id} className="bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:scale-105 hover:shadow-xl transition-all duration-300 group">
                  <div className="relative">
                    <Image src={listing.images[0]} alt={listing.title} width={400} height={250} className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-300" />
                    <div className="absolute top-3 left-3 bg-blue-600 text-white px-2 py-1 rounded-lg text-sm font-medium">
                      {listing.type}
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-400 transition-colors">{listing.title}</h3>
                    <div className="flex items-center text-gray-400 mb-3">
                      <FaMapMarkerAlt className="text-blue-400 mr-1" />
                      <span className="text-sm">{listing.location}</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-400 mb-4">{listing.price}</p>
                    <div className="flex justify-between text-sm text-gray-300 bg-gray-700 rounded-lg p-3 mb-4">
                      <div className="flex items-center gap-1">
                        <FaBed className="text-blue-400" />
                        <span>3</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FaBath className="text-blue-400" />
                        <span>2</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FaRulerCombined className="text-blue-400" />
                        <span>200m²</span>
                      </div>
                    </div>
                    <Link href={`/listings/${listing.id}`} className="inline-block w-full text-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl transition-colors font-medium">View Details</Link>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link href="/listings" className="inline-flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-8 py-3 rounded-xl font-medium transition-colors group">
                View All Properties
                <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </>
        )}
      </section>

      {/* Categories */}
      <section className="py-20 bg-gray-800 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              Browse by <span className="text-blue-400">Category</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Explore our diverse selection of properties categorized for your convenience
            </p>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {["Home", "Villa", "Apartment", "Commercial"].map((cat) => (
              <button key={cat} 
                className={`bg-gray-900 rounded-2xl p-6 text-center text-xl font-semibold transition-all duration-300 hover:bg-gray-700 hover:shadow-lg hover:shadow-blue-500/50 hover:scale-105 ${category === cat ? "border-2 border-blue-400 shadow-lg" : ""} w-full h-full flex flex-col items-center justify-center gap-4`}
                onClick={() => {
                  setCategory(cat);
                  setLocation("");
                  setPropertyType("");
                  setPriceRange("");
                  handleSearch("", "", "", cat);
                }}
              >
                <div className={`text-4xl ${category === cat ? "text-blue-400" : "text-gray-500"} group-hover:text-blue-400 transition-colors`}>
                  <FaHome />
                </div>
                <span>{cat}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-900 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              Why Choose <span className="text-blue-400">Us</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Trusted by thousands of clients for our expertise and commitment to excellence
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="bg-gray-800 rounded-2xl p-8 hover:bg-gray-700 transition-all duration-300 hover:scale-105">
                  <stat.icon className={`mx-auto text-4xl mb-4 ${stat.color} group-hover:scale-110 transition-transform`} />
                  <h3 className="text-3xl font-bold mb-2">{stat.number}</h3>
                  <p className="text-gray-400">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gray-800 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              What Our <span className="text-blue-400">Clients Say</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Hear from our satisfied customers about their experience
            </p>
          </div>
          <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Sarah M.", text: "Finding my dream home was so easy. The search and agents were amazing!" },
              { name: "David R.", text: "I listed my apartment and it sold in just two weeks. Fantastic platform!" },
              { name: "Priya K.", text: "Professional, reliable, and lots of great listings. Highly recommended." },
            ].map((t, i) => (
              <div key={i} className="bg-gray-900 rounded-2xl p-8 shadow-md text-center hover:bg-gray-700 transition-all duration-300 hover:scale-105">
                <div className="text-3xl text-blue-400 mb-4">❝</div>
                <p className="text-gray-300 italic mb-6 text-lg">"{t.text}"</p>
                <h4 className="font-semibold text-white text-lg">- {t.name}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600/10 to-purple-600/10 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to List Your <span className="text-blue-400">Property?</span>
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of successful sellers who found their perfect buyers through our platform
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 group"
            >
              List Your Property
              <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/contact"
              className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}