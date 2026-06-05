"use client";

import { CRITERIA } from "@/lib/criteria";
import type { CandidateDTO } from "@/lib/types";
import { criterionBarColor, overallScoreColor, RECOMMENDATION } from "@/lib/ui";

// Side-by-side comparison of assessed candidates, sorted by overall fit.
export default function CompareTable({
  candidates,
}: {
  candidates: CandidateDTO[];
}) {
  const assessed = candidates
    .filter((c) => c.assessment)
    .sort(
      (a, b) =>
        (b.assessment?.overallScore ?? 0) - (a.assessment?.overallScore ?? 0),
    );

  if (assessed.length < 2) {
    return (
      <p className="text-sm text-slate-400">
        Assess at least two candidates to compare them here.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="sticky left-0 z-10 bg-white px-4 py-3 text-left font-semibold">
              Criterion
            </th>
            {assessed.map((c) => (
              <th key={c.id} className="px-3 py-3 text-center font-semibold">
                {c.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-slate-200 bg-slate-50">
            <td className="sticky left-0 z-10 bg-slate-50 px-4 py-2.5 font-semibold">
              Overall fit
            </td>
            {assessed.map((c) => (
              <td key={c.id} className="px-3 py-2.5 text-center">
                <span
                  className={`inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold ${overallScoreColor(
                    c.assessment!.overallScore,
                  )}`}
                >
                  {c.assessment!.overallScore}
                </span>
              </td>
            ))}
          </tr>
          <tr className="border-b border-slate-200">
            <td className="sticky left-0 z-10 bg-white px-4 py-2 text-slate-500">
              Recommendation
            </td>
            {assessed.map((c) => (
              <td key={c.id} className="px-3 py-2 text-center text-xs">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 font-semibold ring-1 ring-inset ${
                    RECOMMENDATION[c.assessment!.recommendation].className
                  }`}
                >
                  {RECOMMENDATION[c.assessment!.recommendation].label}
                </span>
              </td>
            ))}
          </tr>
          {CRITERIA.map((crit) => (
            <tr key={crit.key} className="border-b border-slate-100">
              <td className="sticky left-0 z-10 bg-white px-4 py-2 text-slate-600">
                {crit.label}
              </td>
              {assessed.map((c) => {
                const score =
                  c.assessment!.criteria.find((x) => x.key === crit.key)
                    ?.score ?? 0;
                return (
                  <td key={c.id} className="px-3 py-2">
                    <div className="flex items-center justify-center gap-2">
                      <span className="w-4 text-right font-medium tabular-nums text-slate-700">
                        {score}
                      </span>
                      <div className="h-1.5 w-12 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className={`h-full ${criterionBarColor(score)}`}
                          style={{ width: `${score * 10}%` }}
                        />
                      </div>
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
