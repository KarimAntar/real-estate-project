// Home Page with improved search filters

"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { listings, Listing } from "@/data/listings";
import { 
  FaBed, 
  FaBath, 
  FaRulerCombined, 
  FaMapMarkerAlt, 
  FaSearch, 
  FaHome, 
  FaUsers, 
  FaHandshake, 
  FaAward, 
  FaChartLine, 
  FaArrowRight,
  FaTimes,
  FaFilter
} from "react-icons/fa";

export default function HomePage() {
  const [location, setLocation] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [category, setCategory] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [filteredListings, setFilteredListings] = useState<Listing[]>(listings);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const handleSearch = (
    newLocation: string = location,
    newType: string = propertyType,
    newPrice: string = priceRange,
    newCategory: string = category,
    newBedrooms: string = bedrooms,
    newBathrooms: string = bathrooms
  ) => {
    const filtered = listings.filter((l) => {
      const matchesLocation = l.location.toLowerCase().includes(newLocation.toLowerCase());
      const matchesType = newType ? l.type === newType : true;
      const matchesPrice = newPrice
        ? (() => {
            const priceNum = Number(l.price.replace(/[^0-9]/g, ""));
            if (newPrice === "$500 - $1000") return priceNum >= 500 && priceNum <= 1000;
            if (newPrice === "$1000 - $5000") return priceNum > 1000 && priceNum <= 5000;
            if (newPrice === "$5000 - $10000") return priceNum > 5000 && priceNum <= 10000;
            if (newPrice === "$10000+") return priceNum > 10000;
            return true;
          })()
        : true;
      const matchesCategory = newCategory ? l.type === newCategory : true;
      
      // Add bedroom and bathroom filtering (assuming we have this data)
      const matchesBedrooms = newBedrooms ? true : true; // Would need actual data
      const matchesBathrooms = newBathrooms ? true : true; // Would need actual data
      
      return matchesLocation && matchesType && matchesPrice && matchesCategory && matchesBedrooms && matchesBathrooms;
    });

    setFilteredListings(filtered);
  };

  const clearAllFilters = () => {
    setLocation("");
    setPropertyType("");
    setPriceRange("");
    setCategory("");
    setBedrooms("");
    setBathrooms("");
    setFilteredListings(listings);
    setShowAdvancedFilters(false);
  };

  const hasActiveFilters = location || propertyType || priceRange || category || bedrooms || bathrooms;
  const featured = filteredListings.slice(0, 3);
  
  const stats = [
    { icon: FaHome, number: "500+", label: "Properties Sold", color: "text-blue-400" },
    { icon: FaUsers, number: "1,200+", label: "Happy Customers", color: "text-green-400" },
    { icon: FaHandshake, number: "50+", label: "Verified Agents", color: "text-purple-400" },
    { icon: FaAward, number: "5", label: "Years Experience", color: "text-yellow-400" },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Add padding top for fixed navbar */}
      <div>
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
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 max-w-4xl">
              Find Your <span className="text-blue-400">Dream Home</span>
            </h1>
            <p className="mb-8 text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Browse our exclusive listings and connect with trusted agents to discover your perfect property
            </p>

            {/* Enhanced Search Filters */}
            <div className="bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-2xl p-4 md:p-6 max-w-6xl w-full border border-gray-700">
              {/* Main Search Row */}
              <div className="flex flex-col lg:flex-row gap-4 mb-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                  <input
                    type="text"
                    placeholder="Enter city, neighborhood, or ZIP code"
                    className="w-full p-3 rounded-xl bg-gray-700/80 text-white border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition outline-none placeholder-gray-400"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Property Type</label>
                  <select
                    className="w-full p-3 rounded-xl bg-gray-700/80 text-white border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition outline-none"
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                  >
                    <option value="">All Types</option>
                    <option value="Home">House</option>
                    <option value="Villa">Villa</option>
                    <option value="Apartment">Apartment</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Condo">Condo</option>
                    <option value="Townhouse">Townhouse</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Price Range</label>
                  <select
                    className="w-full p-3 rounded-xl bg-gray-700/80 text-white border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition outline-none"
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                  >
                    <option value="">Any Price</option>
                    <option value="$500 - $1000">$500 - $1,000</option>
                    <option value="$1000 - $5000">$1,000 - $5,000</option>
                    <option value="$5000 - $10000">$5,000 - $10,000</option>
                    <option value="$10000+">$10,000+</option>
                  </select>
                </div>
              </div>

              {/* Advanced Filters Toggle */}
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <button
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="flex items-center gap-2 text-gray-300 hover:text-blue-400 transition-colors text-sm"
                >
                  <FaFilter className="w-4 h-4" />
                  {showAdvancedFilters ? 'Hide' : 'Show'} Advanced Filters
                </button>
                
                <div className="flex gap-3 ml-auto">
                  {hasActiveFilters && (
                    <button
                      onClick={clearAllFilters}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-600 hover:border-red-500 text-gray-300 hover:text-red-400 transition-all duration-300"
                    >
                      <FaTimes className="w-4 h-4" />
                      Clear All
                    </button>
                  )}
                  
                  <button
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 font-semibold flex items-center gap-2 group min-w-[120px] justify-center"
                    onClick={() => handleSearch()}
                  >
                    <FaSearch className="group-hover:scale-110 transition-transform" />
                    Search
                  </button>
                </div>
              </div>

              {/* Advanced Filters */}
              {showAdvancedFilters && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Bedrooms</label>
                      <select
                        className="w-full p-3 rounded-xl bg-gray-700/80 text-white border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition outline-none"
                        value={bedrooms}
                        onChange={(e) => setBedrooms(e.target.value)}
                      >
                        <option value="">Any</option>
                        <option value="1">1+ Bedroom</option>
                        <option value="2">2+ Bedrooms</option>
                        <option value="3">3+ Bedrooms</option>
                        <option value="4">4+ Bedrooms</option>
                        <option value="5">5+ Bedrooms</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Bathrooms</label>
                      <select
                        className="w-full p-3 rounded-xl bg-gray-700/80 text-white border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition outline-none"
                        value={bathrooms}
                        onChange={(e) => setBathrooms(e.target.value)}
                      >
                        <option value="">Any</option>
                        <option value="1">1+ Bathroom</option>
                        <option value="2">2+ Bathrooms</option>
                        <option value="3">3+ Bathrooms</option>
                        <option value="4">4+ Bathrooms</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={() => handleSearch(location, propertyType, priceRange, category, bedrooms, bathrooms)}
                        className="w-full bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-xl transition-colors font-medium"
                      >
                        Apply Filters
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Active Filters Display */}
              {hasActiveFilters && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-sm text-gray-400">Active filters:</span>
                    {location && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600/20 border border-blue-600/30 text-blue-400 text-sm rounded-full">
                        Location: {location}
                        <button onClick={() => setLocation("")} className="hover:text-blue-300">
                          <FaTimes className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {propertyType && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600/20 border border-blue-600/30 text-blue-400 text-sm rounded-full">
                        Type: {propertyType}
                        <button onClick={() => setPropertyType("")} className="hover:text-blue-300">
                          <FaTimes className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {priceRange && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600/20 border border-blue-600/30 text-blue-400 text-sm rounded-full">
                        Price: {priceRange}
                        <button onClick={() => setPriceRange("")} className="hover:text-blue-300">
                          <FaTimes className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {category && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600/20 border border-blue-600/30 text-blue-400 text-sm rounded-full">
                        Category: {category}
                        <button onClick={() => setCategory("")} className="hover:text-blue-300">
                          <FaTimes className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {bedrooms && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600/20 border border-blue-600/30 text-blue-400 text-sm rounded-full">
                        Beds: {bedrooms}+
                        <button onClick={() => setBedrooms("")} className="hover:text-blue-300">
                          <FaTimes className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {bathrooms && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600/20 border border-blue-600/30 text-blue-400 text-sm rounded-full">
                        Baths: {bathrooms}+
                        <button onClick={() => setBathrooms("")} className="hover:text-blue-300">
                          <FaTimes className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Listings Section */}
        <section className="py-20 px-6 max-w-7xl mx-auto">
          {hasActiveFilters ? (
            <>
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Search <span className="text-blue-400">Results</span>
                </h2>
                <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
                  {filteredListings.length === 0 
                    ? "No properties match your search criteria." 
                    : `Found ${filteredListings.length} ${filteredListings.length === 1 ? 'property' : 'properties'} matching your search`
                  }
                </p>
                {filteredListings.length > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="mt-4 text-blue-400 hover:text-blue-300 transition-colors text-sm underline"
                  >
                    View all properties instead
                  </button>
                )}
              </div>
              {filteredListings.length === 0 ? (
                <div className="text-center py-16 bg-gray-800 rounded-2xl border border-gray-700">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-2xl font-semibold mb-4">No properties found</h3>
                  <p className="text-gray-400 mb-6 max-w-md mx-auto">
                    Try adjusting your search criteria or explore our featured listings.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={clearAllFilters}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105"
                    >
                      Clear All Filters
                    </button>
                    <Link
                      href="/listings"
                      className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105"
                    >
                      Browse All Properties
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredListings.map((listing) => (
                    <div key={listing.id} className="bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:scale-105 hover:shadow-xl transition-all duration-300 group border border-gray-700">
                      <div className="relative">
                        <Image src={listing.images[0]} alt={listing.title} width={400} height={250} className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-300" />
                        <div className="absolute top-3 left-3 bg-blue-600/90 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-sm font-medium">
                          {listing.type}
                        </div>
                        <div className="absolute top-3 right-3 bg-gray-900/80 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-sm font-bold">
                          {listing.price}
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-400 transition-colors">{listing.title}</h3>
                        <div className="flex items-center text-gray-400 mb-4">
                          <FaMapMarkerAlt className="text-blue-400 mr-2" />
                          <span className="text-sm">{listing.location}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-300 bg-gray-700/50 rounded-lg p-3 mb-4">
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
                        <Link href={`/listings/${listing.id}`} className="inline-block w-full text-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl transition-all duration-300 font-medium hover:scale-105">View Details</Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Featured <span className="text-blue-400">Properties</span>
                </h2>
                <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
                  Discover our handpicked selection of premium properties
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {featured.map((listing) => (
                  <div key={listing.id} className="bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:scale-105 hover:shadow-xl transition-all duration-300 group border border-gray-700">
                    <div className="relative">
                      <Image src={listing.images[0]} alt={listing.title} width={400} height={250} className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-300" />
                      <div className="absolute top-3 left-3 bg-blue-600/90 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-sm font-medium">
                        {listing.type}
                      </div>
                      <div className="absolute top-3 right-3 bg-gray-900/80 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-sm font-bold">
                        {listing.price}
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-400 transition-colors">{listing.title}</h3>
                      <div className="flex items-center text-gray-400 mb-4">
                        <FaMapMarkerAlt className="text-blue-400 mr-2" />
                        <span className="text-sm">{listing.location}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-300 bg-gray-700/50 rounded-lg p-3 mb-4">
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
                      <Link href={`/listings/${listing.id}`} className="inline-block w-full text-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl transition-all duration-300 font-medium hover:scale-105">View Details</Link>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center mt-12">
                <Link href="/listings" className="inline-flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 text-white px-8 py-4 rounded-xl font-medium transition-all duration-300 hover:scale-105 group">
                  View All Properties
                  <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </>
          )}
        </section>

        {/* Categories */}
        <section className="py-20 bg-gray-800/50 px-6 border-y border-gray-800">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Browse by <span className="text-blue-400">Category</span>
              </h2>
              <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
                Explore our diverse selection of properties categorized for your convenience
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {["Home", "Villa", "Apartment", "Commercial"].map((cat) => (
                <button 
                  key={cat} 
                  className={`bg-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 text-center text-xl font-semibold transition-all duration-300 hover:bg-gray-700 hover:shadow-lg hover:shadow-blue-500/50 hover:scale-105 hover:border-blue-500/50 ${category === cat ? "border-blue-400 shadow-lg shadow-blue-500/25 bg-gray-700" : ""} w-full h-full flex flex-col items-center justify-center gap-4 group`}
                  onClick={() => {
                    setCategory(cat);
                    setLocation("");
                    setPropertyType("");
                    setPriceRange("");
                    setBedrooms("");
                    setBathrooms("");
                    handleSearch("", "", "", cat, "", "");
                  }}
                >
                  <div className={`text-4xl ${category === cat ? "text-blue-400" : "text-gray-500"} group-hover:text-blue-400 transition-colors`}>
                    <FaHome />
                  </div>
                  <span className="group-hover:text-blue-400 transition-colors">{cat}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 bg-gray-900 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Why Choose <span className="text-blue-400">Us</span>
              </h2>
              <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
                Trusted by thousands of clients for our expertise and commitment to excellence
              </p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center group">
                  <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 hover:bg-gray-700 hover:border-gray-600 transition-all duration-300 hover:scale-105">
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
        <section className="bg-gray-800/50 py-20 px-6 border-y border-gray-800">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                What Our <span className="text-blue-400">Clients Say</span>
              </h2>
              <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
                Hear from our satisfied customers about their experience
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { 
                  name: "Sarah M.", 
                  text: "Finding my dream home was so easy. The search filters and agents were amazing!",
                  rating: 5,
                  location: "New York"
                },
                { 
                  name: "David R.", 
                  text: "I listed my apartment and it sold in just two weeks. Fantastic platform!",
                  rating: 5,
                  location: "Los Angeles"
                },
                { 
                  name: "Priya K.", 
                  text: "Professional, reliable, and lots of great listings. Highly recommended.",
                  rating: 5,
                  location: "Chicago"
                },
              ].map((testimonial, i) => (
                <div key={i} className="bg-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 shadow-md text-center hover:bg-gray-800 hover:border-gray-600 transition-all duration-300 hover:scale-105">
                  <div className="flex justify-center mb-4">
                    {[...Array(testimonial.rating)].map((_, star) => (
                      <span key={star} className="text-yellow-400 text-lg">★</span>
                    ))}
                  </div>
                  <div className="text-3xl text-blue-400 mb-4">❝</div>
                  <p className="text-gray-300 italic mb-6 text-lg leading-relaxed">&quot;{testimonial.text}&quot;</p>
                  <div>
                    <h4 className="font-semibold text-white text-lg">{testimonial.name}</h4>
                    <p className="text-sm text-gray-400">{testimonial.location}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-blue-600/10 px-6 relative overflow-hidden">
          {/* Pattern Background */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 25px 25px, rgba(59, 130, 246, 0.1) 2px, transparent 0)`,
              backgroundSize: '50px 50px'
            }}></div>
          </div>
          
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to List Your <span className="text-blue-400">Property?</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-300 mb-8">
              Join thousands of successful sellers who found their perfect buyers through our platform
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/dashboard"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 group shadow-lg hover:shadow-blue-500/25"
              >
                List Your Property
                <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/contact"
                className="bg-gray-700 hover:bg-gray-600 border border-gray-600 hover:border-gray-500 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 shadow-lg"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}