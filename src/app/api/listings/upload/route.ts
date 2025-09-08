// src/app/api/listings/upload/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { bucket } from "@/app/firebase/firebaseAdmin"; // Ensure firebaseAdmin is correctly initialized

export const POST = async (request: NextRequest) => {
  console.log("[UPLOAD API] Received a request."); // 1. Check if the API is even hit

  try {
    const token = request.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      console.error("[UPLOAD API] Error: No authorization token provided.");
      return NextResponse.json({ error: "Unauthorized: No token." }, { status: 401 });
    }

    const decoded = await getAuth().verifyIdToken(token);
    if (!decoded) {
      console.error("[UPLOAD API] Error: Invalid token.");
      return NextResponse.json({ error: "Invalid token." }, { status: 401 });
    }
    console.log(`[UPLOAD API] Token verified for user: ${decoded.uid}`); // 2. Check if auth passes

    const data = await request.formData();
    const allFiles = (data.getAll("file") as File[]).concat(data.getAll("images") as File[]).filter(f => f instanceof File);

    if (allFiles.length === 0) {
      console.error("[UPLOAD API] Error: No files were found in the form data.");
      return NextResponse.json({ error: "No files provided." }, { status: 400 });
    }
    console.log(`[UPLOAD API] Found ${allFiles.length} file(s) to process.`); // 3. Check if files are found

    // --- File Validation (Simplified for clarity) ---
    for (const file of allFiles) {
      if (file.size > 5 * 1024 * 1024) { // 5MB
        console.error(`[UPLOAD API] Error: File ${file.name} is too large.`);
        return NextResponse.json({ error: `File ${file.name} exceeds 5MB limit.` }, { status: 400 });
      }
    }

    const uploadPromises = allFiles.map(async (file, index) => {
      const fileName = `listings/${decoded.uid}/${Date.now()}-${index}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      console.log(`[UPLOAD API] Preparing to upload: ${fileName}`); // 4. Check each file

      const buffer = Buffer.from(await file.arrayBuffer());
      const fileRef = bucket.file(fileName);
      
      console.log(`[UPLOAD API] Starting upload for ${fileName}...`);
      await fileRef.save(buffer, { metadata: { contentType: file.type } });
      console.log(`[UPLOAD API] Successfully saved ${fileName} to bucket.`); // 5. Check if save completes

      console.log(`[UPLOAD API] Making ${fileName} public...`);
      await fileRef.makePublic();
      console.log(`[UPLOAD API] Successfully made ${fileName} public.`); // 6. Check if makePublic completes

      return fileRef.publicUrl();
    });

    const urls = await Promise.all(uploadPromises);
    console.log("[UPLOAD API] All uploads completed successfully."); // 7. Check if all promises resolve

    return NextResponse.json({ urls, message: `${urls.length} file(s) uploaded successfully` });

  } catch (error) {
    console.error('[UPLOAD API] CRITICAL ERROR:', error); // 8. This will catch any error
    
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return NextResponse.json({ 
      error: "Failed to upload file(s).",
      details: errorMessage
    }, { status: 500 });
  }
};