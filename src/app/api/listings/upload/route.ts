import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";

export const POST = async (request: NextRequest) => {
  try {
    const data = await request.formData();
    const file = data.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = path.join(uploadsDir, fileName);

    fs.writeFileSync(filePath, buffer);

    const url = `/uploads/${fileName}`;

    return NextResponse.json({ urls: [url] });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
};
