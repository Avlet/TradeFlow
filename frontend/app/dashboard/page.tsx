"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import InstructionsTab from "@/components/InstructionsTab";
import PsychologyTab from "@/components/PsychologyTab";
import TradeJournalTab from "@/components/TradeJournalTab";

type TabKey = "instructions" | "psychology" | "journal";

const TABS: { key: TabKey; label: string; icon: ReactNode }[] = [
  {
    key: "instructions",
    label: "Instructions",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
  },
  {
    key: "psychology",
    label: "Trade Psychology",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
        <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
      </svg>
    ),
  },
  {
    key: "journal",
    label: "Trade Journal",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    ),
  },
];

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<TabKey>("journal");

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-slate-400">Loading…</div>
      </main>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-6">
        {/* Modern pill tab bar */}
        <div className="mb-8 flex justify-center">
          <div className="inline-flex gap-1 rounded-full border border-slate-800 bg-slate-900/70 p-1 shadow-lg shadow-black/20 backdrop-blur">
            {TABS.map((t) => {
              const active = tab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={[
                    "flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all sm:px-5",
                    active
                      ? "bg-brand text-white shadow-md shadow-brand/30"
                      : "text-slate-400 hover:bg-slate-800/70 hover:text-slate-200",
                  ].join(" ")}
                >
                  {t.icon}
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab content */}
        {tab === "instructions" && <InstructionsTab />}
        {tab === "psychology" && <PsychologyTab />}
        {tab === "journal" && <TradeJournalTab />}
      </main>
    </div>
  );
}