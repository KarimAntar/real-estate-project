// src/app/api/listings/image/route.ts
import { NextRequest, NextResponse } from "next/server";
import { del } from '@vercel/blob';
import { getAuth } from "firebase-admin/auth";

export const DELETE = async (request: NextRequest) => {
  try {
    // Verify authentication
    const token = request.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await getAuth().verifyIdToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { imageUrl } = await request.json();

    if (!imageUrl) {
      return NextResponse.json({ error: "Image URL is required" }, { status: 400 });
    }

    // Verify the image belongs to the user's folder
    if (!imageUrl.includes(`listings/${decoded.uid}/`)) {
      return NextResponse.json({ error: "Unauthorized to delete this image" }, { status: 403 });
    }

    // Delete from Vercel Blob
    await del(imageUrl);

    return NextResponse.json({ 
      message: "Image deleted successfully",
      deletedUrl: imageUrl
    });

  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ 
      error: "Failed to delete image" 
    }, { status: 500 });
  }
};