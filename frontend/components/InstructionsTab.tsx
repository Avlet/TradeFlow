"use client";

const SECTIONS = [
  {
    title: "Getting started",
    items: [
      "Log every trade — winners and losers. A journal is only useful when it's complete.",
      "Before entering a position, open the Trade Psychology tab and complete your mindset check-in.",
      "Record the trade in the Trade Journal tab as soon as it's placed while details are fresh.",
    ],
  },
  {
    title: "Recording a trade",
    items: [
      "Enter the Symbol, choose BUY (long) or SELL (short), and fill in your Buy Price and Quantity.",
      "Always set a Stop Loss (SL) — it documents the risk you actually accepted.",
      "Leave the Sell Price blank and set status to OPEN for live positions; add the sell price and mark WIN/LOSS when you close.",
      "The trade date is captured automatically, so trades always land on the correct calendar day.",
    ],
  },
  {
    title: "Reviewing performance",
    items: [
      "Use the calendar to spot patterns — clusters of red days, revenge-trading streaks, or your most profitable sessions.",
      "Click any highlighted date to review every trade taken that day, including P&L and notes.",
      "Check Win Rate and Net P&L weekly, not trade-by-trade. Single trades are noise; the distribution is the signal.",
    ],
  },
  {
    title: "Journaling well",
    items: [
      "Write notes about the setup and your reasoning, not just the outcome.",
      "Be honest about emotions — the Psychology tab exists to surface tilt before it costs you.",
      "Revisit your losing trades monthly and tag recurring mistakes. Fixing one repeated error beats finding a new strategy.",
    ],
  },
];

export default function InstructionsTab() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="card">
        <h2 className="text-xl font-semibold">How to use TradeFlow</h2>
        <p className="mt-1 text-sm text-slate-400">
          A quick guide to journaling your trades and psychology effectively.
        </p>
      </div>

      {SECTIONS.map((section) => (
        <div key={section.title} className="card">
          <h3 className="mb-3 text-base font-semibold text-brand">
            {section.title}
          </h3>
          <ul className="space-y-2">
            {section.items.map((item, i) => (
              <li key={i} className="flex gap-3 text-sm text-slate-300">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}