"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { PsychologyLog } from "@/lib/types";

const MINDSETS = ["Confident", "Focused", "Neutral", "Uncertain", "Distracted"];
const EMOTIONS = ["Calm", "Excited", "Anxious", "Fearful", "Greedy", "Frustrated"];

export default function PsychologyForm() {
  const [symbol, setSymbol] = useState("");
  const [mindset, setMindset] = useState(MINDSETS[0]);
  const [emotion, setEmotion] = useState(EMOTIONS[0]);
  const [rr, setRr] = useState("1:2");
  const [notes, setNotes] = useState("");
  const [logs, setLogs] = useState<PsychologyLog[]>([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  async function loadLogs() {
    try {
      setLogs(await api.listPsychology(5));
    } catch {
      /* ignore */
    }
  }

  useEffect(() => {
    loadLogs();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    try {
      await api.createPsychology({
        symbol: symbol || null,
        mindset: [mindset], // <--- Yahan array [] brackets lagane hain
        emotional_state: emotion,
        risk_reward_ratio: rr,
        notes: notes || null,
      });
      setSymbol("");
      setNotes("");
      setMsg("Saved ✓");
      await loadLogs();
      setTimeout(() => setMsg(""), 2000);
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card">
      <h3 className="mb-4 text-sm font-semibold text-slate-300">
        Pre-Trade Psychology
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Symbol (optional)</label>
            <input
              className="input uppercase"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              placeholder="AAPL"
            />
          </div>
          <div>
            <label className="label">Risk : Reward</label>
            <input
              className="input"
              value={rr}
              onChange={(e) => setRr(e.target.value)}
              placeholder="1:3"
            />
          </div>
          <div>
            <label className="label">Mindset</label>
            <select
              className="input"
              value={mindset}
              onChange={(e) => setMindset(e.target.value)}
            >
              {MINDSETS.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Emotional State</label>
            <select
              className="input"
              value={emotion}
              onChange={(e) => setEmotion(e.target.value)}
            >
              {EMOTIONS.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="label">Notes</label>
          <textarea
            className="input min-h-[60px] resize-y"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Plan, conviction level, what would invalidate the setup…"
          />
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? "Saving…" : "Log Mindset"}
          </button>
          {msg && <span className="text-xs text-emerald-400">{msg}</span>}
        </div>
      </form>

      {logs.length > 0 && (
        <div className="mt-5 border-t border-slate-800 pt-4">
          <div className="mb-2 text-xs uppercase tracking-wide text-slate-500">
            Recent entries
          </div>
          <ul className="space-y-2">
            {logs.map((l) => (
              <li
                key={l.id}
                className="flex flex-wrap items-center gap-2 text-xs text-slate-400"
              >
                {l.symbol && (
                  <span className="font-semibold text-slate-200">
                    {l.symbol}
                  </span>
                )}
                <span className="rounded bg-slate-800 px-1.5 py-0.5">
                  {l.mindset}
                </span>
                <span className="rounded bg-slate-800 px-1.5 py-0.5">
                  {l.emotional_state}
                </span>
                {l.risk_reward_ratio && (
                  <span className="rounded bg-slate-800 px-1.5 py-0.5">
                    R:R {l.risk_reward_ratio}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
