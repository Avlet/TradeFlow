import type {
  ProfileUpdate,
  PsychologyInput,
  PsychologyLog,
  Stats,
  Trade,
  TradeInput,
  User,
} from "./types";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    // Send/receive the httpOnly auth cookie on every request.
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    },
  });

  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      if (data?.detail) detail = data.detail;
    } catch {
      /* ignore non-JSON error bodies */
    }
    throw new Error(detail);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  // ---- Auth / Profile ----
  signup: (body: { username: string; email: string; password: string }) =>
    request<User>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  login: (body: { email: string; password: string }) =>
    request<User>("/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  logout: () => request<void>("/auth/logout", { method: "POST" }),

  me: () => request<User>("/auth/me"),

  updateProfile: (body: ProfileUpdate) =>
    request<User>("/auth/me", {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  deleteAccount: () => request<void>("/auth/me", { method: "DELETE" }),

  // ---- Trades ----
  listTrades: (month?: number, year?: number) => {
    const qs = month && year ? `?month=${month}&year=${year}` : "";
    return request<Trade[]>(`/trades${qs}`);
  },

  recentTrades: (limit = 5) =>
    request<Trade[]>(`/trades/recent?limit=${limit}`),

  stats: () => request<Stats>("/trades/stats"),

  createTrade: (body: TradeInput) =>
    request<Trade>("/trades", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  updateTrade: (id: number, body: TradeInput) =>
    request<Trade>(`/trades/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  deleteTrade: (id: number) =>
    request<void>(`/trades/${id}`, { method: "DELETE" }),

  // ---- Psychology ----
  listPsychology: (limit = 20) =>
    request<PsychologyLog[]>(`/psychology?limit=${limit}`),

  createPsychology: (body: PsychologyInput) =>
    request<PsychologyLog>("/psychology", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  deletePsychology: (id: number) =>
    request<void>(`/psychology/${id}`, { method: "DELETE" }),
};