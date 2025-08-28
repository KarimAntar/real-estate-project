import { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import fs from "fs";
import path from "path";

// Disable default body parser
export const config = {
  api: { bodyParser: false },
};

const uploadDir = path.join(process.cwd(), "public/uploads");

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const form = formidable({ multiples: true, uploadDir, keepExtensions: true });

  form.parse(req, (err, fields, files) => {
    if (err) {
      console.error("Upload error:", err);
      return res.status(500).json({ message: "Failed to upload files" });
    }

    const uploadedFiles = Array.isArray(files.file)
      ? files.file
      : [files.file];

    const urls: string[] = uploadedFiles.map((file: any) => {
      const fileName = path.basename(file.filepath || file.filepath); // keep filename
      return `/uploads/${fileName}`; // public URL
    });

    res.status(200).json({ urls });
  });
}
