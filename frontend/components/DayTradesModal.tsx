"use client";

import { format } from "date-fns";
import Modal from "./Modal";
import type { Trade } from "@/lib/types";

interface Props {
  open: boolean;
  onClose: () => void;
  date: Date | null;
  trades: Trade[];
  onEdit: (trade: Trade) => void;
  onDelete: (id: number) => void;
}

function StatusBadge({ status }: { status: Trade["status"] }) {
  const styles: Record<string, string> = {
    WIN: "bg-emerald-500/15 text-emerald-400",
    LOSS: "bg-red-500/15 text-red-400",
    OPEN: "bg-amber-500/15 text-amber-400",
  };
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  );
}

export default function DayTradesModal({
  open,
  onClose,
  date,
  trades,
  onEdit,
  onDelete,
}: Props) {
  const total = trades.reduce((s, t) => s + t.pnl, 0);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={date ? format(date, "EEEE, MMMM d, yyyy") : "Trades"}
      maxWidth="max-w-2xl"
    >
      <div className="mb-4 flex items-center justify-between text-sm">
        <span className="text-slate-400">
          {trades.length} trade{trades.length !== 1 ? "s" : ""}
        </span>
        <span
          className={`font-semibold ${
            total > 0
              ? "text-emerald-400"
              : total < 0
              ? "text-red-400"
              : "text-slate-300"
          }`}
        >
          Net P&L: {total >= 0 ? "+" : ""}
          {total.toFixed(2)}
        </span>
      </div>

      <div className="space-y-3">
        {trades.map((t) => (
          <div
            key={t.id}
            className="rounded-xl border border-slate-800 bg-slate-900/60 p-4"
          >
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{t.symbol}</span>
                <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-medium text-slate-400">
                  {t.trade_type}
                </span>
                <StatusBadge status={t.status} />
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onEdit(t)}
                  className="text-xs font-medium text-brand transition hover:underline"
                >
                  {t.status === "OPEN" ? "Close / Edit" : "Edit"}
                </button>
                <button
                  onClick={() => onDelete(t.id)}
                  className="text-xs text-slate-500 transition hover:text-red-400"
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-x-4 gap-y-2 text-sm sm:grid-cols-5">
              <Field label="Buy" value={`$${t.buy_price.toFixed(2)}`} />
              <Field
                label="Sell"
                value={t.sell_price != null ? `$${t.sell_price.toFixed(2)}` : "—"}
              />
              <Field
                label="SL"
                value={t.stop_loss != null ? `$${t.stop_loss.toFixed(2)}` : "—"}
              />
              <Field label="Qty" value={String(t.quantity)} />
              <Field
                label="P&L"
                value={`${t.pnl >= 0 ? "+" : ""}${t.pnl.toFixed(2)}`}
                highlight={t.pnl > 0 ? "up" : t.pnl < 0 ? "down" : undefined}
              />
            </div>

            {t.notes && (
              <p className="mt-3 rounded-lg bg-slate-950/50 px-3 py-2 text-sm text-slate-300">
                {t.notes}
              </p>
            )}
          </div>
        ))}
      </div>
    </Modal>
  );
}

function Field({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: "up" | "down";
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div
        className={`font-medium ${
          highlight === "up"
            ? "text-emerald-400"
            : highlight === "down"
            ? "text-red-400"
            : "text-slate-200"
        }`}
      >
        {value}
      </div>
    </div>
  );
}