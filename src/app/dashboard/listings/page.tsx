// src/app/dashboard/listings/page.tsx - Updated with status display
"use client";

import DashboardLayout from "@components/dashboard/DashboardLayout";
import ProtectedRoute from "@components/dashboard/ProtectedRoute";
import ListingStatusBadge from "@/app/components/ListingStatusBadge";
import { useEffect, useState } from "react";
import { getListingsByUser, deleteListing, getAllListingsWithUsers } from "@services/userService";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useAuth } from "@contexts/AuthContext";
import { ListingWithStatus } from "@/types/notification";
import Image from "next/image";
import { FaBed, FaBath, FaRulerCombined, FaMapMarkerAlt, FaEye, FaClock, FaCheck, FaTimes } from "react-icons/fa";

export default function ListingsPage() {
  const [listings, setListings] = useState<ListingWithStatus[]>([]);
  const [loadingListings, setLoadingListings] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "declined">("all");
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
      // ALWAYS fetch listings for the currently logged-in user on this page.
      const data = await getListingsByUser(uid);
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

  const handleDelete = async (listing: ListingWithStatus) => {
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

  // Filter listings based on status
  const filteredListings = statusFilter === "all" 
    ? listings 
    : listings.filter(listing => listing.status === statusFilter);

  // Get status counts
  const statusCounts = {
    all: listings.length,
    pending: listings.filter(l => l.status === "pending").length,
    approved: listings.filter(l => l.status === "approved").length,
    declined: listings.filter(l => l.status === "declined").length,
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
            <div>
              <h2 className="text-3xl font-bold text-white">
                {user?.role === "admin" ? "All Listings" : "My Listings"}
              </h2>
              <p className="text-gray-400 mt-1">
                {user?.role === "admin" 
                  ? "Manage all platform listings" 
                  : "Manage your property listings"
                }
              </p>
            </div>
            <button
              onClick={() => router.push("/dashboard/listings/add")}
              className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-md transition hover:scale-105"
            >
              + Add Listing
            </button>
          </div>

          {/* Status Filter Tabs */}
          <div className="mb-6">
            <div className="border-b border-gray-700">
              <nav className="-mb-px flex space-x-8">
                {[
                  { key: "all", label: "All", icon: FaEye, count: statusCounts.all },
                  { key: "pending", label: "Pending", icon: FaClock, count: statusCounts.pending },
                  { key: "approved", label: "Approved", icon: FaCheck, count: statusCounts.approved },
                  { key: "declined", label: "Declined", icon: FaTimes, count: statusCounts.declined },
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setStatusFilter(tab.key as any)}
                      className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                        statusFilter === tab.key
                          ? "border-blue-500 text-blue-400"
                          : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                      {tab.count > 0 && (
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          statusFilter === tab.key
                            ? "bg-blue-500 text-white"
                            : "bg-gray-700 text-gray-300"
                        }`}>
                          {tab.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {filteredListings.length === 0 ? (
            <div className="text-center mt-20">
              <div className="text-gray-400 text-lg mb-4">
                {statusFilter === "all" 
                  ? "No listings found." 
                  : `No ${statusFilter} listings found.`
                }
              </div>
              <button
                onClick={() => router.push("/dashboard/listings/add")}
                className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-md transition hover:scale-105"
              >
                + Add Listing
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
{filteredListings.map((listing) => (
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
      {/* Status Badge */}
      <div className="absolute top-3 right-3">
        <ListingStatusBadge 
          status={listing.status || "pending"} 
          className="text-xs"
        />
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

      <p className="text-gray-300 text-sm mb-4 line-clamp-3">
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

      {/* Status Notes & Admin Info Container with minimum height */}
      <div className="flex-grow min-h-[90px]">
        {/* Status Notes */}
        {listing.status === "pending" && (
          <div className="mb-4 p-3 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
            <p className="text-sm text-yellow-300">
              Your listing is being reviewed by our team. This usually takes 24-48 hours.
            </p>
          </div>
        )}
        {listing.status === "approved" && (
          <div className="mb-4 p-3 bg-green-900/20 border border-green-700/50 rounded-lg">
            <p className="text-sm text-green-300">
              🎉 Your listing is live and visible on the platform!
            </p>
          </div>
        )}
        {listing.status === "declined" && listing.adminNote && (
          <div className="mb-4 p-3 bg-red-900/20 border border-red-700/50 rounded-lg">
            <p className="text-sm text-red-300">
              <strong>Admin Feedback:</strong> {listing.adminNote}
            </p>
          </div>
        )}

        {/* Admin info (only shown to admins) */}
        {user?.role === "admin" && (
          <p className="mt-1 text-sm text-blue-400">
            Listed by: {listing.userName} ({listing.userEmail})
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex space-x-2 mt-auto">
        <button
          className="flex-1 text-center bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg shadow-md transition hover:scale-105 text-sm"
          onClick={() => router.push(`/dashboard/listings/${listing.id}`)}
        >
          Edit
        </button>
        <button
          className="flex-1 text-center bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg shadow-md transition hover:scale-105 text-sm"
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