"use client";

import { useEffect, useMemo, useState } from "react";
import Modal from "./Modal";
import ToggleGroup from "./ToggleGroup";
import { api } from "@/lib/api";
import type { Trade, TradeInput, TradeType } from "@/lib/types";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  /** When provided, the modal edits this trade instead of creating a new one. */
  trade?: Trade | null;
}

const emptyForm = {
  symbol: "",
  buy_price: "",
  sell_price: "",
  stop_loss: "",
  quantity: "",
  notes: "",
};

// Mirrors the backend: no sell price => OPEN; otherwise WIN/LOSS from P&L.
function computeResult(buy: string, sell: string, qty: string) {
  const b = parseFloat(buy);
  const s = parseFloat(sell);
  const q = parseFloat(qty);
  if (sell === "" || isNaN(s) || isNaN(b) || isNaN(q)) {
    return { status: "OPEN" as const, pnl: null as number | null };
  }
  const pnl = Math.round((s - b) * q * 100) / 100;
  return { status: (pnl >= 0 ? "WIN" : "LOSS") as "WIN" | "LOSS", pnl };
}

export default function TradeFormModal({ open, onClose, onSaved, trade }: Props) {
  const isEdit = Boolean(trade);
  const [form, setForm] = useState({ ...emptyForm });
  const [tradeType, setTradeType] = useState<TradeType>("BUY");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Prefill when opening in edit mode; reset when opening to add.
  useEffect(() => {
    if (!open) return;
    if (trade) {
      setForm({
        symbol: trade.symbol,
        buy_price: String(trade.buy_price),
        sell_price: trade.sell_price != null ? String(trade.sell_price) : "",
        stop_loss: trade.stop_loss != null ? String(trade.stop_loss) : "",
        quantity: String(trade.quantity),
        notes: trade.notes ?? "",
      });
      setTradeType(trade.trade_type);
    } else {
      setForm({ ...emptyForm });
      setTradeType("BUY");
    }
    setError("");
  }, [open, trade]);

  const result = useMemo(
    () => computeResult(form.buy_price, form.sell_price, form.quantity),
    [form.buy_price, form.sell_price, form.quantity]
  );

  function update(field: keyof typeof emptyForm, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!form.symbol || !form.buy_price || !form.quantity) {
      setError("Symbol, buy price, and quantity are required.");
      return;
    }

    const payload: TradeInput = {
      symbol: form.symbol,
      trade_type: tradeType,
      buy_price: parseFloat(form.buy_price),
      sell_price: form.sell_price ? parseFloat(form.sell_price) : null,
      stop_loss: form.stop_loss ? parseFloat(form.stop_loss) : null,
      quantity: parseFloat(form.quantity),
      notes: form.notes || null,
    };

    setSaving(true);
    try {
      if (trade) {
        await api.updateTrade(trade.id, payload);
      } else {
        await api.createTrade(payload);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save trade");
    } finally {
      setSaving(false);
    }
  }

  const badge = {
    OPEN: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    WIN: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    LOSS: "bg-red-500/15 text-red-400 border-red-500/30",
  }[result.status];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Trade" : "Add New Trade"}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {isEdit && result.status !== "OPEN" && trade?.status === "OPEN" && (
          <p className="rounded-lg bg-emerald-500/10 px-3 py-2 text-xs text-emerald-400">
            Adding a sell price will close this position as {result.status}.
          </p>
        )}

        <div>
          <label className="label">Symbol</label>
          <input
            className="input uppercase"
            value={form.symbol}
            onChange={(e) => update("symbol", e.target.value)}
            placeholder="AAPL"
          />
        </div>

        <div>
          <label className="label">Trade Type</label>
          <ToggleGroup<TradeType>
            value={tradeType}
            onChange={setTradeType}
            options={[
              { value: "BUY", label: "BUY (Long)" },
              { value: "SELL", label: "SELL (Short)" },
            ]}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Buy Price</label>
            <input
              type="number"
              step="any"
              className="input"
              value={form.buy_price}
              onChange={(e) => update("buy_price", e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="label">Sell Price</label>
            <input
              type="number"
              step="any"
              className="input"
              value={form.sell_price}
              onChange={(e) => update("sell_price", e.target.value)}
              placeholder="leave blank if still open"
            />
          </div>
          <div>
            <label className="label">Stop Loss (SL)</label>
            <input
              type="number"
              step="any"
              className="input"
              value={form.stop_loss}
              onChange={(e) => update("stop_loss", e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="label">Quantity</label>
            <input
              type="number"
              step="any"
              className="input"
              value={form.quantity}
              onChange={(e) => update("quantity", e.target.value)}
              placeholder="0"
            />
          </div>
        </div>

        {/* Auto-calculated result preview (no manual status selector). */}
        <div
          className={`flex items-center justify-between rounded-lg border px-4 py-3 ${badge}`}
        >
          <div>
            <div className="text-[10px] uppercase tracking-wide opacity-70">
              Result (auto)
            </div>
            <div className="text-lg font-bold">{result.status}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wide opacity-70">
              P&amp;L
            </div>
            <div className="text-lg font-bold">
              {result.pnl == null
                ? "—"
                : `${result.pnl >= 0 ? "+" : ""}${result.pnl.toFixed(2)}`}
            </div>
          </div>
        </div>

        <div>
          <label className="label">Notes</label>
          <textarea
            className="input min-h-[80px] resize-y"
            value={form.notes}
            onChange={(e) => update("notes", e.target.value)}
            placeholder="Setup, reasoning, what you'd do differently…"
          />
        </div>

        {error && (
          <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-3 pt-1">
          <button type="button" className="btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? "Saving…" : isEdit ? "Update Trade" : "Save Trade"}
          </button>
        </div>
      </form>
    </Modal>
  );
}