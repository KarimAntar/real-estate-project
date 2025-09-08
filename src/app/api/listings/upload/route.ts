// src/app/api/listings/upload/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { getStorage } from "firebase-admin/storage";
import { db } from "@/app/firebase/firebaseAdmin";
import { bucket } from "@/app/firebase/firebaseAdmin";


export const POST = async (request: NextRequest) => {
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

    const data = await request.formData();
    
    // Handle both single file and multiple files
    const files = data.getAll("file") as File[];
    const images = data.getAll("images") as File[]; // Support for multiple images field
    
    const allFiles = [...files, ...images].filter(file => file instanceof File);

    if (allFiles.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    // Validate files
    const maxSize = 5 * 1024 * 1024; // 5MB per file
    const maxFiles = 10; // Maximum 10 files per upload
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

    if (allFiles.length > maxFiles) {
      return NextResponse.json({ 
        error: `Maximum ${maxFiles} files allowed per upload` 
      }, { status: 400 });
    }

    for (const file of allFiles) {
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json({ 
          error: `File ${file.name} has unsupported format. Allowed: JPEG, PNG, WebP, GIF` 
        }, { status: 400 });
      }
      
      if (file.size > maxSize) {
        return NextResponse.json({ 
          error: `File ${file.name} exceeds 5MB limit` 
        }, { status: 400 });
      }
    }

    // Get Firebase Storage bucket
    //const bucket = getStorage().bucket();
    const uploadPromises = allFiles.map(async (file, index) => {
      // Generate unique filename with user folder organization
      const timestamp = Date.now();
      const fileName = `listings/${decoded.uid}/${timestamp}-${index}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      
      // Convert File to Buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // Create file in Firebase Storage
      const fileRef = bucket.file(fileName);
      
      // Upload file
      await fileRef.save(buffer, {
        metadata: {
          contentType: file.type,
          metadata: {
            uploadedBy: decoded.uid,
            uploadedAt: new Date().toISOString(),
            originalName: file.name,
          }
        }
      });

      // Make file publicly accessible
      await fileRef.makePublic();

      // Get public URL
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
      
      return publicUrl;
    });

    const urls = await Promise.all(uploadPromises);

    return NextResponse.json({ 
      urls,
      message: `${urls.length} file(s) uploaded successfully`
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ 
      error: "Failed to upload file(s)" 
    }, { status: 500 });
  }
};