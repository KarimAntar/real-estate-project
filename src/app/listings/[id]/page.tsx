// src/app/listings/[id].tsx

"use client";

import { useParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/app/firebase/firebaseConfig";
import { Listing } from "@/types/listing";
import Slider from "react-slick";
import Image from "next/image";
import Link from "next/link";
import { 
  FaBed, 
  FaBath, 
  FaRulerCombined, 
  FaMapMarkerAlt, 
  FaArrowLeft, 
  FaHome,
  FaCalendarAlt,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaHeart,
  FaShare
} from "react-icons/fa";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export default function PropertyDetails() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ownerInfo, setOwnerInfo] = useState<any>(null);
  
  const mainSlider = useRef<Slider>(null);
  const thumbSlider = useRef<Slider>(null);
  const [nav1, setNav1] = useState<Slider | undefined>(undefined);
  const [nav2, setNav2] = useState<Slider | undefined>(undefined);

  // Initialize slider refs after mount
  useEffect(() => {
    if (mainSlider.current) setNav1(mainSlider.current);
    if (thumbSlider.current) setNav2(thumbSlider.current);
  }, [listing]);

  // Fetch listing data from Firebase
  const fetchListing = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      console.log("🔍 Fetching listing with ID:", id);
      
      // First try to find by the internal id field
      const listingsRef = collection(db, "listings");
      const q = query(listingsRef, where("id", "==", id));
      const querySnapshot = await getDocs(q);
      
      let foundListing: Listing | null = null;
      
      if (!querySnapshot.empty) {
        // Found by internal id
        const doc = querySnapshot.docs[0];
        const data = doc.data();
        foundListing = {
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
          images: Array.isArray(data.images) ? data.images : [],
          userId: data.userId || data.ownerId || "unknown",
          ownerId: data.ownerId || data.userId || "",
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        };
        console.log("✅ Found listing by internal ID");
      } else {
        // Try to find by document ID as fallback
        try {
          const docRef = doc(db, "listings", id);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            foundListing = {
              id: data.id || docSnap.id,
              docId: docSnap.id,
              title: data.title || "",
              description: data.description || "",
              price: data.price || 0,
              city: data.city || "",
              type: data.type || "Home",
              bedrooms: data.bedrooms || 0,
              bathrooms: data.bathrooms || 0,
              area: data.area || 0,
              images: Array.isArray(data.images) ? data.images : [],
              userId: data.userId || data.ownerId || "unknown",
              ownerId: data.ownerId || data.userId || "",
              createdAt: data.createdAt,
              updatedAt: data.updatedAt,
            };
            console.log("✅ Found listing by document ID");
          }
        } catch (docError) {
          console.warn("⚠️ Document ID lookup failed:", docError);
        }
      }
      
      if (!foundListing) {
        setError("Property not found");
        return;
      }
      
      setListing(foundListing);
      console.log("🏠 Loaded listing:", foundListing);
      
      // Fetch owner information if available
      if (foundListing.ownerId && foundListing.ownerId !== "unknown") {
        try {
          const userDoc = await getDoc(doc(db, "users", foundListing.ownerId));
          if (userDoc.exists()) {
            setOwnerInfo(userDoc.data());
            console.log("👤 Loaded owner info:", userDoc.data());
          }
        } catch (ownerError) {
          console.warn("⚠️ Could not fetch owner info:", ownerError);
        }
      }
      
    } catch (err) {
      console.error("❌ Error fetching listing:", err);
      setError(`Failed to load property details: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListing();
  }, [id]);

  // Format price for display
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Format date - handle optional dates
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Date not available";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "Date not available";
    }
  };

  // Get placeholder image
  const getPlaceholderImage = () => {
    return "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&h=800&q=80";
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-xl text-gray-300">Loading property details...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !listing) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">🏠</div>
            <h2 className="text-3xl font-bold mb-4">Property Not Found</h2>
            <p className="text-gray-300 mb-8">
              {error || "The property you're looking for doesn't exist or has been removed."}
            </p>
            <Link
              href="/listings"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center gap-2"
            >
              <FaArrowLeft />
              Back to Listings
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Prepare images for slider
  const images = listing.images && listing.images.length > 0 
    ? listing.images 
    : [getPlaceholderImage()];

  const mainSettings = {
    asNavFor: nav2,
    ref: mainSlider,
    dots: false,
    arrows: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    swipeToSlide: true,
    adaptiveHeight: true,
  };

  const thumbSettings = {
    asNavFor: nav1,
    ref: thumbSlider,
    dots: false,
    arrows: false,
    infinite: true,
    slidesToShow: Math.min(images.length, 5),
    swipeToSlide: true,
    focusOnSelect: true,
    centerMode: images.length > 5,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: Math.min(images.length, 3),
        }
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/listings"
              className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
            >
              <FaArrowLeft />
              Back to Listings
            </Link>
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors">
                <FaHeart className="text-red-400" />
                Save
              </button>
              <button className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors">
                <FaShare className="text-blue-400" />
                Share
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Left Column */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="mb-8">
              {images.length > 1 ? (
                <>
                  {/* Main Slider */}
                  <div className="mb-4">
                    <Slider
                      {...mainSettings}
                      className="cursor-grab active:cursor-grabbing select-none"
                    >
                      {images.map((img, idx) => (
                        <div key={idx} className="relative w-full h-[500px] select-none">
                          <Image
                            src={img}
                            alt={`${listing.title} - Image ${idx + 1}`}
                            fill
                            className="object-cover rounded-xl select-none"
                            priority={idx === 0}
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 50vw"
                          />
                          <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-lg text-sm">
                            {idx + 1} / {images.length}
                          </div>
                        </div>
                      ))}
                    </Slider>
                  </div>

                  {/* Thumbnail Slider */}
                  <Slider {...thumbSettings} className="mb-6">
                    {images.map((img, idx) => (
                      <div key={idx} className="px-2 select-none">
                        <div className="relative w-full h-24 cursor-pointer">
                          <Image
                            src={img}
                            alt={`Thumbnail ${idx + 1}`}
                            fill
                            className="object-cover rounded-lg select-none hover:opacity-75 transition-opacity"
                            sizes="(max-width: 768px) 33vw, 20vw"
                          />
                        </div>
                      </div>
                    ))}
                  </Slider>
                </>
              ) : (
                /* Single Image */
                <div className="relative w-full h-[500px] mb-6">
                  <Image
                    src={images[0]}
                    alt={listing.title}
                    fill
                    className="object-cover rounded-xl"
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 50vw"
                  />
                </div>
              )}
            </div>

            {/* Property Details */}
            <div className="bg-gray-800 rounded-xl p-6 mb-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm font-medium">
                  {listing.type}
                </div>
                <div className="flex items-center text-gray-400">
                  <FaMapMarkerAlt className="mr-1" />
                  <span>{listing.city}</span>
                </div>
              </div>

              <h1 className="text-3xl font-bold mb-4">{listing.title}</h1>
              
              <div className="text-3xl font-bold text-blue-400 mb-6">
                {formatPrice(listing.price)}
                <span className="text-lg text-gray-400 font-normal ml-2">/ month</span>
              </div>

              {/* Property Stats */}
              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-700 rounded-xl p-4 text-center hover:bg-gray-600 transition-colors">
                  <FaBed className="mx-auto text-blue-400 text-2xl mb-2" />
                  <p className="text-2xl font-bold">{listing.bedrooms}</p>
                  <p className="text-gray-400 text-sm">Bedrooms</p>
                </div>
                <div className="bg-gray-700 rounded-xl p-4 text-center hover:bg-gray-600 transition-colors">
                  <FaBath className="mx-auto text-blue-400 text-2xl mb-2" />
                  <p className="text-2xl font-bold">{listing.bathrooms}</p>
                  <p className="text-gray-400 text-sm">Bathrooms</p>
                </div>
                <div className="bg-gray-700 rounded-xl p-4 text-center hover:bg-gray-600 transition-colors">
                  <FaRulerCombined className="mx-auto text-blue-400 text-2xl mb-2" />
                  <p className="text-2xl font-bold">{listing.area}</p>
                  <p className="text-gray-400 text-sm">sq ft</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <FaHome className="text-blue-400" />
                Property Description
              </h2>
              <p className="text-gray-300 leading-relaxed text-lg">
                {listing.description}
              </p>
              
              {/* Additional Details */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {listing.createdAt && (
                  <div className="flex items-center gap-2 text-gray-400">
                    <FaCalendarAlt className="text-blue-400" />
                    <span>Listed on {formatDate(listing.createdAt)}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-400">
                  <FaHome className="text-blue-400" />
                  <span>Property ID: {listing.id}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Right Column */}
          <div className="lg:col-span-1">
            {/* Contact Card */}
            <div className="bg-gray-800 rounded-xl p-6 mb-6 sticky top-6">
              <h3 className="text-xl font-semibold mb-4">Contact Property Owner</h3>
              
              {ownerInfo ? (
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                      <FaUser className="text-white" />
                    </div>
                    <div>
                      <p className="font-semibold">{ownerInfo.fullName || "Property Owner"}</p>
                      <p className="text-gray-400 text-sm">Property Owner</p>
                    </div>
                  </div>
                  {ownerInfo.email && (
                    <div className="flex items-center gap-2 text-gray-300 mb-2">
                      <FaEnvelope className="text-blue-400" />
                      <span className="text-sm">{ownerInfo.email}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
                      <FaUser className="text-gray-400" />
                    </div>
                    <div>
                      <p className="font-semibold">Property Owner</p>
                      <p className="text-gray-400 text-sm">Contact for details</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                  <FaPhone />
                  Call Now
                </button>
                <button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                  <FaEnvelope />
                  Send Message
                </button>
                <button className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-lg font-medium transition-colors">
                  Schedule Viewing
                </button>
              </div>
            </div>

            {/* Property Summary */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-4">Property Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Property Type</span>
                  <span className="font-medium">{listing.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Location</span>
                  <span className="font-medium">{listing.city}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Bedrooms</span>
                  <span className="font-medium">{listing.bedrooms}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Bathrooms</span>
                  <span className="font-medium">{listing.bathrooms}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Area</span>
                  <span className="font-medium">{listing.area} sq ft</span>
                </div>
                <div className="flex justify-between border-t border-gray-700 pt-3">
                  <span className="text-gray-400">Monthly Rent</span>
                  <span className="font-bold text-blue-400">{formatPrice(listing.price)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}