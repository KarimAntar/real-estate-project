// src/app/dashboard/listings/add/AddEditListingForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  addListing,
  updateListing,
  getListingsByUser,
  deleteListing,
  uploadImage,
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
  const [progress, setProgress] = useState<number[]>([]);
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
// Load listing if editing
useEffect(() => {
  if (!listingId || loading || !user) return;
  let cancelled = false;

  const loadListing = async () => {
    try {
      let listings: Listing[];

      if (user.role === "admin") {
        // ✅ Admin gets all listings
        listings = await getAllListingsWithUsers();
      } else {
        // ✅ Normal user gets only their own listings
        listings = await getListingsByUser(user.uid);
      }

      if (cancelled) return;

      // match either UUID id or Firestore docId
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
        existingImages: listing.images,
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
    setForm((prev) => ({ ...prev, newImages: [...prev.newImages, ...files] }));
    setProgress((prev) => [...prev, ...files.map(() => 0)]);
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
    setProgress((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (): Promise<string[]> => {
    const newFiles = form.newImages;
    if (!newFiles.length) return [];
    setUploading(true);
    const urls: string[] = [];
    for (let i = 0; i < newFiles.length; i++) {
      const file = newFiles[i];
      try {
        const formData = new FormData();
        formData.append("file", file);
        const res = await uploadImage(formData);
        urls.push(res.urls[0]);
        setProgress((prev) => {
          const copy = [...prev];
          copy[i] = 100;
          return copy;
        });
      } catch (err) {
        console.error(err);
        setUploading(false);
        throw new Error("Failed to upload file");
      }
    }
    setUploading(false);
    return urls;
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
    const missing: string[] = [];

    if (!form.title || !form.title.trim()) {
      newErrors.title = true;
      missing.push("Title");
    }
    if (!form.description || !form.description.trim()) {
      newErrors.description = true;
      missing.push("Description");
    }
    const priceNum = Number(form.price);
    if (!form.price || isNaN(priceNum) || priceNum <= 0) {
      newErrors.price = true;
      missing.push("Price");
    }
    if (!form.city || !form.city.trim()) {
      newErrors.city = true;
      missing.push("City");
    }
    if (!form.bedrooms || Number(form.bedrooms) <= 0) {
      newErrors.bedrooms = true;
      missing.push("Bedrooms");
    }
    if (!form.bathrooms || Number(form.bathrooms) <= 0) {
      newErrors.bathrooms = true;
      missing.push("Bathrooms");
    }
    if (!form.area || Number(form.area) <= 0) {
      newErrors.area = true;
      missing.push("Area");
    }

    setErrors(newErrors);
    return missing;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return toast.error("You must be logged in.");

    const missing = validateForm();
    if (missing.length) return toast.error("Missing fields.");

    try {
      const uploadedUrls = await uploadImages();
      const allImages = [...form.existingImages, ...uploadedUrls];

      if (listingId && form.docId) {
      await updateListing(form.docId, transformFormToListing(form, listingId, allImages));
      toast.success("Listing updated!");
      router.push("/dashboard/listings");
    } else {
      const newListing = await addListing(transformFormToListing(form, "", allImages));
      toast.success("Listing added!");
      router.push(`/dashboard/listings/add?id=${newListing.id}`);
    }

    } catch (err: any) {
      console.error(err);
      toast.error(`Failed to save: ${err.message}`);
    }
  };

  const handleDelete = async () => {
    if (!listingId || !form.docId) return;
    try {
      await deleteListing(form.docId); // ✅ Use docId
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
      <h2 className="text-2xl font-bold mb-6">{listingId ? "Edit Listing" : "Add Listing"}</h2>

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
          <div className="flex items-center rounded-lg border-2 px-3" style={{ borderColor: errors.price ? "#f87171" : "#4b5563" }}>
            <FaDollarSign className="mr-2 text-gray-400" />
            <input type="number" name="price" placeholder="Price" value={form.price as any} onChange={handleChange} className="w-full py-2.5 bg-transparent text-gray-200 outline-none" disabled={uploading} />
          </div>

          <input type="text" name="city" placeholder="City" value={form.city} onChange={handleChange} className={fieldClasses("city")} disabled={uploading} />
        </div>

        {/* Type */}
        <select name="type" value={form.type} onChange={handleChange} className={fieldClasses("type")} disabled={uploading}>
          <option value="Home">Home</option>
          <option value="Apartment">Apartment</option>
          <option value="Office">Office</option>
          <option value="Other">Other</option>
        </select>

        {/* Bedrooms / Bathrooms / Area */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="flex items-center rounded-lg border-2 px-3" style={{ borderColor: errors.bedrooms ? "#f87171" : "#4b5563" }}>
            <FaBed className="mr-2 text-gray-400" />
            <input type="number" name="bedrooms" placeholder="Bedrooms" value={form.bedrooms as any} onChange={handleChange} className="w-full py-2.5 bg-transparent text-gray-200 outline-none" disabled={uploading} />
          </div>

          <div className="flex items-center rounded-lg border-2 px-3" style={{ borderColor: errors.bathrooms ? "#f87171" : "#4b5563" }}>
            <FaBath className="mr-2 text-gray-400" />
            <input type="number" name="bathrooms" placeholder="Bathrooms" value={form.bathrooms as any} onChange={handleChange} className="w-full py-2.5 bg-transparent text-gray-200 outline-none" disabled={uploading} />
          </div>

          <div className="flex items-center rounded-lg border-2 px-3" style={{ borderColor: errors.area ? "#f87171" : "#4b5563" }}>
            <FaRulerCombined className="mr-2 text-gray-400" />
            <input type="number" name="area" placeholder="Area (sq ft)" value={form.area as any} onChange={handleChange} className="w-full py-2.5 bg-transparent text-gray-200 outline-none" disabled={uploading} />
          </div>
        </div>

        {/* Description */}
        <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} rows={4} className={textareaInput} disabled={uploading} />

        {/* Existing Images */}
        {form.existingImages.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {form.existingImages.map((img, i) => (
              <div key={i} className="relative group">
                <img src={img} alt="" className="w-full h-28 object-cover rounded-lg" />
                <button type="button" onClick={() => removeExistingImage(i)} className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded opacity-0 group-hover:opacity-100" disabled={uploading}>
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* New Images */}
        {form.newImages.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {form.newImages.map((img, i) => (
              <div key={i} className="relative group">
                <img src={URL.createObjectURL(img)} alt="" className="w-full h-28 object-cover rounded-lg" />
                <button type="button" onClick={() => removeNewImage(i)} className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded opacity-0 group-hover:opacity-100" disabled={uploading}>
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* File Upload */}
        <div className="mb-4">
          <label htmlFor="file-upload" className="cursor-pointer inline-block px-4 py-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition font-semibold text-sm">
            Choose Files
          </label>
          <input id="file-upload" type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} disabled={uploading} />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          {listingId && (
            <button type="button" className="bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-lg" onClick={handleDelete} disabled={uploading}>
              Delete
            </button>
          )}
          <button type="submit" className={`bg-green-500 hover:bg-green-600 text-white px-6 py-2.5 rounded-lg ${uploading ? "opacity-50 cursor-not-allowed" : ""}`} disabled={uploading}>
            {uploading ? "Uploading..." : listingId ? "Update Listing" : "Add Listing"}
          </button>
        </div>
      </form>
    </div>
  );
}
