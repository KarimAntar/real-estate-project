// src/app/api/listings/image/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { getStorage } from "firebase-admin/storage";

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

    // Extract file path from Firebase Storage URL
    let filePath = '';
    
    if (imageUrl.includes('firebasestorage.googleapis.com')) {
      // Extract from Firebase Storage URL
      // URL format: https://firebasestorage.googleapis.com/v0/b/bucket/o/path%2Fto%2Ffile?alt=media&token=...
      const urlParts = imageUrl.split('/o/')[1];
      if (urlParts) {
        filePath = decodeURIComponent(urlParts.split('?')[0]);
      }
    } else if (imageUrl.includes('storage.googleapis.com')) {
      // Extract from Google Cloud Storage URL
      // URL format: https://storage.googleapis.com/bucket/path/to/file
      const urlParts = imageUrl.split(`storage.googleapis.com/`)[1];
      if (urlParts) {
        const pathParts = urlParts.split('/');
        pathParts.shift(); // Remove bucket name
        filePath = pathParts.join('/');
      }
    }

    if (!filePath) {
      return NextResponse.json({ 
        error: "Unable to parse image URL. Invalid format." 
      }, { status: 400 });
    }

    // Verify the file belongs to the user's folder
    if (!filePath.startsWith(`listings/${decoded.uid}/`)) {
      return NextResponse.json({ 
        error: "Unauthorized to delete this image" 
      }, { status: 403 });
    }

    // Get Firebase Storage bucket
    const bucket = getStorage().bucket();
    const file = bucket.file(filePath);

    // Check if file exists
    const [exists] = await file.exists();
    if (!exists) {
      return NextResponse.json({ 
        error: "Image not found in storage" 
      }, { status: 404 });
    }

    // Delete the file
    await file.delete();

    return NextResponse.json({ 
      message: "Image deleted successfully",
      deletedUrl: imageUrl,
      filePath: filePath
    });

  } catch (error) {
    console.error('Delete error:', error);
    
    // Handle specific Firebase errors
    if (error instanceof Error) {
      if (error.message.includes('No such object')) {
        return NextResponse.json({ 
          error: "Image not found in storage" 
        }, { status: 404 });
      }
      if (error.message.includes('Forbidden')) {
        return NextResponse.json({ 
          error: "Permission denied" 
        }, { status: 403 });
      }
    }

    return NextResponse.json({ 
      error: "Failed to delete image" 
    }, { status: 500 });
  }
};