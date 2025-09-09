// src/app/api/listings/route.ts - Updated with status handling
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/firebase/firebaseAdmin";
import { getAuth } from "firebase-admin/auth";
import { createNotification } from "../notifications/route";

interface Listing {
  id?: string;
  title: string;
  description: string;
  price: number;
  city: string;
  type?: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  images?: string[];
  userId?: string;
  ownerId?: string;
  status?: "pending" | "approved" | "declined";
  adminNote?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  [key: string]: any;
}

// Helper: get user data & role
const getUserData = async (uid: string) => {
    try {
        const userDoc = await db.collection("users").doc(uid).get();
        if (!userDoc.exists) return { role: "user" };
        return userDoc.data() as { role?: string };
    } catch (error) {
        console.error("Error getting user data:", error);
        return { role: "user" };
    }
};

// GET all listings
export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = await getAuth().verifyIdToken(token);
    const userId = decoded.uid;

    const userData = await getUserData(userId);
    const isAdmin = userData.role === "admin";

    const url = new URL(req.url);
    const isAdminQuery = url.searchParams.get("admin") === "true";
    const isPublicQuery = url.searchParams.get("public") === "true";
    const userIdQuery = url.searchParams.get("userId");

    let querySnapshot;
    
    if (isPublicQuery) {
      // Public listings - only approved ones
      querySnapshot = await db.collection("listings")
        .where("status", "==", "approved")
        .get();
    } else if (isAdmin && isAdminQuery) {
      // Admin view - all listings
      querySnapshot = await db.collection("listings").get();
    } else if (userIdQuery && isAdmin) {
      // Admin viewing specific user's listings
      querySnapshot = await db.collection("listings")
        .where("ownerId", "==", userIdQuery)
        .get();
    } else {
      // User's own listings (all statuses)
      querySnapshot = await db.collection("listings")
        .where("ownerId", "==", userId)
        .get();
    }

    // Get user information for each listing
    const listings = await Promise.all(
      querySnapshot.docs.map(async (doc) => {
        const listingData = doc.data();
        
        // Get user information for admin view
        let userName = "Unknown User";
        let userEmail = "Unknown Email";
        
        if (isAdmin && (isAdminQuery || userIdQuery)) {
          try {
            const userDoc = await db.collection("users").doc(listingData.ownerId || listingData.userId).get();
            if (userDoc.exists) {
              const userData = userDoc.data();
              userName = userData?.fullName || userData?.email || "Unknown User";
              userEmail = userData?.email || "Unknown Email";
            }
          } catch (error) {
            console.error("Error fetching user data:", error);
          }
        }

        return {
          id: doc.id,
          docId: doc.id,
          ...listingData as Listing,
          userName: isAdmin ? userName : undefined,
          userEmail: isAdmin ? userEmail : undefined,
        };
      })
    );
    
    return NextResponse.json(listings);
  } catch (err: unknown) {
    console.error("GET listings error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST create new listing
export async function POST(req: NextRequest) {
  try {
    const body: Listing = await req.json();
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = await getAuth().verifyIdToken(token);
    const userId = decoded.uid;

    // Validate required fields
    if (!body.title || !body.description || !body.price || !body.city) {
      return NextResponse.json(
        { error: "Missing required fields: title, description, price, city" }, 
        { status: 400 }
      );
    }

    // Convert price to number if it's a string
    const price = typeof body.price === 'string' ? parseFloat(body.price) : body.price;
    if (isNaN(price)) {
      return NextResponse.json({ error: "Invalid price format" }, { status: 400 });
    }

    // Create the listing data with pending status
    const listingData = {
      title: body.title,
      description: body.description,
      price: price,
      city: body.city,
      type: body.type || "Home",
      bedrooms: Number(body.bedrooms) || 0,
      bathrooms: Number(body.bathrooms) || 0,
      area: Number(body.area) || 0,
      images: body.images || [],
      userId: userId, // For backward compatibility
      ownerId: userId, // Primary field for owner identification
      status: "pending", // All new listings start as pending
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Generate document ID
    const docRef = db.collection("listings").doc();
    
    // Add the generated ID to the data
    const finalListingData = {
      ...listingData,
      id: docRef.id, // Add document ID as 'id' field
    };

    await docRef.set(finalListingData);

    // Create notification for the user
    await createNotification({
      userId: userId,
      type: "listing_review",
      title: "Listing Submitted for Review",
      message: `Your listing "${body.title}" has been submitted and is now under review. We'll notify you once it's approved.`,
      listingId: docRef.id,
    });

    console.log("Listing created successfully:", docRef.id);

    return NextResponse.json({ 
      docId: docRef.id,
      ...finalListingData 
    });
  } catch (err: unknown) {
    console.error("POST listings error:", err);

    const errorDetails = err instanceof Error 
      ? { message: err.message, stack: err.stack } 
      : { message: "Unknown error", details: err };

    return NextResponse.json({
      error: "Failed to create listing",
      details: errorDetails
    }, { status: 500 });
  }
}