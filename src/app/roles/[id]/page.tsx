"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import AssetInput from "@/components/AssetInput";
import AssessmentView from "@/components/AssessmentView";
import CompareTable from "@/components/CompareTable";
import RoleSpecCard from "@/components/RoleSpecCard";
import type { CandidateDTO, RoleDetail } from "@/lib/types";
import { overallScoreColor } from "@/lib/ui";

export default function RolePage() {
  const { id } = useParams<{ id: string }>();
  const [role, setRole] = useState<RoleDetail | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [tab, setTab] = useState<"candidates" | "compare">("candidates");

  // local "assessing" set so we can show spinners independent of the DB status
  const [assessing, setAssessing] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    const res = await fetch(`/api/roles/${id}`);
    if (res.status === 404) return setNotFound(true);
    if (res.ok) setRole(await res.json());
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  function setCandidate(updated: CandidateDTO) {
    setRole((r) =>
      r
        ? {
            ...r,
            candidates: r.candidates.map((c) =>
              c.id === updated.id ? updated : c,
            ),
          }
        : r,
    );
  }

  async function assess(candidateId: string) {
    setAssessing((s) => new Set(s).add(candidateId));
    try {
      const res = await fetch(`/api/candidates/${candidateId}/assess`, {
        method: "POST",
      });
      const data = await res.json();
      setCandidate(data);
      // Auto-expand once an assessment lands.
      if (res.ok) setExpanded((s) => new Set(s).add(candidateId));
    } finally {
      setAssessing((s) => {
        const n = new Set(s);
        n.delete(candidateId);
        return n;
      });
    }
  }

  async function assessAll() {
    if (!role) return;
    const pending = role.candidates.filter(
      (c) => !c.assessment && !assessing.has(c.id),
    );
    // Run sequentially to stay within rate limits and keep things readable.
    for (const c of pending) {
      await assess(c.id);
    }
  }

  async function removeCandidate(candidateId: string) {
    if (!confirm("Remove this candidate?")) return;
    await fetch(`/api/candidates/${candidateId}`, { method: "DELETE" });
    setRole((r) =>
      r
        ? { ...r, candidates: r.candidates.filter((c) => c.id !== candidateId) }
        : r,
    );
  }

  function toggle(candidateId: string) {
    setExpanded((s) => {
      const n = new Set(s);
      n.has(candidateId) ? n.delete(candidateId) : n.add(candidateId);
      return n;
    });
  }

  if (notFound) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-slate-500">This role doesn&apos;t exist.</p>
        <Link href="/" className="text-sm font-medium text-slate-900 underline">
          ← Back to roles
        </Link>
      </div>
    );
  }

  if (!role) return <p className="text-sm text-slate-400">Loading…</p>;

  const pendingCount = role.candidates.filter((c) => !c.assessment).length;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/"
          className="text-sm text-slate-500 hover:text-slate-900"
        >
          ← All roles
        </Link>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          {role.title}
        </h1>
      </div>

      <RoleSpecCard spec={role.spec} />

      <div className="flex items-center gap-1 border-b border-slate-200">
        <TabButton
          active={tab === "candidates"}
          onClick={() => setTab("candidates")}
        >
          Candidates ({role.candidates.length})
        </TabButton>
        <TabButton active={tab === "compare"} onClick={() => setTab("compare")}>
          Compare
        </TabButton>
      </div>

      {tab === "candidates" ? (
        <div className="space-y-6">
          <AddCandidate roleId={role.id} onAdded={(c) => {
            setRole((r) => (r ? { ...r, candidates: [...r.candidates, c] } : r));
          }} />

          {role.candidates.length > 1 && pendingCount > 0 && (
            <button
              onClick={assessAll}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Assess all {pendingCount} pending
            </button>
          )}

          <div className="space-y-3">
            {role.candidates.length === 0 && (
              <p className="text-sm text-slate-400">
                No candidates yet. Add one above to assess their fit.
              </p>
            )}
            {role.candidates.map((c) => {
              const busy = assessing.has(c.id);
              const isOpen = expanded.has(c.id);
              return (
                <div
                  key={c.id}
                  className="rounded-xl border border-slate-200 bg-white shadow-sm"
                >
                  <div className="flex items-center gap-3 px-5 py-4">
                    {c.assessment ? (
                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${overallScoreColor(
                          c.assessment.overallScore,
                        )}`}
                      >
                        {c.assessment.overallScore}
                      </span>
                    ) : (
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-400">
                        —
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{c.name}</p>
                      <p className="text-xs text-slate-400">
                        {c.resumeText ? "Resume" : "No resume"} ·{" "}
                        {c.callNotes ? "Call notes" : "No call notes"}
                        {c.status === "error" && c.error && (
                          <span className="text-rose-500"> · {c.error}</span>
                        )}
                      </p>
                    </div>
                    <button
                      onClick={() => assess(c.id)}
                      disabled={busy}
                      className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-60"
                    >
                      {busy
                        ? "Assessing…"
                        : c.assessment
                          ? "Re-assess"
                          : "Assess"}
                    </button>
                    {c.assessment && (
                      <button
                        onClick={() => toggle(c.id)}
                        className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
                      >
                        {isOpen ? "Hide" : "Details"}
                      </button>
                    )}
                    <button
                      onClick={() => removeCandidate(c.id)}
                      title="Remove candidate"
                      className="px-1 text-slate-300 hover:text-rose-600"
                    >
                      ✕
                    </button>
                  </div>
                  {c.assessment && isOpen && (
                    <div className="border-t border-slate-100 px-5 py-4">
                      <AssessmentView a={c.assessment} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <CompareTable candidates={role.candidates} />
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition ${
        active
          ? "border-slate-900 text-slate-900"
          : "border-transparent text-slate-500 hover:text-slate-700"
      }`}
    >
      {children}
    </button>
  );
}

function AddCandidate({
  roleId,
  onAdded,
}: {
  roleId: string;
  onAdded: (c: CandidateDTO) => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [callNotes, setCallNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleId, name, resumeText, callNotes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add candidate.");
      onAdded(data);
      setName("");
      setResumeText("");
      setCallNotes("");
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
      >
        + Add candidate
      </button>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Candidate name
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Jane Doe"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <AssetInput
          label="Resume"
          placeholder="Paste resume text, or upload a PDF / DOCX."
          value={resumeText}
          onChange={setResumeText}
          rows={8}
        />
        <AssetInput
          label="Intro call notes / transcript"
          placeholder="Paste the intro call summary or transcript, or upload a file."
          value={callNotes}
          onChange={setCallNotes}
          rows={8}
        />
      </div>
      {error && <p className="text-sm text-rose-600">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-60"
        >
          {submitting ? "Adding…" : "Add candidate"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
