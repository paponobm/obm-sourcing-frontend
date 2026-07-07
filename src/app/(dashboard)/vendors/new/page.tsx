import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { VendorForm } from "@/components/forms/VendorForm";
import { RequireRole } from "@/components/shared/RequireRole";
import { ROUTES } from "@/constants/routes";
import { MANAGE_CATALOG_ROLES } from "@/constants/roles";

export default function NewVendorPage() {
  return (
    <RequireRole roles={MANAGE_CATALOG_ROLES}>
      <Breadcrumb items={[{ label: "ভেন্ডর তালিকা", href: ROUTES.vendors }, { label: "নতুন ভেন্ডর যোগ করুন" }]} />
      <h2 className="mb-5 font-serif text-[1.1875rem] text-teal-dark">নতুন ভেন্ডর যোগ করুন</h2>
      <VendorForm />
    </RequireRole>
  );
}
