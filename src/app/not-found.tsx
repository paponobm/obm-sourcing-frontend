import Link from "next/link";
import { ROUTES } from "@/constants/routes";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-teal-dark px-6 text-center">
      <span className="font-mono text-sm tracking-[0.14em] text-brass-soft/70 uppercase">
        404
      </span>
      <h1 className="font-serif text-3xl text-white">পাতাটি খুঁজে পাওয়া যায়নি</h1>
      <p className="max-w-sm text-sm text-[#BFD6D8]">
        আপনি যে পাতাটি খুঁজছেন সেটি সরানো হয়েছে অথবা এটি বিদ্যমান নেই।
      </p>
      <Link
        href={ROUTES.dashboard}
        className="mt-3 inline-block rounded-[4px] bg-brass px-5 py-2.5 text-sm font-semibold text-white"
      >
        ড্যাশবোর্ডে ফিরে যান
      </Link>
    </div>
  );
}
