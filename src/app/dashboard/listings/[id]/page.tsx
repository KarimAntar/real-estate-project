// src/app/dashboard/listings/[id].tsx

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "../../../contexts/AuthContext";
import { toast } from "react-toastify";
import DashboardLayout from "../../../components/dashboard/DashboardLayout";
import ProtectedRoute from "../../../components/dashboard/ProtectedRoute";
import { getListingsByUser, getAllListingsWithUsers } from "../../../services/userService";
import AddEditListingForm from "../add/AddEditListingForm";

interface Listing {
  id: string;
  title: string;
  description: string;
  city: string;
  price: number;
  type: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  images: string[];
  userId: string;
}

export default function EditListingPage() {
  const params = useParams();
  const listingId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const { user } = useAuth();
  const router = useRouter();

  const [initialData, setInitialData] = useState<any | null>(null);

  useEffect(() => {
    if (!listingId || !user) return;

    const fetchListing = async () => {
      try {
        let listings: Listing[] = [];

        if (user.role === "admin") {
          listings = await getAllListingsWithUsers();
        } else {
          listings = await getListingsByUser(user.uid);
        }

        const listing = listings.find((l) => l.id === listingId);

        if (!listing) {
          toast.error("Listing not found or you don’t have access.");
          router.push("/dashboard/listings");
          return;
        }

        setInitialData({
          title: listing.title,
          description: listing.description,
          city: listing.city,
          price: listing.price.toString(),
          type: listing.type,
          bedrooms: listing.bedrooms,
          bathrooms: listing.bathrooms,
          area: listing.area,
          existingImages: listing.images || [],
          newImages: [],
        });
      } catch (error) {
        console.error("Error fetching listing:", error);
        toast.error("Failed to load listing.");
      }
    };

    fetchListing();
  }, [listingId, user, router]);

  if (!initialData) {
    return (
      <DashboardLayout>
        <ProtectedRoute>
          <p className="text-gray-600">Loading listing...</p>
        </ProtectedRoute>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <ProtectedRoute>
        <h1 className="text-2xl font-semibold mb-4">Edit Listing</h1>
        <AddEditListingForm initialData={initialData} listingId={listingId} />
      </ProtectedRoute>
    </DashboardLayout>
  );
}
