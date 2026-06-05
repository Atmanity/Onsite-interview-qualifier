"use client";

import { CRITERION_LABEL } from "@/lib/criteria";
import type { Assessment } from "@/lib/types";
import {
  criterionBarColor,
  IC_MANAGER_LABEL,
  overallScoreColor,
  RECOMMENDATION,
  STARTUP_LABEL,
} from "@/lib/ui";

export default function AssessmentView({ a }: { a: Assessment }) {
  const rec = RECOMMENDATION[a.recommendation];
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <span
          className={`flex h-14 w-14 items-center justify-center rounded-xl text-xl font-bold ${overallScoreColor(
            a.overallScore,
          )}`}
        >
          {a.overallScore}
        </span>
        <div className="space-y-1">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${rec.className}`}
          >
            {rec.label}
          </span>
          <div className="flex flex-wrap gap-2 text-xs text-slate-500">
            <span className="rounded bg-slate-100 px-2 py-0.5">
              {IC_MANAGER_LABEL[a.icVsManager]}
            </span>
            <span className="rounded bg-slate-100 px-2 py-0.5">
              {STARTUP_LABEL[a.startupVsBigCorp]}
            </span>
          </div>
        </div>
      </div>

      <p className="text-sm leading-relaxed text-slate-700">{a.summary}</p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
            Strengths
          </h4>
          <ul className="space-y-1 text-sm text-slate-700">
            {a.strengths.map((s, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-emerald-500">+</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-rose-700">
            Concerns
          </h4>
          <ul className="space-y-1 text-sm text-slate-700">
            {a.concerns.map((s, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-rose-500">–</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div>
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Criteria breakdown
        </h4>
        <div className="space-y-2.5">
          {a.criteria.map((c) => (
            <div key={c.key} className="grid grid-cols-[160px_1fr] gap-3">
              <div className="flex items-center gap-2">
                <span className="w-6 text-right text-sm font-semibold tabular-nums text-slate-700">
                  {c.score}
                </span>
                <span className="text-sm text-slate-600">
                  {CRITERION_LABEL[c.key] ?? c.key}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-1.5 w-24 shrink-0 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className={`h-full ${criterionBarColor(c.score)}`}
                    style={{ width: `${c.score * 10}%` }}
                  />
                </div>
                <span className="text-xs leading-snug text-slate-500">
                  {c.rationale}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
