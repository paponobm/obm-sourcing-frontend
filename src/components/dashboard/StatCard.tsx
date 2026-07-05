export function StatCard({
  label,
  value,
  delta,
  deltaVariant = "success",
}: {
  label: string;
  value: string;
  delta?: string;
  deltaVariant?: "success" | "brass";
}) {
  return (
    <div className="flex-1 rounded-md border border-line bg-white px-[18px] py-4">
      <div className="mb-1.5 text-[11.5px] font-semibold text-gray">{label}</div>
      <div className="font-mono text-2xl font-semibold text-teal-dark">{value}</div>
      {delta && (
        <div
          className={
            "mt-1 text-[11px] " + (deltaVariant === "brass" ? "text-brass" : "text-green")
          }
        >
          {delta}
        </div>
      )}
    </div>
  );
}
