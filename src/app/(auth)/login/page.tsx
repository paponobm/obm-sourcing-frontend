import { LoginForm } from "@/components/forms/LoginForm";

export default function LoginPage() {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-teal-dark px-6"
      style={{
        backgroundImage:
          "radial-gradient(circle at 20% 20%, rgba(173,124,44,.10), transparent 40%)",
      }}
    >
      <div className="w-full max-w-[380px] rounded-md bg-paper px-8 py-9">
        <div className="mb-4 flex h-[42px] w-[42px] items-center justify-center rounded-lg bg-teal font-serif text-xl text-brass-soft">
          OS
        </div>
        <h2 className="m-0 mb-1 font-serif text-[1.3125rem] text-teal-dark">সাইন ইন করুন</h2>
        <p className="mb-6 text-[0.78125rem] text-gray">
          Online Burmese Market — সোর্সিং প্যানেল
        </p>

        <LoginForm />

        <div className="mt-[18px] rounded border border-[#E7D4A8] bg-brass-soft px-[11px] py-[9px] text-[0.71875rem] leading-[1.5] text-gray">
          🔒 এই প্যানেলে শুধুমাত্র অনুমোদিত স্টাফদের অ্যাক্সেস আছে। সব লগইন রেকর্ড হয়।
        </div>
      </div>
    </div>
  );
}
