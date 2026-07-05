export function FormGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-3.5 p-[18px] sm:grid-cols-2">{children}</div>;
}
