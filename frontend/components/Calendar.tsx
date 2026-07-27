"use client";

import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import type { Trade } from "@/lib/types";

interface CalendarProps {
  currentMonth: Date;
  trades: Trade[];
  onMonthChange: (date: Date) => void;
  onDayClick: (date: Date, trades: Trade[]) => void;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function tradesForDay(trades: Trade[], day: Date): Trade[] {
  return trades.filter((t) => isSameDay(parseISO(t.trade_date), day));
}

export default function Calendar({
  currentMonth,
  trades,
  onMonthChange,
  onDayClick,
}: CalendarProps) {
  const monthStart = startOfMonth(currentMonth);
  const gridStart = startOfWeek(monthStart);
  const gridEnd = endOfWeek(endOfMonth(currentMonth));
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  return (
    <div className="card">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {format(currentMonth, "MMMM yyyy")}
        </h2>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onMonthChange(subMonths(currentMonth, 1))}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-slate-100"
            aria-label="Previous month"
          >
            ‹
          </button>
          <button
            onClick={() => onMonthChange(new Date())}
            className="rounded-lg px-2 py-1 text-xs text-slate-400 transition hover:bg-slate-800 hover:text-slate-100"
          >
            Today
          </button>
          <button
            onClick={() => onMonthChange(addMonths(currentMonth, 1))}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-slate-100"
            aria-label="Next month"
          >
            ›
          </button>
        </div>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-500">
        {WEEKDAYS.map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const dayTrades = tradesForDay(trades, day);
          const inMonth = isSameMonth(day, currentMonth);
          const netPnl = dayTrades.reduce((sum, t) => sum + t.pnl, 0);
          const hasTrades = dayTrades.length > 0;

          let pnlColor = "";
          if (hasTrades) {
            pnlColor =
              netPnl > 0
                ? "border-emerald-500/50 bg-emerald-500/10"
                : netPnl < 0
                ? "border-red-500/50 bg-red-500/10"
                : "border-slate-600 bg-slate-800/40";
          }

          return (
            <button
              key={day.toISOString()}
              onClick={() => hasTrades && onDayClick(day, dayTrades)}
              disabled={!hasTrades}
              className={[
                "relative flex min-h-[58px] flex-col items-start justify-start rounded-lg border p-1.5 text-left transition",
                inMonth ? "" : "opacity-40",
                hasTrades
                  ? `cursor-pointer hover:brightness-125 ${pnlColor}`
                  : "cursor-default border-transparent",
                isToday(day) ? "ring-1 ring-brand" : "",
              ].join(" ")}
            >
              <span
                className={`text-xs font-medium ${
                  inMonth ? "text-slate-200" : "text-slate-500"
                }`}
              >
                {format(day, "d")}
              </span>

              {hasTrades && (
                <div className="mt-auto w-full">
                  <span className="inline-flex items-center rounded-full bg-slate-950/60 px-1.5 py-0.5 text-[10px] font-semibold text-slate-300">
                    {dayTrades.length} trade
                    {dayTrades.length > 1 ? "s" : ""}
                  </span>
                  <div
                    className={`mt-0.5 truncate text-[10px] font-semibold ${
                      netPnl > 0
                        ? "text-emerald-400"
                        : netPnl < 0
                        ? "text-red-400"
                        : "text-slate-400"
                    }`}
                  >
                    {netPnl >= 0 ? "+" : ""}
                    {netPnl.toFixed(2)}
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
