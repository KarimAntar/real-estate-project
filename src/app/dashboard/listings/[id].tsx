// src/app/dashboard/listings/[id].tsx
"use client";

import DashboardLayout from "../../components/dashboard/DashboardLayout";
import ProtectedRoute from "../../components/dashboard/ProtectedRoute";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  addListing,
  updateListing,
  getListingsByUser,
  getAllListingsWithUsers,
  uploadImages,
  transformFormToListing,
} from "../../services/userService";
import { toast } from "react-toastify";
import { Listing, ListingFormData } from "@/types/listing";
import { useAuth } from "@contexts/AuthContext";
import { useParams } from "next/navigation";

export default function AddEditListingPage() {
  const router = useRouter();
  const params = useParams();
  const listingId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const { user, loading: authLoading } = useAuth();
  const [mounted, setMounted] = useState(false);

  // Form state
  const [form, setForm] = useState<ListingFormData>({
    title: "",
    description: "",
    city: "",
    price: "", // string for input
    type: "Home",
    bedrooms: 1,
    bathrooms: 1,
    area: 50,
    existingImages: [],
    newImages: [],
  });

  const [loading, setLoading] = useState(false);

  // SSR safe
  useEffect(() => {
    setMounted(true);
  }, []);

// Fetch listing if editing
useEffect(() => {
  if (!listingId || !user || authLoading) return; // wait for user

  (async () => {
    try {
      let listings: Listing[] = [];

      if (user.role === "admin") {
        // 🔹 Admin can fetch all listings
        listings = await getAllListingsWithUsers();
      } else {
        // 🔹 Regular user: only their own listings
        listings = await getListingsByUser(user.uid);
      }

      const listing = listings.find((l) => l.id === listingId);
      if (!listing) {
        toast.error("Listing not found.");
        return;
      }

      setForm({
        title: listing.title || "",
        description: listing.description || "",
        city: listing.city || "",
        price: listing.price?.toString() || "",
        type: listing.type || "Home",
        bedrooms: listing.bedrooms || 1,
        bathrooms: listing.bathrooms || 1,
        area: listing.area || 50,
        existingImages: listing.images || [],
        newImages: [],
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to load listing data.");
    }
  })();
}, [listingId, user, authLoading]);




  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (["bedrooms", "bathrooms", "area"].includes(name)) {
      setForm((prev) => ({
        ...prev,
        [name]: Number(value),
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setForm((prev) => ({
      ...prev,
      newImages: Array.from(files),
    }));
  };

    // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Upload new images first
      let uploadedImageUrls: string[] = [];
      if (form.newImages.length > 0) {
        // Note: Ensure you are using the correct upload function name
        const uploadRes = await uploadImages(form.newImages);
        uploadedImageUrls = uploadRes.urls || [];
      }

      // Combine existing + new images
      const allImages = [...form.existingImages, ...uploadedImageUrls];

      if (listingId) {
        // FIX: Use the helper function to create the listing object
        const listingData = transformFormToListing(form, listingId, allImages);
        await updateListing(listingId, listingData);
        toast.success("Listing updated successfully!");
      } else {
        // Add new listing (this part was already correct)
        const newListing = transformFormToListing(form, "", allImages);
        await addListing(newListing);
        toast.success("Listing added successfully!");
      }

      router.push("/dashboard/listings");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to save listing.");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || authLoading) return null;

  return (
    <DashboardLayout>
      <ProtectedRoute>
        <div className="max-w-2xl mx-auto bg-gray-800 p-6 rounded-md shadow-md mt-4">
          <h2 className="text-2xl font-bold mb-4">
            {listingId ? "Edit Listing" : "Add Listing"}
          </h2>
          <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
            <input
              type="text"
              name="title"
              placeholder="Title"
              value={form.title}
              onChange={handleChange}
              className="p-2 rounded bg-gray-700 text-white"
              required
            />
            <textarea
              name="description"
              placeholder="Description"
              value={form.description}
              onChange={handleChange}
              className="p-2 rounded bg-gray-700 text-white"
              rows={4}
              required
            />
            <input
              type="text"
              name="city"
              placeholder="City"
              value={form.city}
              onChange={handleChange}
              className="p-2 rounded bg-gray-700 text-white"
              required
            />
            <input
              type="number"
              name="price"
              placeholder="Price"
              value={form.price}
              onChange={handleChange}
              className="p-2 rounded bg-gray-700 text-white"
              required
            />
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="p-2 rounded bg-gray-700 text-white"
            >
              <option value="Home">Home</option>
              <option value="Villa">Villa</option>
              <option value="Apartment">Apartment</option>
              <option value="Commercial">Commercial</option>
            </select>
            <div className="flex space-x-2">
              <input
                type="number"
                name="bedrooms"
                placeholder="Bedrooms"
                value={form.bedrooms}
                onChange={handleChange}
                className="p-2 rounded bg-gray-700 text-white flex-1"
              />
              <input
                type="number"
                name="bathrooms"
                placeholder="Bathrooms"
                value={form.bathrooms}
                onChange={handleChange}
                className="p-2 rounded bg-gray-700 text-white flex-1"
              />
              <input
                type="number"
                name="area"
                placeholder="Area (m²)"
                value={form.area}
                onChange={handleChange}
                className="p-2 rounded bg-gray-700 text-white flex-1"
              />
            </div>
            <input
              type="file"
              multiple
              onChange={handleImageChange}
              className="text-white"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              {listingId ? "Update Listing" : "Add Listing"}
            </button>
          </form>
        </div>
      </ProtectedRoute>
    </DashboardLayout>
  );
}
