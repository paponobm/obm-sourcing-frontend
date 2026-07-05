import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { MobileSidebar } from "./MobileSidebar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-3 border-b border-line bg-white px-4 py-3 md:hidden">
          <MobileSidebar />
          <span className="font-serif text-[15px] text-teal-dark">OBM সোর্সিং</span>
        </div>
        <main className="flex-1 overflow-x-hidden bg-paper px-4 py-4 md:px-[26px] md:py-[22px]">
          {children}
        </main>
      </div>
    </div>
  );
}
