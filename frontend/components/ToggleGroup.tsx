"use client";

interface Option<T extends string> {
  value: T;
  label: string;
  /** optional accent when active: brand (default), win, loss, open */
  accent?: "brand" | "win" | "loss" | "open";
}

interface ToggleGroupProps<T extends string> {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

const ACTIVE: Record<string, string> = {
  brand: "bg-brand text-white border-brand",
  win: "bg-emerald-500 text-white border-emerald-500",
  loss: "bg-red-500 text-white border-red-500",
  open: "bg-amber-500 text-white border-amber-500",
};

export default function ToggleGroup<T extends string>({
  options,
  value,
  onChange,
  className = "",
}: ToggleGroupProps<T>) {
  return (
    <div
      className={`inline-flex w-full overflow-hidden rounded-lg border border-slate-700 ${className}`}
    >
      {options.map((opt, i) => {
        const active = opt.value === value;
        const accent = ACTIVE[opt.accent ?? "brand"];
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={[
              "flex-1 px-3 py-2 text-sm font-medium transition",
              i > 0 ? "border-l border-slate-700" : "",
              active ? accent : "bg-slate-900 text-slate-300 hover:bg-slate-800",
            ].join(" ")}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}