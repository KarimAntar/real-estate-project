// src/app/dashboard/listings/[id].tsx
"use client";

import DashboardLayout from "../../components/dashboard/DashboardLayout";
import ProtectedRoute from "../../components/dashboard/ProtectedRoute";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { addListing, updateListing, getUserListings } from "../../services/userService";
import { toast } from "react-toastify";
import { ListingFormData } from "@/types/listing";

export default function AddEditListingPage() {
  const router = useRouter();
  const params = useSearchParams();
  const listingId = params?.get("id"); // string | null

  // ✅ Form state matches ListingFormData
  const [form, setForm] = useState<ListingFormData>({
    title: "",
    description: "",
    city: "",
    price: "",  // string, matches ListingFormData
    type: "Home",
    bedrooms: 1,
    bathrooms: 1,
    area: 50,
    images: [],
  });

  // Fetch listing data if editing
  useEffect(() => {
    if (!listingId) return;

    (async () => {
      try {
        const listings = await getUserListings();
        const listing = listings.find((l: any) => l.id === listingId); // compare as string
        if (listing) {
          setForm({
            title: listing.title || "",
            description: listing.description || "",
            city: listing.city || "",
            price: listing.price?.toString() || "", // ensure string
            type: listing.type || "Home",
            bedrooms: listing.bedrooms || 1,
            bathrooms: listing.bathrooms || 1,
            area: listing.area || 50,
            images: listing.images || [],
          });
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load listing data.");
      }
    })();
  }, [listingId]);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = {
        ...form,
        // Convert numeric fields before sending to API
        bedrooms: Number(form.bedrooms),
        bathrooms: Number(form.bathrooms),
        area: Number(form.area),
        price: form.price.toString(), // ensure string for ListingFormData
      };

      if (listingId) {
        await updateListing(listingId, payload);
        toast.success("Listing updated successfully!");
      } else {
        await addListing(payload);
        toast.success("Listing added successfully!");
      }

      router.push("/dashboard/listings");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save listing.");
    }
  };

  return (
    <DashboardLayout>
      <ProtectedRoute>
        <div className="max-w-2xl mx-auto bg-gray-800 p-6 rounded-md shadow-md mt-4">
          <h2 className="text-2xl font-bold mb-4">{listingId ? "Edit Listing" : "Add Listing"}</h2>
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
              type="text"
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

            {/* TODO: Add images upload UI if needed */}

            <button
              type="submit"
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
