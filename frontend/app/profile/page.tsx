"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";

function passwordChecks(pw: string) {
  return [
    { label: "At least 8 characters", ok: pw.length >= 8 },
    { label: "An uppercase letter", ok: /[A-Z]/.test(pw) },
    { label: "A lowercase letter", ok: /[a-z]/.test(pw) },
    { label: "A number", ok: /\d/.test(pw) },
  ];
}

export default function ProfilePage() {
  const { user, loading, updateProfile, deleteAccount } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setEmail(user.email);
    }
  }, [user]);

  if (loading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-slate-400">Loading…</div>
      </main>
    );
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMsg("");

    if (newPassword && !passwordChecks(newPassword).every((c) => c.ok)) {
      setError("New password must meet all the requirements shown.");
      return;
    }
    if (newPassword && !currentPassword) {
      setError("Enter your current password to set a new one.");
      return;
    }

    setSaving(true);
    try {
      await updateProfile({
        username: username.trim(),
        email: email.trim(),
        current_password: currentPassword || undefined,
        new_password: newPassword || undefined,
      });
      setCurrentPassword("");
      setNewPassword("");
      setMsg("Profile updated ✓");
      setTimeout(() => setMsg(""), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteAccount();
      router.replace("/signup");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete account");
      setDeleting(false);
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Your Profile</h1>
            <p className="text-sm text-slate-400">
              View and manage your account details.
            </p>
          </div>
          <Link href="/dashboard" className="btn-ghost">
            ← Back to dashboard
          </Link>
        </div>

        {/* Overview card */}
        <div className="card mb-6 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand text-2xl font-bold text-white">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="text-lg font-semibold">{user.username}</div>
            <div className="text-sm text-slate-400">{user.email}</div>
            <div className="mt-1 text-xs text-slate-500">
              Member since {format(parseISO(user.created_at), "MMMM d, yyyy")}
              {"  ·  "}Account #{user.id}
            </div>
          </div>
        </div>

        {/* Edit form */}
        <form onSubmit={handleSave} className="card space-y-4">
          <h2 className="text-base font-semibold">Edit details</h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Username</label>
              <input
                className="input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="border-t border-slate-800 pt-4">
            <p className="mb-3 text-xs uppercase tracking-wide text-slate-500">
              Change password (optional)
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Current password</label>
                <input
                  type="password"
                  className="input"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="required to change password"
                />
              </div>
              <div>
                <label className="label">New password</label>
                <input
                  type="password"
                  className="input"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="at least 8 characters"
                />
                {newPassword.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {passwordChecks(newPassword).map((c) => (
                      <li
                        key={c.label}
                        className={`flex items-center gap-2 text-xs ${
                          c.ok ? "text-emerald-400" : "text-slate-500"
                        }`}
                      >
                        <span>{c.ok ? "✓" : "○"}</span>
                        {c.label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {error && (
            <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
              {error}
            </p>
          )}

          <div className="flex items-center gap-3">
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </button>
            {msg && <span className="text-sm text-emerald-400">{msg}</span>}
          </div>
        </form>

        {/* Danger zone */}
        <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/5 p-5">
          <h2 className="text-base font-semibold text-red-400">Danger zone</h2>
          <p className="mt-1 text-sm text-slate-400">
            Deleting your account permanently removes your profile and all of
            your trades and psychology logs. This cannot be undone.
          </p>

          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="mt-4 rounded-lg border border-red-500/50 px-4 py-2 text-sm font-semibold text-red-400 transition hover:bg-red-500/10"
            >
              Delete my account
            </button>
          ) : (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="text-sm text-slate-300">
                Are you sure? This is permanent.
              </span>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600 disabled:opacity-50"
              >
                {deleting ? "Deleting…" : "Yes, delete permanently"}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="btn-ghost"
                disabled={deleting}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}