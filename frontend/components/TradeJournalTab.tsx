"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Stats, Trade } from "@/lib/types";
import Calendar from "./Calendar";
import StatsSidebar from "./StatsSidebar";
import TradeFormModal from "./TradeFormModal";
import DayTradesModal from "./DayTradesModal";

export default function TradeJournalTab() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [trades, setTrades] = useState<Trade[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<Trade[]>([]);

  const [formOpen, setFormOpen] = useState(false);
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);

  const [dayOpen, setDayOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTrades, setSelectedTrades] = useState<Trade[]>([]);

  const loadData = useCallback(async () => {
    const month = currentMonth.getMonth() + 1;
    const year = currentMonth.getFullYear();
    const [monthTrades, s, r] = await Promise.all([
      api.listTrades(month, year),
      api.stats(),
      api.recentTrades(6),
    ]);
    setTrades(monthTrades);
    setStats(s);
    setRecent(r);
    return monthTrades;
  }, [currentMonth]);

  useEffect(() => {
    loadData().catch(() => {});
  }, [loadData]);

  function openAdd() {
    setEditingTrade(null);
    setFormOpen(true);
  }

  function openEdit(trade: Trade) {
    setEditingTrade(trade);
    setDayOpen(false); // close the day list so the form is front and center
    setFormOpen(true);
  }

  function handleDayClick(date: Date, dayTrades: Trade[]) {
    setSelectedDate(date);
    setSelectedTrades(dayTrades);
    setDayOpen(true);
  }

  async function handleDelete(id: number) {
    await api.deleteTrade(id);
    const updated = await loadData();
    if (selectedDate) {
      setSelectedTrades(
        updated.filter(
          (t) =>
            new Date(t.trade_date).toDateString() ===
            selectedDate.toDateString()
        )
      );
    }
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Trade Journal</h2>
          <p className="text-sm text-slate-400">
            Your calendar, metrics, and recent activity.
          </p>
        </div>
        <button className="btn-primary" onClick={openAdd}>
          + Add Trade
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Calendar
            currentMonth={currentMonth}
            trades={trades}
            onMonthChange={setCurrentMonth}
            onDayClick={handleDayClick}
          />
        </div>
        <div className="lg:col-span-1">
          <div className="card">
            <StatsSidebar stats={stats} recent={recent} />
          </div>
        </div>
      </div>

      <TradeFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={loadData}
        trade={editingTrade}
      />

      <DayTradesModal
        open={dayOpen}
        onClose={() => setDayOpen(false)}
        date={selectedDate}
        trades={selectedTrades}
        onEdit={openEdit}
        onDelete={handleDelete}
      />
    </>
  );
}