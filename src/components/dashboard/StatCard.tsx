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
    <div className="flex-1 rounded-md border border-line bg-white px-3.5 py-3 sm:px-4 sm:py-3.5 lg:px-[18px] lg:py-4">
      <div className="mb-1 text-[0.625rem] font-semibold text-gray sm:mb-1.5 sm:text-xs lg:text-[0.71875rem]">
        {label}
      </div>
      <div className="font-mono text-lg font-semibold text-teal-dark sm:text-xl lg:text-2xl">
        {value}
      </div>
      {delta && (
        <div
          className={
            "mt-1 text-[0.625rem] sm:text-[0.6875rem] " +
            (deltaVariant === "brass" ? "text-brass" : "text-green")
          }
        >
          {delta}
        </div>
      )}
    </div>
  );
}
