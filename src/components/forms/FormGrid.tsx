export function FormGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-3 p-3.5 sm:grid-cols-2 sm:gap-3.5 sm:p-4 lg:p-[18px]">
      {children}
    </div>
  );
}
