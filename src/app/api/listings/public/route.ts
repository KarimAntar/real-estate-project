// src/app/api/listings/public/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/firebase/firebaseAdmin";
import { Listing } from "@/types/listing";


// GET approved listings for public view (no auth required)
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const city = url.searchParams.get("city");
    const type = url.searchParams.get("type");
    const minPrice = url.searchParams.get("minPrice");
    const maxPrice = url.searchParams.get("maxPrice");
    const bedrooms = url.searchParams.get("bedrooms");
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const offset = parseInt(url.searchParams.get("offset") || "0");

    // Start with base query for approved listings
    let query = db.collection("listings")
      .where("status", "==", "approved");

    // Apply filters
    if (city) {
      query = query.where("city", "==", city);
    }
    
    if (type) {
      query = query.where("type", "==", type);
    }

    // Note: Firestore doesn't support range queries on multiple fields easily
    // You might want to implement price and bedroom filtering client-side
    // or use a more advanced search solution like Algolia

    // Order by creation date (most recent first)
    query = query.orderBy("createdAt", "desc");

    // Apply pagination
    if (offset > 0) {
      const offsetSnapshot = await query.limit(offset).get();
      if (!offsetSnapshot.empty) {
        const lastDoc = offsetSnapshot.docs[offsetSnapshot.docs.length - 1];
        query = query.startAfter(lastDoc);
      }
    }

    const querySnapshot = await query.limit(limit).get();

    // Process listings and filter by price/bedrooms if needed
    
    let listings: Listing[] = querySnapshot.docs.map(doc => ({
    id: doc.id,
    docId: doc.id,
    ...(doc.data() as Omit<Listing, "id" | "docId">),
    }));

    // Client-side filtering for price range
    if (minPrice) {
    const min = parseFloat(minPrice);
    listings = listings.filter(listing => Number(listing.price) >= min);
    }

    if (maxPrice) {
    const max = parseFloat(maxPrice);
    listings = listings.filter(listing => Number(listing.price) <= max);
    }

    if (bedrooms) {
    const bedroomCount = parseInt(bedrooms);
    listings = listings.filter(listing => Number(listing.bedrooms) >= bedroomCount);
    }


    // Get total count for pagination (approximate)
    const totalSnapshot = await db.collection("listings")
      .where("status", "==", "approved")
      .get();
    
    const totalCount = totalSnapshot.docs.length;

    return NextResponse.json({
      listings,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: (offset + limit) < totalCount
      }
    });

  } catch (err: unknown) {
    console.error("GET public listings error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}