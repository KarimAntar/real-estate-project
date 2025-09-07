import { NextRequest, NextResponse } from "next/server";
import { put } from '@vercel/blob';
import { getAuth } from "firebase-admin/auth";

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

    if (allFiles.length > maxFiles) {
      return NextResponse.json({ 
        error: `Maximum ${maxFiles} files allowed per upload` 
      }, { status: 400 });
    }

    for (const file of allFiles) {
      if (!file.type.startsWith('image/')) {
        return NextResponse.json({ 
          error: `File ${file.name} is not an image` 
        }, { status: 400 });
      }
      
      if (file.size > maxSize) {
        return NextResponse.json({ 
          error: `File ${file.name} exceeds 5MB limit` 
        }, { status: 400 });
      }
    }

    // Upload all files to Vercel Blob
    const uploadPromises = allFiles.map(async (file, index) => {
      const fileName = `listings/${decoded.uid}/${Date.now()}-${index}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      
      const blob = await put(fileName, file, {
        access: 'public',
      });
      
      return blob.url;
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