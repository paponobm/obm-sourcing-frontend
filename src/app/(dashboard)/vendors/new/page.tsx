import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { VendorForm } from "@/components/forms/VendorForm";
import { ROUTES } from "@/constants/routes";

export default function NewVendorPage() {
  return (
    <>
      <Breadcrumb items={[{ label: "ভেন্ডর তালিকা", href: ROUTES.vendors }, { label: "নতুন ভেন্ডর যোগ করুন" }]} />
      <h2 className="mb-5 font-serif text-[19px] text-teal-dark">নতুন ভেন্ডর যোগ করুন</h2>
      <VendorForm />
    </>
  );
}
