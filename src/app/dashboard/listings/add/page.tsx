// src/app/dashboard/listings/add/page.tsx
import DashboardLayout from "@components/dashboard/DashboardLayout";
import ListingAddClient from "./ListingAddClient";

export const dynamic = "force-dynamic"; // ⬅️ disable static prerendering

export default function Page() {
  return (
    <DashboardLayout>
      <ListingAddClient />
    </DashboardLayout>
  );
}
