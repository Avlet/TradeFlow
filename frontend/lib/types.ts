export interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
}

export type TradeStatus = "WIN" | "LOSS" | "OPEN";
export type TradeType = "BUY" | "SELL";

export interface Trade {
  id: number;
  symbol: string;
  trade_type: TradeType;
  buy_price: number;
  sell_price: number | null;
  stop_loss: number | null;
  quantity: number;
  pnl: number;
  status: TradeStatus;
  notes: string | null;
  trade_date: string;
  created_at: string;
}

export interface TradeInput {
  symbol: string;
  trade_type: TradeType;
  buy_price: number;
  sell_price?: number | null;
  stop_loss?: number | null;
  quantity: number;
  notes?: string | null;
}

export interface Stats {
  total_trades: number;
  win_rate: number;
  net_pnl: number;
  wins: number;
  losses: number;
  open_trades: number;
}

export interface PsychologyLog {
  id: number;
  mindset: string[];
  emotions: string[];
  checklist: string[];
  risk_reward_ratio: string | null;
  created_at: string;
}

export interface PsychologyInput {
  mindset: string[];
  emotions: string[];
  checklist: string[];
  risk_reward_ratio?: string | null;
}

export interface ProfileUpdate {
  username?: string;
  email?: string;
  current_password?: string;
  new_password?: string;
}