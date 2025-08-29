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
import {
  FaBed,
  FaBath,
  FaRulerCombined,
  FaTrash,
  FaPlus,
  FaDollarSign,
} from "react-icons/fa";
import { useAuth } from "@/app/contexts/AuthContext"; // ✅ ensure we wait for auth

export default function AddEditListingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const listingId = searchParams?.get("id");
  const { user, loading } = useAuth(); // ✅ auth state

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

  const [errors, setErrors] = useState<Record<string, boolean>>({
    title: false,
    description: false,
    price: false,
    city: false,
    bedrooms: false,
    bathrooms: false,
    area: false,
  });

  const baseNoIcon =
  "w-full py-2.5 px-3 rounded-lg bg-gray-800 text-gray-200 outline-none transition";
  const baseWithIcon =
    "w-full py-2.5 pr-3 pl-10 rounded-lg bg-gray-800 text-gray-200 outline-none transition";
    const baseTextareaWithIcon =
  "w-full pt-3 pr-3 pl-10 pb-2 rounded-lg bg-gray-800 text-gray-200 outline-none transition resize-none";


  const fieldClasses = (name: string, hasIcon = false) => {
    const base = hasIcon ? baseWithIcon : baseNoIcon;
    const errorClasses =
      "border-2 border-red-500 focus:ring-2 focus:ring-red-500";
    const normalClasses =
      "border-2 border-gray-700 focus:border-green-500 focus:ring-1 focus:ring-green-500";
    return `${base} ${errors[name] ? errorClasses : normalClasses}`;
  };


  // Load existing listing for edit
  useEffect(() => {
    if (!listingId || loading || !user) return; // ✅ wait for auth to be ready

    let cancelled = false;

    const load = async () => {
      try {
        const listings: Listing[] = await getUserListings();
        if (cancelled) return;
        const listing = listings.find(
          (l: Listing) => String(l.id) === String(listingId)
        );
        if (!listing) return;

        setForm({
          title: listing.title || "",
          description: listing.description || "",
          price: listing.price ? String(listing.price) : "",
          city: listing.city || "",
          type: listing.type || "Home",
          bedrooms: listing.bedrooms ?? 1,
          bathrooms: listing.bathrooms ?? 1,
          area: listing.area ?? 50,
          images: [],
        });
        setExistingImages(listing.images || []);
      } catch (err) {
        console.error("Failed to load listing:", err);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [listingId, loading, user]);

  const numericFields = ["bedrooms", "bathrooms", "area"];

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
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
    setForm((prev) => ({ ...prev, images: [...prev.images, ...files] }));
    setProgress((prev) => [...prev, ...files.map(() => 0)]);
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

  const uploadImages = async (): Promise<string[]> => {
    const newFiles = form.images.filter((f) => !(typeof f === "string")) as File[];
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

    if (!form.title || String(form.title).trim() === "") {
      newErrors.title = true;
      missing.push("Title");
    }
    if (!form.description || String(form.description).trim() === "") {
      newErrors.description = true;
      missing.push("Description");
    }
    const priceNum = Number(form.price);
    if (form.price === "" || isNaN(priceNum) || priceNum <= 0) {
      newErrors.price = true;
      missing.push("Price (must be greater than 0)");
    }
    if (!form.city || String(form.city).trim() === "") {
      newErrors.city = true;
      missing.push("City");
    }
    if (!form.bedrooms || Number(form.bedrooms) <= 0) {
      newErrors.bedrooms = true;
      missing.push("Bedrooms (must be greater than 0)");
    }
    if (!form.bathrooms || Number(form.bathrooms) <= 0) {
      newErrors.bathrooms = true;
      missing.push("Bathrooms (must be greater than 0)");
    }
    if (!form.area || Number(form.area) <= 0) {
      newErrors.area = true;
      missing.push("Area (must be greater than 0)");
    }

    setErrors(newErrors);
    return missing;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const missing = validateForm();
    if (missing.length > 0) {
      toast.error(
        <div className="text-left">
          <h3 className="font-semibold mb-1">⚠️ Missing information:</h3>
          <ul className="ml-4 list-disc">
            {missing.map((m) => <li key={m}>{m}</li>)}
          </ul>
        </div>,
        { position: "top-center", autoClose: 4500 }
      );
      return;
    }

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
      <div className="max-w-3xl mx-auto p-4 md:p-6">
        <h2 className="text-2xl font-bold mb-6">
          {listingId ? "Edit Listing" : "Add Listing"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Title */}
          <div>
            <input
              type="text"
              name="title"
              placeholder="Title"
              value={form.title}
              onChange={handleChange}
              className={fieldClasses("title")}
            />
            <div className="min-h-[20px]">
              {errors.title && <p className="text-red-500 text-sm">Title is required</p>}
            </div>
          </div>

        {/* Price + City */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Price */}
          <div>
            <div
              className={`flex items-center rounded-lg px-3 border-2 ${
                errors.price ? "border-red-500" : "border-gray-600"
              }`}
            >
              <FaDollarSign className="text-gray-400 mr-2" />
              <input
                type="number"
                name="price"
                placeholder="Price"
                value={form.price as any}
                onChange={handleChange}
                className="w-full py-2.5 bg-transparent text-gray-200 outline-none"
              />
            </div>
            <div className="min-h-[20px]">
              {errors.price && (
                <p className="text-red-500 text-sm">Price must be greater than 0</p>
              )}
            </div>
          </div>

          {/* City */}
          <div>
            <input
              type="text"
              name="city"
              placeholder="City"
              value={form.city}
              onChange={handleChange}
              className={`w-full py-2.5 px-3 rounded-lg bg-gray-800 border-2 outline-none text-gray-200
                ${errors.city ? "border-red-500" : "border-gray-600"}`}
            />
            <div className="min-h-[20px]">
              {errors.city && <p className="text-red-500 text-sm">City is required</p>}
            </div>
          </div>
        </div>

        {/* Bedrooms / Bathrooms / Area */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Bedrooms */}
          <div>
            <div
              className={`flex items-center rounded-lg px-3 border-2 ${
                errors.bedrooms ? "border-red-500" : "border-gray-600"
              }`}
            >
              <FaBed className="text-gray-400 mr-2" />
              <input
                type="number"
                name="bedrooms"
                placeholder="Bedrooms"
                value={form.bedrooms as any}
                onChange={handleChange}
                className="w-full py-2.5 bg-transparent text-gray-200 outline-none"
              />
            </div>
            <div className="min-h-[20px]">
              {errors.bedrooms && (
                <p className="text-red-500 text-sm">Bedrooms must be greater than 0</p>
              )}
            </div>
          </div>

          {/* Bathrooms */}
          <div>
            <div
              className={`flex items-center rounded-lg px-3 border-2 ${
                errors.bathrooms ? "border-red-500" : "border-gray-600"
              }`}
            >
              <FaBath className="text-gray-400 mr-2" />
              <input
                type="number"
                name="bathrooms"
                placeholder="Bathrooms"
                value={form.bathrooms as any}
                onChange={handleChange}
                className="w-full py-2.5 bg-transparent text-gray-200 outline-none"
              />
            </div>
            <div className="min-h-[20px]">
              {errors.bathrooms && (
                <p className="text-red-500 text-sm">Bathrooms must be greater than 0</p>
              )}
            </div>
          </div>

          {/* Area */}
          <div>
            <div
              className={`flex items-center rounded-lg px-3 border-2 ${
                errors.area ? "border-red-500" : "border-gray-600"
              }`}
            >
              <FaRulerCombined className="text-gray-400 mr-2" />
              <input
                type="number"
                name="area"
                placeholder="Area (sq ft)"
                value={form.area as any}
                onChange={handleChange}
                className="w-full py-2.5 bg-transparent text-gray-200 outline-none"
              />
            </div>
            <div className="min-h-[20px]">
              {errors.area && (
                <p className="text-red-500 text-sm">Area must be greater than 0</p>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mt-3">
          <textarea
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            className={`w-full px-3 py-2.5 rounded-lg bg-gray-800 border-2 outline-none text-gray-200 resize-none
              ${errors.description ? "border-red-500" : "border-gray-600"}`}
          />
          <div className="min-h-[20px]">
            {errors.description && (
              <p className="text-red-500 text-sm">Description is required</p>
            )}
          </div>
        </div>



          {/* Existing images */}
          {existingImages.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {existingImages.map((img, i) => (
                <div key={i} className="relative group">
                  <img src={img} alt="" className="w-full h-28 object-cover rounded-lg" />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(img)}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded opacity-0 group-hover:opacity-100"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* New images */}
          <div>
            <label className="block mb-2 text-gray-300">Upload Images</label>
            <label className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg cursor-pointer text-white transition">
              <FaPlus /> Choose Files
              <input type="file" multiple onChange={handleFileChange} className="hidden" />
            </label>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4">
            {listingId && (
              <button
                type="button"
                className="bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-lg"
                onClick={handleDelete}
              >
                Delete Listing
              </button>
            )}
            <button
              type="submit"
              className={`bg-green-500 hover:bg-green-600 text-white px-6 py-2.5 rounded-lg ${
                uploading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={uploading}
            >
              {uploading ? "Uploading..." : listingId ? "Update Listing" : "Add Listing"}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
