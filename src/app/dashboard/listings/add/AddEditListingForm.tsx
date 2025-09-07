// src/app/dashboard/listings/add/AddEditListingForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  addListing,
  updateListing,
  getListingsByUser,
  deleteListing,
  uploadImages,
  transformFormToListing,
  getAllListingsWithUsers,
} from "@services/userService";
import { ListingFormData, Listing } from "@/types/listing";
import { toast } from "react-toastify";
import {
  FaBed,
  FaBath,
  FaRulerCombined,
  FaTrash,
  FaDollarSign,
  FaCloudUploadAlt,
} from "react-icons/fa";
import { useAuth } from "@/app/contexts/AuthContext";

export default function AddEditListingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const listingId = searchParams?.get("id");
  const { user, loading } = useAuth();

  const [form, setForm] = useState<ListingFormData>({
    title: "",
    description: "",
    price: "",
    city: "",
    type: "Home",
    bedrooms: 1,
    bathrooms: 1,
    area: 50,
    existingImages: [],
    newImages: [],
  });

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [errors, setErrors] = useState<Record<string, boolean>>({
    title: false,
    description: false,
    price: false,
    city: false,
    bedrooms: false,
    bathrooms: false,
    area: false,
  });

  const numericFields = ["bedrooms", "bathrooms", "area", "price"];

  const baseInput =
    "w-full py-2.5 px-3 rounded-lg bg-gray-800 text-gray-200 outline-none transition border-2";
  const baseIconInput =
    "w-full py-2.5 pl-10 pr-3 rounded-lg bg-gray-800 text-gray-200 outline-none transition border-2";
  const textareaInput =
    "w-full pt-3 pr-3 pl-3 pb-2 rounded-lg bg-gray-800 text-gray-200 outline-none transition resize-none border-2";

  const fieldClasses = (name: string, icon = false) => {
    const base = icon ? baseIconInput : baseInput;
    const errorClasses =
      "border-red-500 focus:ring-2 focus:ring-red-500 focus:border-red-500";
    const normalClasses =
      "border-gray-600 focus:ring-1 focus:ring-green-500 focus:border-green-500";
    return `${base} ${errors[name] ? errorClasses : normalClasses}`;
  };

  // Load listing if editing
  useEffect(() => {
    if (!listingId || loading || !user) return;
    let cancelled = false;

    const loadListing = async () => {
      try {
        let listings: Listing[];

        if (user.role === "admin") {
          listings = await getAllListingsWithUsers();
        } else {
          listings = await getListingsByUser(user.uid);
        }

        if (cancelled) return;

        const listing = listings.find(
          (l) => l.id === listingId || l.docId === listingId
        );

        if (!listing) {
          toast.error("Listing not found or you don't have permission.");
          router.push("/dashboard/listings");
          return;
        }

        setForm({
          title: listing.title || "",
          description: listing.description || "",
          price: listing.price ? String(listing.price) : "",
          city: listing.city || "",
          type: listing.type || "Home",
          bedrooms: listing.bedrooms ?? 1,
          bathrooms: listing.bathrooms ?? 1,
          area: listing.area ?? 50,
          existingImages: listing.images || [],
          newImages: [],
          docId: listing.docId,
        });
      } catch (err) {
        console.error(err);
        toast.error("Failed to load listing.");
      }
    };

    loadListing();
    return () => {
      cancelled = true;
    };
  }, [listingId, loading, user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const parsedValue: any = numericFields.includes(name)
      ? value === "" ? "" : Number(value)
      : value;
    setForm((prev) => ({ ...prev, [name]: parsedValue } as any));
    setErrors((prev) => ({ ...prev, [name]: false }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    
    // Validate file types and sizes
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is larger than 5MB`);
        return false;
      }
      return true;
    });

    setForm((prev) => ({ 
      ...prev, 
      newImages: [...prev.newImages, ...validFiles] 
    }));
  };

  const removeExistingImage = (index: number) =>
    setForm((prev) => ({
      ...prev,
      existingImages: prev.existingImages.filter((_, i) => i !== index),
    }));

  const removeNewImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      newImages: prev.newImages.filter((_, i) => i !== index),
    }));
  };

  const uploadNewImages = async (): Promise<string[]> => {
    const newFiles = form.newImages;
    if (!newFiles.length) return [];
    
    setUploading(true);
    try {
      const result = await uploadImages(newFiles);
      return result.urls;
    } catch (err) {
      console.error(err);
      throw new Error("Failed to upload images");
    } finally {
      setUploading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, boolean> = {
      title: false,
      description: false,
      price: false,
      city: false,
      bedrooms: false,
      bathrooms: false,
      area: false,
    };

    if (!form.title?.trim()) newErrors.title = true;
    if (!form.description?.trim()) newErrors.description = true;
    if (!form.city?.trim()) newErrors.city = true;
    
    const priceNum = Number(form.price);
    if (!form.price || isNaN(priceNum) || priceNum <= 0) newErrors.price = true;
    
    if (!form.bedrooms || Number(form.bedrooms) <= 0) newErrors.bedrooms = true;
    if (!form.bathrooms || Number(form.bathrooms) <= 0) newErrors.bathrooms = true;
    if (!form.area || Number(form.area) <= 0) newErrors.area = true;

    setErrors(newErrors);
    return Object.values(newErrors).some(error => error);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return toast.error("You must be logged in.");

    if (validateForm()) return toast.error("Please fill in all required fields.");

    try {
      // Upload new images to Vercel Blob
      const uploadedUrls = await uploadNewImages();
      const allImages = [...form.existingImages, ...uploadedUrls];

      if (listingId && form.docId) {
        await updateListing(form.docId, transformFormToListing(form, listingId, allImages));
        toast.success("Listing updated successfully!");
      } else {
        await addListing(transformFormToListing(form, "", allImages));
        toast.success("Listing added successfully!");
      }

      router.push("/dashboard/listings");
    } catch (err: any) {
      console.error(err);
      toast.error(`Failed to save: ${err.message}`);
    }
  };

  const handleDelete = async () => {
    if (!listingId || !form.docId) return;
    if (!confirm("Are you sure you want to delete this listing?")) return;
    
    try {
      await deleteListing(form.docId);
      toast.success("Listing deleted!");
      router.push("/dashboard/listings");
    } catch (err: any) {
      console.error(err);
      toast.error(`Failed to delete listing: ${err.message}`);
    }
  };

  if (loading) return null;

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6">
      <h2 className="text-2xl font-bold mb-6">
        {listingId ? "Edit Listing" : "Add Listing"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {/* Title */}
        <input
          type="text"
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={handleChange}
          className={fieldClasses("title")}
          disabled={uploading}
        />

        {/* Price + City */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div
            className="flex items-center rounded-lg border-2 px-3"
            style={{
              borderColor: errors.price ? "#f87171" : "#4b5563",
            }}
          >
            <FaDollarSign className="mr-2 text-gray-400" />
            <input
              type="number"
              name="price"
              placeholder="Price"
              value={form.price as any}
              onChange={handleChange}
              className="w-full py-2.5 bg-transparent text-gray-200 outline-none"
              disabled={uploading}
            />
          </div>

          <input
            type="text"
            name="city"
            placeholder="City"
            value={form.city}
            onChange={handleChange}
            className={fieldClasses("city")}
            disabled={uploading}
          />
        </div>

        {/* Type */}
        <select
          name="type"
          value={form.type}
          onChange={handleChange}
          className={fieldClasses("type")}
          disabled={uploading}
        >
          <option value="Home">Home</option>
          <option value="Apartment">Apartment</option>
          <option value="Villa">Villa</option>
          <option value="Commercial">Commercial</option>
        </select>

        {/* Bedrooms / Bathrooms / Area */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div
            className="flex items-center rounded-lg border-2 px-3"
            style={{
              borderColor: errors.bedrooms ? "#f87171" : "#4b5563",
            }}
          >
            <FaBed className="mr-2 text-gray-400" />
            <input
              type="number"
              name="bedrooms"
              placeholder="Bedrooms"
              value={form.bedrooms as any}
              onChange={handleChange}
              className="w-full py-2.5 bg-transparent text-gray-200 outline-none"
              disabled={uploading}
              min="1"
            />
          </div>

          <div
            className="flex items-center rounded-lg border-2 px-3"
            style={{
              borderColor: errors.bathrooms ? "#f87171" : "#4b5563",
            }}
          >
            <FaBath className="mr-2 text-gray-400" />
            <input
              type="number"
              name="bathrooms"
              placeholder="Bathrooms"
              value={form.bathrooms as any}
              onChange={handleChange}
              className="w-full py-2.5 bg-transparent text-gray-200 outline-none"
              disabled={uploading}
              min="1"
            />
          </div>

          <div
            className="flex items-center rounded-lg border-2 px-3"
            style={{
              borderColor: errors.area ? "#f87171" : "#4b5563",
            }}
          >
            <FaRulerCombined className="mr-2 text-gray-400" />
            <input
              type="number"
              name="area"
              placeholder="Area (sq ft)"
              value={form.area as any}
              onChange={handleChange}
              className="w-full py-2.5 bg-transparent text-gray-200 outline-none"
              disabled={uploading}
              min="1"
            />
          </div>
        </div>

        {/* Description */}
        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          rows={4}
          className={textareaInput}
          disabled={uploading}
          style={{
            borderColor: errors.description ? "#f87171" : "#4b5563",
          }}
        />

        {/* Existing Images */}
        {form.existingImages.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-200">Current Images</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {form.existingImages.map((img, i) => (
                <div key={i} className="relative group">
                  <img
                    src={img}
                    alt=""
                    className="w-full h-32 object-cover rounded-lg shadow-md"
                  />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(i)}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    disabled={uploading}
                  >
                    <FaTrash className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* New Images Preview */}
        {form.newImages.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-200">New Images</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {form.newImages.map((img, i) => (
                <div key={i} className="relative group">
                  <img
                    src={URL.createObjectURL(img)}
                    alt=""
                    className="w-full h-32 object-cover rounded-lg shadow-md"
                  />
                  <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                    {Math.round(img.size / 1024)}KB
                  </div>
                  <button
                    type="button"
                    onClick={() => removeNewImage(i)}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    disabled={uploading}
                  >
                    <FaTrash className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* File Upload */}
        <div className="mb-4">
          <label
            htmlFor="file-upload"
            className="cursor-pointer inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors shadow-md"
          >
            <FaCloudUploadAlt className="w-5 h-5" />
            {uploading ? "Uploading..." : "Choose Images"}
          </label>
          <input
            id="file-upload"
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileChange}
            disabled={uploading}
          />
          <p className="text-gray-400 text-sm mt-2">
            Maximum 5MB per image. Supported formats: JPG, PNG, WebP
          </p>
        </div>

        {/* Upload Progress */}
        {uploading && (
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-200">Uploading images to cloud storage...</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-6 border-t border-gray-700">
          <button
            type="button"
            onClick={() => router.push("/dashboard/listings")}
            className="px-6 py-2.5 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-800 transition-colors"
            disabled={uploading}
          >
            Cancel
          </button>
          
          {listingId && (
            <button
              type="button"
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-md"
              onClick={handleDelete}
              disabled={uploading}
            >
              Delete Listing
            </button>
          )}
          
          <button
            type="submit"
            className={`bg-green-500 hover:bg-green-600 text-white px-8 py-2.5 rounded-lg font-medium transition-colors shadow-md ${
              uploading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={uploading}
          >
            {uploading
              ? "Processing..."
              : listingId
              ? "Update Listing"
              : "Add Listing"}
          </button>
        </div>
      </form>
    </div>
  );
}