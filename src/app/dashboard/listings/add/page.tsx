// src/app/dashboard/listings/add/page.tsx
import DashboardLayout from "@components/dashboard/DashboardLayout";
import ProtectedRoute from "@components/dashboard/ProtectedRoute";
import ListingAddClient from "./ListingAddClient";

export const dynamic = "force-dynamic"; // ⬅️ disable static prerendering

export default function Page() {
  return (
    <ProtectedRoute requireVerifiedEmail>
    <DashboardLayout>
      <ListingAddClient />
    </DashboardLayout>
    </ProtectedRoute>
  );
}
