// src/app/dashboard/listings/page.tsx
"use client";

import DashboardLayout from "@components/dashboard/DashboardLayout";
import ProtectedRoute from "@components/dashboard/ProtectedRoute";
import { useEffect, useState } from "react";
import { getListingsByUser, deleteListing, getAllListingsWithUsers } from "@services/userService";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useAuth } from "@contexts/AuthContext";
import { Listing } from "@/types/listing";
import Image from "next/image";
import { FaBed, FaBath, FaRulerCombined, FaMapMarkerAlt } from "react-icons/fa";

export default function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loadingListings, setLoadingListings] = useState(true);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchListings = async () => {
    if (!user) return;

    try {
      const uid = user.uid;
      const role = user.role;

      let data: Listing[] = [];
      if (role === "admin") {
        data = await getAllListingsWithUsers();
      } else {
        data = await getListingsByUser(uid);
      }

      setListings(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load listings.");
    } finally {
      setLoadingListings(false);
    }
  };

  useEffect(() => {
    if (mounted && !authLoading && user) {
      fetchListings();
    }
  }, [user, authLoading, mounted]);

  const handleDelete = async (listing: Listing) => {
    if (!listing.docId) return toast.error("Missing docId for this listing.");
    if (!confirm("Are you sure you want to delete this listing?")) return;

    try {
      await deleteListing(listing.docId);
      setListings((prev) => prev.filter((l) => l.docId !== listing.docId));
      toast.success("Listing deleted!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete listing.");
    }
  };

  if (!mounted || authLoading || loadingListings) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex flex-col items-center justify-center h-96 space-y-4">
            <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
            <p className="text-gray-300 text-lg">Loading listings...</p>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-white">
              {user?.role === "admin" ? "All Listings" : "My Listings"}
            </h2>
            <button
              onClick={() => router.push("/dashboard/listings/add")}
              className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-md transition hover:scale-105"
            >
              + Add Listing
            </button>
          </div>

          {listings.length === 0 ? (
            <div className="text-center mt-20">
              <p className="text-gray-300 text-lg">No listings found.</p>
              <button
                onClick={() => router.push("/dashboard/listings/add")}
                className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-md transition hover:scale-105"
              >
                + Add Listing
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <div
                  key={listing.id}
                  className="bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:scale-105 hover:shadow-xl transition-all duration-300 flex flex-col group"
                >
                  {/* Image */}
                  <div className="relative w-full h-56 overflow-hidden">
                    <Image
                      src={
                        listing.images?.[0] ||
                        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"
                      }
                      alt={listing.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 bg-blue-600 text-white px-2 py-1 rounded-lg text-sm font-medium">
                      {listing.type}
                    </div>
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
                      ${listing.price}
                    </div>

                    {/* Features */}
                    <div className="flex justify-between text-sm text-gray-300 bg-gray-700 rounded-lg p-3 mb-4">
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

                    {/* Admin info */}
                    {user?.role === "admin" && (
                      <p className="mt-1 text-sm text-blue-400">
                        Listed by: {listing.userName} ({listing.userEmail})
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex space-x-2 mt-4">
                      <button
                        className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-lg shadow-md transition hover:scale-105"
                        onClick={() => router.push(`/dashboard/listings/${listing.id}`)}
                      >
                        Edit
                      </button>
                      <button
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg shadow-md transition hover:scale-105"
                        onClick={() => handleDelete(listing)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
