import DashboardLayout from "@components/dashboard/DashboardLayout";
import AddEditListingForm from "./AddEditListingForm";

export default function Page() {
  return (
    <DashboardLayout>
      <AddEditListingForm />
    </DashboardLayout>
  );
}