// src/app/api/admin/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/firebase/firebaseAdmin";
import { getAuth } from "firebase-admin/auth";

// Helper: Check if user is admin
const checkAdminAccess = async (token: string) => {
  const decoded = await getAuth().verifyIdToken(token);
  const userId = decoded.uid;
  
  const userDoc = await db.collection("users").doc(userId).get();
  const userData = userDoc.data();
  
  if (!userData || userData.role !== "admin") {
    throw new Error("Admin access required");
  }
  
  return { userId, userData };
};

// GET - Get all users (for admin)
export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await checkAdminAccess(token);

    const usersSnapshot = await db.collection("users").get();
    const users = usersSnapshot.docs.map(doc => ({
      id: doc.id,
      uid: doc.data().uid,
      email: doc.data().email,
      fullName: doc.data().fullName,
      role: doc.data().role,
      createdAt: doc.data().createdAt,
    }));

    return NextResponse.json(users);
  } catch (error: any) {
    console.error("Get users error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch users" },
      { status: error.message === "Admin access required" ? 403 : 500 }
    );
  }
}