"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/dashboard" className="text-xl font-bold tracking-tight">
          Trade<span className="text-brand">Flow</span>
        </Link>
        <div className="flex items-center gap-2">
          {user && (
            <Link
              href="/profile"
              className={[
                "flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition",
                pathname === "/profile"
                  ? "border-brand bg-brand/15 text-brand"
                  : "border-slate-700 text-slate-300 hover:bg-slate-800",
              ].join(" ")}
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
                {user.username.charAt(0).toUpperCase()}
              </span>
              <span className="hidden sm:inline">{user.username}</span>
            </Link>
          )}
          <button onClick={handleLogout} className="btn-ghost">
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}