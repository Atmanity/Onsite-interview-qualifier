"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AssetInput from "@/components/AssetInput";
import type { RoleListItem } from "@/lib/types";

export default function HomePage() {
  const router = useRouter();
  const [roles, setRoles] = useState<RoleListItem[] | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [jdText, setJdText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadRoles() {
    const res = await fetch("/api/roles");
    if (res.ok) setRoles(await res.json());
  }

  useEffect(() => {
    loadRoles();
  }, []);

  async function createRole(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, jdText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create role.");
      router.push(`/roles/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setSubmitting(false);
    }
  }

  async function deleteRole(id: string) {
    if (!confirm("Delete this role and all its candidates?")) return;
    await fetch(`/api/roles/${id}`, { method: "DELETE" });
    loadRoles();
  }

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Roles</h1>
          <p className="mt-1 text-sm text-slate-500">
            Pick a role to qualify candidates for, or add a new one from a job
            description.
          </p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          {showForm ? "Cancel" : "+ New role"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={createRole}
          className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Role title{" "}
              <span className="font-normal text-slate-400">
                (optional — inferred from the JD if blank)
              </span>
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Founding Product Engineer"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            />
          </div>
          <AssetInput
            label="Job description"
            placeholder="Paste the JD here, or upload a PDF / DOCX. We'll curate it into a structured role spec."
            value={jdText}
            onChange={setJdText}
            rows={10}
          />
          {error && <p className="text-sm text-rose-600">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-60"
          >
            {submitting ? "Curating role…" : "Curate & create role"}
          </button>
        </form>
      )}

      {roles === null ? (
        <p className="text-sm text-slate-400">Loading roles…</p>
      ) : roles.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="text-sm text-slate-500">
            No roles yet. Create one to get started.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {roles.map((role) => (
            <div
              key={role.id}
              className="group relative rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow"
            >
              <Link href={`/roles/${role.id}`} className="block">
                <h3 className="pr-6 font-semibold tracking-tight">
                  {role.title}
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  {role.candidateCount}{" "}
                  {role.candidateCount === 1 ? "candidate" : "candidates"}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {new Date(role.createdAt).toLocaleDateString()}
                </p>
              </Link>
              <button
                onClick={() => deleteRole(role.id)}
                title="Delete role"
                className="absolute right-3 top-3 text-slate-300 opacity-0 transition group-hover:opacity-100 hover:text-rose-600"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
