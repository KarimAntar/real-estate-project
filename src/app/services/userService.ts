// src/services/userService.ts - Updated to return ListingWithStatus[]

import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  deleteDoc, 
  getDoc,
  orderBy 
} from "firebase/firestore";
import { db } from "@/app/firebase/firebaseConfig";
import { ListingWithStatus } from "@/types/notification";

export const getListingsByUser = async (uid: string): Promise<ListingWithStatus[]> => {
  try {
    const q = query(
      collection(db, "listings"), 
      where("uid", "==", uid),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    
    const listings: ListingWithStatus[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      docId: doc.id,
      ...doc.data(),
      // Ensure status property exists, default to 'pending' if not present
      status: doc.data().status || 'pending'
    })) as ListingWithStatus[];
    
    return listings;
  } catch (error) {
    console.error("Error fetching user listings:", error);
    throw new Error("Failed to fetch listings");
  }
};

export const getAllListingsWithUsers = async (): Promise<ListingWithStatus[]> => {
  try {
    const q = query(collection(db, "listings"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    
    const listingsWithUsers: ListingWithStatus[] = [];
    
    for (const docSnap of snapshot.docs) {
      const listingData = docSnap.data();
      
      // Get user data
      let userName = "Unknown User";
      let userEmail = "unknown@email.com";
      
      if (listingData.uid) {
        try {
          const userDoc = await getDoc(doc(db, "users", listingData.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            userName = userData.fullName || "Unknown User";
            userEmail = userData.email || "unknown@email.com";
          }
        } catch (userError) {
          console.error("Error fetching user data:", userError);
        }
      }
      
      listingsWithUsers.push({
        id: docSnap.id,
        docId: docSnap.id,
        ...listingData,
        userName,
        userEmail,
        // Ensure status property exists, default to 'pending' if not present
        status: listingData.status || 'pending'
      } as ListingWithStatus);
    }
    
    return listingsWithUsers;
  } catch (error) {
    console.error("Error fetching all listings:", error);
    throw new Error("Failed to fetch listings");
  }
};

export const deleteListing = async (docId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, "listings", docId));
  } catch (error) {
    console.error("Error deleting listing:", error);
    throw new Error("Failed to delete listing");
  }
};

