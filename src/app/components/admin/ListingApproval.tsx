// src/app/components/admin/ListingApproval.tsx
"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FaCheck, FaTimes, FaEye, FaSpinner, FaBed, FaBath, FaRulerCombined, FaMapMarkerAlt } from "react-icons/fa";
import { ListingWithStatus } from "@/types/notification";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";

export default function ListingApproval() {
  const [pendingListings, setPendingListings] = useState<ListingWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedListing, setSelectedListing] = useState<ListingWithStatus | null>(null);
  const [declineNote, setDeclineNote] = useState("");
  const [showDeclineModal, setShowDeclineModal] = useState(false);

  // Fetch pending listings
  const fetchPendingListings = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/admin/listings/pending", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch pending listings");
      }

      const data = await response.json();
      setPendingListings(data);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch pending listings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingListings();
  }, []);

  // Handle listing approval
  const handleApproval = async (listingId: string, status: "approved" | "declined", adminNote?: string) => {
    setProcessingId(listingId);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/admin/listings/approve", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          listingId,
          status,
          adminNote,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to process listing approval");
      }

      // Remove from pending listings
      setPendingListings(prev => prev.filter(listing => listing.docId !== listingId));
      
      toast.success(`Listing ${status} successfully!`);
      
      // Close modal if open
      if (showDeclineModal) {
        setShowDeclineModal(false);
        setDeclineNote("");
        setSelectedListing(null);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to process listing");
    } finally {
      setProcessingId(null);
    }
  };

  // Handle decline with note
  const handleDeclineWithNote = (listing: ListingWithStatus) => {
    setSelectedListing(listing);
    setShowDeclineModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-500 mb-4" />
          <p className="text-gray-400">Loading pending listings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Pending Listings</h2>
          <p className="text-gray-400">Review and approve or decline listings</p>
        </div>
        <div className="text-sm text-gray-400">
          {pendingListings.length} listing(s) pending review
        </div>
      </div>

      {pendingListings.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <FaCheck className="text-green-400 text-4xl mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">All Caught Up!</h3>
          <p className="text-gray-400">No listings pending review at the moment.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {pendingListings.map((listing) => (
            <div key={listing.docId} className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              <div className="md:flex">
                {/* Image */}
                <div className="md:w-1/3">
                  <div className="relative h-48 md:h-full">
                    <Image
                      src={
                        listing.images?.[0] ||
                        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"
                      }
                      alt={listing.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-3 left-3 bg-yellow-600 text-white px-2 py-1 rounded text-sm font-medium">
                      PENDING REVIEW
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="md:w-2/3 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-2">
                        {listing.title}
                      </h3>
                      <div className="flex items-center text-gray-400 mb-2">
                        <FaMapMarkerAlt className="text-blue-400 mr-1" />
                        <span>{listing.city}</span>
                      </div>
                      <div className="text-2xl font-bold text-blue-400 mb-3">
                        ${listing.price?.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-400">
                      <div>Submitted by:</div>
                      <div className="text-white font-medium">{listing.userName}</div>
                      <div>{listing.userEmail}</div>
                      <div className="mt-1">
                        {formatDistanceToNow(new Date(listing.createdAt || ""), { addSuffix: true })}
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-300 mb-4 line-clamp-3">
                    {listing.description}
                  </p>

                  {/* Property Details */}
                  <div className="flex justify-between text-sm text-gray-300 bg-gray-700 rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-1">
                      <FaBed className="text-blue-400" />
                      <span>{listing.bedrooms} beds</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FaBath className="text-blue-400" />
                      <span>{listing.bathrooms} baths</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FaRulerCombined className="text-blue-400" />
                      <span>{listing.area} sq ft</span>
                    </div>
                    <div className="bg-blue-600 text-white px-2 py-1 rounded text-xs">
                      {listing.type}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApproval(listing.docId!, "approved")}
                      disabled={processingId === listing.docId}
                      className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      {processingId === listing.docId ? (
                        <FaSpinner className="animate-spin" />
                      ) : (
                        <FaCheck />
                      )}
                      Approve
                    </button>
                    
                    <button
                      onClick={() => handleDeclineWithNote(listing)}
                      disabled={processingId === listing.docId}
                      className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <FaTimes />
                      Decline
                    </button>
                    
                    <button
                      onClick={() => window.open(`/listing/${listing.id}`, '_blank')}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                      <FaEye />
                      View
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Decline Modal */}
      {showDeclineModal && selectedListing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-white mb-4">
              Decline Listing: {selectedListing.title}
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Reason for declining (optional)
              </label>
              <textarea
                value={declineNote}
                onChange={(e) => setDeclineNote(e.target.value)}
                placeholder="Provide feedback to help the user improve their listing..."
                rows={4}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={500}
              />
              <div className="text-xs text-gray-500 mt-1">
                {declineNote.length}/500 characters
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeclineModal(false);
                  setDeclineNote("");
                  setSelectedListing(null);
                }}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleApproval(selectedListing.docId!, "declined", declineNote)}
                disabled={processingId === selectedListing.docId}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                {processingId === selectedListing.docId ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <FaTimes />
                )}
                Decline Listing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}