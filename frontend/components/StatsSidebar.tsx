"use client";

import { format, parseISO } from "date-fns";
import type { Stats, Trade } from "@/lib/types";

interface Props {
  stats: Stats | null;
  recent: Trade[];
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "up" | "down";
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
      <div className="text-xs uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div
        className={`mt-1 text-2xl font-bold ${
          accent === "up"
            ? "text-emerald-400"
            : accent === "down"
            ? "text-red-400"
            : "text-slate-100"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

export default function StatsSidebar({ stats, recent }: Props) {
  const net = stats?.net_pnl ?? 0;

  return (
    <aside className="space-y-6">
      <div>
        <h3 className="mb-3 text-sm font-semibold text-slate-300">
          Performance
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="Total Trades"
            value={String(stats?.total_trades ?? 0)}
          />
          <StatCard
            label="Win Rate"
            value={`${stats?.win_rate ?? 0}%`}
          />
          <StatCard
            label="Net P&L"
            value={`${net >= 0 ? "+" : ""}${net.toFixed(2)}`}
            accent={net > 0 ? "up" : net < 0 ? "down" : undefined}
          />
          <StatCard
            label="Open"
            value={String(stats?.open_trades ?? 0)}
          />
        </div>
        {stats && (
          <p className="mt-2 text-xs text-slate-500">
            {stats.wins}W / {stats.losses}L
          </p>
        )}
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-slate-300">
          Recent Trades
        </h3>
        {recent.length === 0 ? (
          <p className="text-sm text-slate-500">No trades yet.</p>
        ) : (
          <ul className="space-y-2">
            {recent.map((t) => (
              <li
                key={t.id}
                className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2"
              >
                <div>
                  <div className="text-sm font-semibold">{t.symbol}</div>
                  <div className="text-[11px] text-slate-500">
                    {format(parseISO(t.trade_date), "MMM d")}
                  </div>
                </div>
                <div
                  className={`text-sm font-semibold ${
                    t.status === "WIN"
                      ? "text-emerald-400"
                      : t.status === "LOSS"
                      ? "text-red-400"
                      : "text-amber-400"
                  }`}
                >
                  {t.status === "OPEN"
                    ? "OPEN"
                    : `${t.pnl >= 0 ? "+" : ""}${t.pnl.toFixed(2)}`}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
