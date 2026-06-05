import type { Assessment } from "./types";

// Shared display helpers for scores and labels.

export function overallScoreColor(score: number): string {
  if (score >= 80) return "bg-emerald-600 text-white";
  if (score >= 65) return "bg-emerald-500 text-white";
  if (score >= 50) return "bg-amber-500 text-white";
  if (score >= 35) return "bg-orange-500 text-white";
  return "bg-rose-600 text-white";
}

// 1-10 criterion score -> a tailwind text/bg pair for the little bar.
export function criterionBarColor(score: number): string {
  if (score >= 8) return "bg-emerald-500";
  if (score >= 6) return "bg-lime-500";
  if (score >= 4) return "bg-amber-500";
  return "bg-rose-500";
}

export const RECOMMENDATION: Record<
  Assessment["recommendation"],
  { label: string; className: string }
> = {
  strong_yes: {
    label: "Strong yes",
    className: "bg-emerald-100 text-emerald-800 ring-emerald-600/20",
  },
  yes: { label: "Yes", className: "bg-lime-100 text-lime-800 ring-lime-600/20" },
  maybe: {
    label: "Maybe",
    className: "bg-amber-100 text-amber-800 ring-amber-600/20",
  },
  no: { label: "No", className: "bg-rose-100 text-rose-800 ring-rose-600/20" },
};

export const IC_MANAGER_LABEL: Record<string, string> = {
  ic: "Individual contributor",
  manager: "Manager",
  both: "IC + Manager",
};

export const STARTUP_LABEL: Record<string, string> = {
  startup: "Startup-minded",
  big_corp: "Big-corp operator",
  balanced: "Balanced",
};
