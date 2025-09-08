// src/app/dashboard/listings/add/page.tsx or wherever your listing form is
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useAuth } from "@/app/contexts/AuthContext";
import ListingImageUpload from "@/app/components/ListingImageUpload";
import { addListing, uploadImagesDirect } from "@/app/services/userService";
import { Listing, ListingFormData } from "@/types/listing";
import { v4 as uuidv4 } from "uuid";
import { FaSave, FaSpinner, FaHome, FaBuilding, FaWarehouse, FaCity } from "react-icons/fa";

const propertyTypes = [
  { value: "Home", label: "House", icon: FaHome },
  { value: "Villa", label: "Villa", icon: FaBuilding },
  { value: "Apartment", label: "Apartment", icon: FaCity },
  { value: "Commercial", label: "Commercial", icon: FaWarehouse },
];

export default function AddListingForm() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<number, number>>({});
  
  const [formData, setFormData] = useState<ListingFormData>({
    title: "",
    description: "",
    city: "",
    price: "",
    type: "Home",
    bedrooms: 1,
    bathrooms: 1,
    area: 0,
    existingImages: [],
    newImages: [],
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "bedrooms" || name === "bathrooms" || name === "area" 
        ? parseInt(value) || 0 
        : value,
    }));
  };

  const handleImagesChange = (images: string[]) => {
    setFormData(prev => ({
      ...prev,
      existingImages: images,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return false;
    }
    if (!formData.description.trim()) {
      toast.error("Description is required");
      return false;
    }
    if (!formData.city.trim()) {
      toast.error("City is required");
      return false;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error("Valid price is required");
      return false;
    }
    if (formData.bedrooms < 0 || formData.bathrooms < 0) {
      toast.error("Bedrooms and bathrooms must be non-negative");
      return false;
    }
    if (formData.area < 0) {
      toast.error("Area must be non-negative");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("You must be logged in to create a listing");
      return;
    }

    if (!validateForm()) return;

    setLoading(true);
    try {
      // Upload any new images first
      let imageUrls = [...formData.existingImages];
      if (formData.newImages.length > 0) {
        toast.info("Uploading images...");
        const uploadedUrls = await uploadImagesDirect(
          formData.newImages,
          (fileIndex, progress) => {
            setUploadProgress(prev => ({ ...prev, [fileIndex]: progress }));
          }
        );
        imageUrls = [...imageUrls, ...uploadedUrls];
      }

      // Create the listing object
      const listingData: Listing = {
        id: uuidv4(),
        title: formData.title.trim(),
        description: formData.description.trim(),
        city: formData.city.trim(),
        price: parseFloat(formData.price),
        type: formData.type,
        bedrooms: formData.bedrooms,
        bathrooms: formData.bathrooms,
        area: formData.area,
        images: imageUrls,
        ownerId: user.uid,
      };

      console.log("Submitting listing data:", listingData);

      // Save to database
      toast.info("Saving listing...");
      const result = await addListing(listingData);
      
      console.log("Listing saved successfully:", result);

      toast.success("Listing created successfully!");
      router.push("/dashboard/listings");
    } catch (error: any) {
      console.error("Failed to create listing:", error);
      toast.error(error.message || "Failed to create listing");
    } finally {
      setLoading(false);
      setUploadProgress({});
    }
  };

  const hasNewImages = formData.newImages.length > 0;
  const uploadProgressAvg = hasNewImages 
    ? Math.round(Object.values(uploadProgress).reduce((a, b) => a + b, 0) / Object.keys(uploadProgress).length)
    : 0;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-800 rounded-lg shadow-lg">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Add New Listing</h1>
        <p className="text-gray-400">Create a new property listing</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Property Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., Beautiful Family Home"
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={loading}
            />
          </div>

          {/* City */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              City *
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              placeholder="e.g., New York"
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={loading}
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Describe your property..."
            rows={4}
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={loading}
          />
        </div>

        {/* Property Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Price ($) *
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              placeholder="0"
              min="0"
              step="0.01"
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={loading}
            />
          </div>

          {/* Bedrooms */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Bedrooms
            </label>
            <input
              type="number"
              name="bedrooms"
              value={formData.bedrooms}
              onChange={handleInputChange}
              min="0"
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>

          {/* Bathrooms */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Bathrooms
            </label>
            <input
              type="number"
              name="bathrooms"
              value={formData.bathrooms}
              onChange={handleInputChange}
              min="0"
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>

          {/* Area */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Area (sq ft)
            </label>
            <input
              type="number"
              name="area"
              value={formData.area}
              onChange={handleInputChange}
              min="0"
              placeholder="0"
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>
        </div>

        {/* Property Type */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Property Type *
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {propertyTypes.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: value as any }))}
                className={`p-4 rounded-lg border-2 transition-all ${
                  formData.type === value
                    ? "border-blue-500 bg-blue-500/20 text-blue-300"
                    : "border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500"
                }`}
                disabled={loading}
              >
                <Icon className="w-6 h-6 mx-auto mb-2" />
                <span className="text-sm font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Image Upload */}
        <ListingImageUpload
          images={formData.existingImages}
          onImagesChange={handleImagesChange}
          maxImages={10}
          className="border border-gray-600 rounded-lg p-4"
        />

        {/* Upload Progress */}
        {hasNewImages && loading && (
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-300">Uploading images...</span>
              <span className="text-sm text-gray-300">{uploadProgressAvg}%</span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgressAvg}%` }}
              />
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end pt-6">
          <button
            type="submit"
            disabled={loading}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              loading
                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white hover:scale-105 shadow-lg"
            }`}
          >
            {loading ? (
              <>
                <FaSpinner className="w-5 h-5 animate-spin" />
                {hasNewImages ? "Uploading..." : "Saving..."}
              </>
            ) : (
              <>
                <FaSave className="w-5 h-5" />
                Create Listing
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}