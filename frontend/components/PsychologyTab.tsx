"use client";

import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import ChipSelect from "./ChipSelect";
import ToggleGroup from "./ToggleGroup";
import { api } from "@/lib/api";
import type { PsychologyLog } from "@/lib/types";

const MINDSET_OPTIONS = [
  "Confident",
  "Focused",
  "Calm",
  "Patient",
  "Disciplined",
  "Well-rested",
];

const EMOTION_OPTIONS = [
  "Anxious",
  "Greedy",
  "FOMO",
  "Fearful",
  "Frustrated",
  "Overconfident",
];

const CHECKLIST_OPTIONS = [
  "I have a defined trading plan",
  "I've set my entry, stop loss, and target",
  "Risk is within my max per trade",
  "I'm not revenge trading",
  "Market conditions suit my strategy",
  "I'm following my rules, not emotions",
];

const RR_OPTIONS = [
  { value: "1:1", label: "1:1" },
  { value: "1:2", label: "1:2" },
  { value: "1:3", label: "1:3" },
  { value: "1:4+", label: "1:4+" },
];

export default function PsychologyTab() {
  const [mindset, setMindset] = useState<string[]>([]);
  const [emotions, setEmotions] = useState<string[]>([]);
  const [checklist, setChecklist] = useState<string[]>([]);
  const [rr, setRr] = useState("1:2");
  const [logs, setLogs] = useState<PsychologyLog[]>([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  function toggle(
    list: string[],
    setList: (v: string[]) => void,
    option: string
  ) {
    setList(
      list.includes(option)
        ? list.filter((o) => o !== option)
        : [...list, option]
    );
  }

  async function loadLogs() {
    try {
      setLogs(await api.listPsychology(8));
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
        mindset,
        emotions,
        checklist,
        risk_reward_ratio: rr,
      });
      setMindset([]);
      setEmotions([]);
      setChecklist([]);
      setRr("1:2");
      setMsg("Mindset check-in saved ✓");
      await loadLogs();
      setTimeout(() => setMsg(""), 2500);
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  const readiness = checklist.length; // out of CHECKLIST_OPTIONS.length

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <form onSubmit={handleSubmit} className="card space-y-6 lg:col-span-2">
        <div>
          <h3 className="text-lg font-semibold">Pre-Trade Mindset Check-in</h3>
          <p className="text-sm text-slate-400">
            Tick what applies before you place a trade. No typing needed.
          </p>
        </div>

        <div>
          <label className="label">How do you feel right now?</label>
          <ChipSelect
            options={MINDSET_OPTIONS}
            selected={mindset}
            onToggle={(o) => toggle(mindset, setMindset, o)}
          />
        </div>

        <div>
          <label className="label">Emotions to watch out for</label>
          <ChipSelect
            options={EMOTION_OPTIONS}
            selected={emotions}
            onToggle={(o) => toggle(emotions, setEmotions, o)}
          />
        </div>

        <div>
          <label className="label">Pre-trade checklist</label>
          <ChipSelect
            options={CHECKLIST_OPTIONS}
            selected={checklist}
            onToggle={(o) => toggle(checklist, setChecklist, o)}
          />
          <p className="mt-2 text-xs text-slate-500">
            Readiness: {readiness}/{CHECKLIST_OPTIONS.length} checks complete
          </p>
        </div>

        <div>
          <label className="label">Planned Risk : Reward</label>
          <ToggleGroup value={rr} onChange={setRr} options={RR_OPTIONS} />
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? "Saving…" : "Save Check-in"}
          </button>
          {msg && <span className="text-xs text-emerald-400">{msg}</span>}
        </div>
      </form>

      <div className="card">
        <h3 className="mb-3 text-sm font-semibold text-slate-300">
          Recent Check-ins
        </h3>
        {logs.length === 0 ? (
          <p className="text-sm text-slate-500">No check-ins yet.</p>
        ) : (
          <ul className="space-y-3">
            {logs.map((l) => (
              <li
                key={l.id}
                className="rounded-lg border border-slate-800 bg-slate-900/60 p-3"
              >
                <div className="mb-1 text-[11px] text-slate-500">
                  {format(parseISO(l.created_at), "MMM d, h:mm a")}
                  {l.risk_reward_ratio && (
                    <span className="ml-2 rounded bg-slate-800 px-1.5 py-0.5 text-slate-300">
                      R:R {l.risk_reward_ratio}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[...l.mindset, ...l.emotions].map((tag) => (
                    <span
                      key={tag}
                      className="rounded bg-slate-800 px-1.5 py-0.5 text-[11px] text-slate-300"
                    >
                      {tag}
                    </span>
                  ))}
                  {l.checklist.length > 0 && (
                    <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-[11px] text-emerald-400">
                      {l.checklist.length}/{CHECKLIST_OPTIONS.length} checklist
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}