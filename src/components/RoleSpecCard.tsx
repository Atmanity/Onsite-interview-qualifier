"use client";

import { useState } from "react";
import { CRITERION_LABEL } from "@/lib/criteria";
import type { RoleSpec } from "@/lib/types";
import { IC_MANAGER_LABEL } from "@/lib/ui";

function List({ title, items }: { title: string; items: string[] }) {
  if (!items?.length) return null;
  return (
    <div>
      <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </h4>
      <ul className="list-disc space-y-0.5 pl-5 text-sm text-slate-700">
        {items.map((it, i) => (
          <li key={i}>{it}</li>
        ))}
      </ul>
    </div>
  );
}

export default function RoleSpecCard({ spec }: { spec: RoleSpec }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <div>
          <h3 className="font-semibold tracking-tight">{spec.title}</h3>
          <p className="mt-0.5 text-sm text-slate-500">
            {spec.seniority} · {IC_MANAGER_LABEL[spec.icOrManager]}
          </p>
        </div>
        <span className="text-sm text-slate-400">
          {open ? "Hide details ▲" : "Show curated spec ▼"}
        </span>
      </button>

      {open && (
        <div className="space-y-4 border-t border-slate-100 px-5 py-4">
          <p className="text-sm leading-relaxed text-slate-700">
            {spec.summary}
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <List title="Responsibilities" items={spec.responsibilities} />
            <List title="Required skills" items={spec.requiredSkills} />
            <List title="Nice to have" items={spec.niceToHave} />
            <div>
              <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Ideal profile
              </h4>
              <p className="text-sm text-slate-700">{spec.idealProfile}</p>
            </div>
          </div>
          {spec.criteriaGuidance?.length > 0 && (
            <div>
              <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                What "strong" looks like for this role
              </h4>
              <dl className="grid gap-x-6 gap-y-1 sm:grid-cols-2">
                {spec.criteriaGuidance.map((g) => (
                  <div key={g.key} className="text-sm">
                    <dt className="inline font-medium text-slate-700">
                      {CRITERION_LABEL[g.key] ?? g.key}:{" "}
                    </dt>
                    <dd className="inline text-slate-600">{g.guidance}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
