"use client";

interface ChipSelectProps {
  options: string[];
  selected: string[];
  onToggle: (option: string) => void;
}

export default function ChipSelect({
  options,
  selected,
  onToggle,
}: ChipSelectProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = selected.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onToggle(opt)}
            className={[
              "flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition",
              active
                ? "border-brand bg-brand/15 text-brand"
                : "border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800",
            ].join(" ")}
          >
            <span
              className={[
                "flex h-4 w-4 items-center justify-center rounded border text-[10px]",
                active
                  ? "border-brand bg-brand text-white"
                  : "border-slate-600",
              ].join(" ")}
            >
              {active ? "✓" : ""}
            </span>
            {opt}
          </button>
        );
      })}
    </div>
  );
}