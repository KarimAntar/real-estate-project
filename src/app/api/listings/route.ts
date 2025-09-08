// src/app/api/listings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/firebase/firebaseAdmin";
import { getAuth } from "firebase-admin/auth";

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
  ownerId?: string; // Add this for compatibility
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

    let snapshot;
    if (isAdmin && isAdminQuery) {
      snapshot = await db.collection("listings").get(); // all listings
    } else {
      // Get listings where either userId or ownerId matches (for backward compatibility)
      snapshot = await db.collection("listings")
        .where("userId", "==", userId)
        .get();
      
      // Also check for ownerId if no results with userId
      if (snapshot.empty) {
        snapshot = await db.collection("listings")
          .where("ownerId", "==", userId)
          .get();
      }
    }

    const listings = snapshot.docs.map(doc => ({ 
      id: doc.id, 
      docId: doc.id, // Add docId for frontend compatibility
      ...(doc.data() as Listing) 
    }));
    
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

    // Create the listing data
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

    console.log("Listing created successfully:", docRef.id);

    // FIX: The spread of `finalListingData` already includes the `id`.
    // We just need to add `docId` for consistency with the GET response.
    return NextResponse.json({ 
      docId: docRef.id,
      ...finalListingData 
    });
  } catch (err: unknown) {
    console.error("POST listings error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ 
      error: "Failed to create listing",
      details: message 
    }, { status: 500 });
  }
}