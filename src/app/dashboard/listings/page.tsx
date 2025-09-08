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
    if (!user) return; // ✅ guard clause

    try {
      const uid = user.uid;   // ✅ narrowed here
      const role = user.role; // ✅ narrowed here

      let data: Listing[] = [];

      if (role === "admin") {
        data = await getAllListingsWithUsers();
      } else {
        data = await getListingsByUser(uid);
      }

      setListings(data);
    } catch (err) {
      console.error(err);
      if (!toast.isActive("load-error")) {
        toast.error("Failed to load listings.", { toastId: "load-error" });
      }
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
    await deleteListing(listing.docId);  // 🔹 Use docId, not id
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
            <div className="w-12 h-12 border-4 border-gray-300 border-t-green-500 rounded-full animate-spin" />
            <p className="text-gray-300 text-lg">Loading listings...</p>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="max-w-6xl mx-auto p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">
              {user?.role === "admin" ? "All Listings" : "My Listings"}
            </h2>
            <button
              onClick={() => router.push("/dashboard/listings/add")}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded shadow-md transition hover:scale-105"
            >
              + Add Listing
            </button>
          </div>

          {listings.length === 0 ? (
            <div className="text-center mt-10">
              <p className="text-gray-300 text-lg">No listings found.</p>
              <button
                onClick={() => router.push("/dashboard/listings/add")}
                className="mt-4 flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded shadow-md transition hover:scale-105"
              >
                + Add Listing
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {listings.map((listing) => (
                <div
                  key={listing.id}
                  className="bg-gray-800 p-4 rounded-md shadow-md flex flex-col justify-between hover:shadow-xl transition"
                >
                  <div>
                    <h3 className="font-bold text-lg">{listing.title}</h3>
                    <p className="text-gray-400">{listing.city}</p>
                    <p className="mt-2">{listing.description}</p>
                    <p className="mt-2 font-semibold">${listing.price}</p>
                    <p className="mt-1 text-sm text-gray-400">
                      {listing.bedrooms} beds • {listing.bathrooms} baths •{" "}
                      {listing.area} m² • {listing.type}
                    </p>

                    {/* 🔹 Show user info for admin */}
                    {user?.role === "admin" && (
                      <p className="mt-2 text-sm text-blue-400">
                        Listed by: {listing.userName} ({listing.userEmail})
                      </p>
                    )}
                  </div>

                  {listing.images.length > 0 && (
                    <div className="mt-2 flex space-x-2 overflow-x-auto">
                      {listing.images.map((img, i) => (
                        <img
                          key={i}
                          src={img}
                          alt={listing.title}
                          className="w-16 h-16 object-cover rounded"
                        />
                      ))}
                    </div>
                  )}

                  {user &&
                    (user.role === "admin" || listing.userId === user.uid) && (
                      <div className="flex space-x-2 mt-4">
                        <button
                          className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded shadow-md transition hover:scale-105"
                          onClick={() =>
                            router.push(`/dashboard/listings/add?id=${listing.id}`)
                          }
                        >
                          Edit
                        </button>
                        <button
                          className="flex-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded shadow-md transition hover:scale-105"
                          onClick={() => handleDelete(listing)}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                </div>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
