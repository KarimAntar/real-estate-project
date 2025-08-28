// src/app/dashboard/listings/add/page.tsx
"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@components/dashboard/DashboardLayout";
import { useRouter, useSearchParams } from "next/navigation";
import {
  addListing,
  updateListing,
  getUserListings,
  deleteListing,
  uploadImage,
} from "@services/userService";
import { ListingFormData, Listing } from "@/types/listing";
import { toast } from "react-toastify";
import { FaBed, FaBath, FaRulerCombined, FaTrash, FaPlus } from "react-icons/fa";

export default function AddEditListingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const listingId = searchParams?.get("id");

  const [form, setForm] = useState<ListingFormData>({
    title: "",
    description: "",
    price: "",
    city: "",
    type: "Home",
    bedrooms: 1,
    bathrooms: 1,
    area: 50,
    images: [],
  });

  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<number[]>([]);

  // Load existing listing if editing
  useEffect(() => {
    if (!listingId) return;
    getUserListings()
      .then((listings: Listing[]) => {
        const listing = listings.find((l) => String(l.id) === String(listingId));
        if (!listing) return;
        setForm({
          title: listing.title,
          description: listing.description,
          price: String(listing.price),
          city: listing.city,
          type: listing.type,
          bedrooms: listing.bedrooms,
          bathrooms: listing.bathrooms,
          area: listing.area,
          images: [],
        });
        setExistingImages(listing.images || []);
      })
      .catch((err) => console.error("Failed to load listing:", err));
  }, [listingId]);

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle new file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    setForm((prev) => ({ ...prev, images: files }));
    setProgress(files.map(() => 0));
  };

  const removeExistingImage = (url: string) =>
    setExistingImages((prev) => prev.filter((img) => img !== url));

  const removeNewImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    setProgress((prev) => prev.filter((_, i) => i !== index));
  };

  // Upload new images
  const uploadImages = async (): Promise<string[]> => {
    if (!form.images.length) return [];
    setUploading(true);
    const urls: string[] = [];

    for (let i = 0; i < form.images.length; i++) {
      const file = form.images[i];
      try {
        const formData = new FormData();
        formData.append("file", file);
        const res = await uploadImage(formData);

        urls.push(res.urls[0]);
        setProgress((prev) => {
          const newProgress = [...prev];
          newProgress[i] = 100;
          return newProgress;
        });
      } catch (err) {
        console.error("Upload failed:", err);
        setUploading(false);
        throw new Error("Failed to upload file");
      }
    }

    setUploading(false);
    return urls;
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const uploadedUrls = await uploadImages();
      const listingData: ListingFormData = {
        ...form,
        images: [...existingImages, ...uploadedUrls],
      };

      if (listingId) {
        await updateListing(listingId, listingData);
        toast.success("Listing updated!");
      } else {
        await addListing(listingData);
        toast.success("Listing added!");
      }

      router.push("/dashboard/listings");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save listing.");
    }
  };

  // Delete listing
  const handleDelete = async () => {
    if (!listingId) return;
    try {
      await deleteListing(listingId);
      toast.success("Listing deleted!");
      router.push("/dashboard/listings");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete listing.");
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto p-4">
        <h2 className="text-2xl font-bold mb-4">
          {listingId ? "Edit Listing" : "Add Listing"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="title"
            placeholder="Title"
            value={form.title}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-800 text-gray-200"
            required
          />
          <input
            type="number"
            name="price"
            placeholder="Price"
            value={form.price}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-800 text-gray-200"
            required
            min={0}
          />
          <input
            type="text"
            name="city"
            placeholder="City"
            value={form.city}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-800 text-gray-200"
            required
          />
          <textarea
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-800 text-gray-200"
            required
          />
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-800 text-gray-200"
          >
            <option value="Home">Home</option>
            <option value="Villa">Villa</option>
            <option value="Apartment">Apartment</option>
            <option value="Commercial">Commercial</option>
          </select>

          <div className="flex gap-2">
            <div className="flex items-center gap-1 w-1/3">
              <FaBed className="text-gray-400" />
              <input
                type="number"
                name="bedrooms"
                placeholder="Bedrooms"
                value={form.bedrooms}
                onChange={handleChange}
                className="w-full p-2 rounded bg-gray-800 text-gray-200"
                min={1}
              />
            </div>
            <div className="flex items-center gap-1 w-1/3">
              <FaBath className="text-gray-400" />
              <input
                type="number"
                name="bathrooms"
                placeholder="Bathrooms"
                value={form.bathrooms}
                onChange={handleChange}
                className="w-full p-2 rounded bg-gray-800 text-gray-200"
                min={1}
              />
            </div>
            <div className="flex items-center gap-1 w-1/3">
              <FaRulerCombined className="text-gray-400" />
              <input
                type="number"
                name="area"
                placeholder="Area (sq ft)"
                value={form.area}
                onChange={handleChange}
                className="w-full p-2 rounded bg-gray-800 text-gray-200"
                min={1}
              />
            </div>
          </div>

          {/* Existing images */}
          {existingImages.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {existingImages.map((img, i) => (
                <div key={i} className="relative group">
                  <img
                    src={img}
                    alt={`listing-${i}`}
                    className="w-full h-24 object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(img)}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* New images */}
          <div>
            <label className="block mb-2">Upload Images</label>
            <label className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded cursor-pointer text-white">
              <FaPlus /> Choose Files
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            {form.images.length > 0 && (
              <div className="mt-2 space-y-1">
                {form.images.map((file, i) => (
                  <div
                    key={i}
                    className="relative w-full bg-gray-700 rounded h-6 flex items-center"
                  >
                    <div
                      className="bg-green-500 h-6 rounded"
                      style={{ width: `${progress[i] || 100}%` }}
                    ></div>
                    <span className="absolute left-2 text-xs text-white truncate">
                      {typeof file === "string" ? file.split("/").pop() : file.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeNewImage(i)}
                      className="absolute right-2 text-red-500"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {listingId && (
              <button
                type="button"
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                onClick={handleDelete}
              >
                Delete Listing
              </button>
            )}
            <button
              type="submit"
              className={`bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded ${
                uploading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={uploading}
            >
              {uploading
                ? "Uploading..."
                : listingId
                ? "Update Listing"
                : "Add Listing"}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
