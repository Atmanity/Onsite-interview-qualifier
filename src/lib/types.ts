import type { CriterionKey } from "./criteria";

// Curated, structured version of a job description, generated from raw JD text.
export interface RoleSpec {
  title: string;
  seniority: string;
  icOrManager: "ic" | "manager" | "both";
  summary: string;
  responsibilities: string[];
  requiredSkills: string[];
  niceToHave: string[];
  idealProfile: string;
  criteriaGuidance: { key: CriterionKey; guidance: string }[];
}

export interface CriterionScore {
  key: CriterionKey;
  score: number; // 1-10
  rationale: string;
}

export interface Assessment {
  overallScore: number; // 1-100
  recommendation: "strong_yes" | "yes" | "maybe" | "no";
  summary: string;
  strengths: string[];
  concerns: string[];
  icVsManager: "ic" | "manager" | "both";
  startupVsBigCorp: "startup" | "big_corp" | "balanced";
  criteria: CriterionScore[];
}

// Shapes returned by the API to the client.
export interface RoleListItem {
  id: string;
  title: string;
  createdAt: string;
  candidateCount: number;
}

export interface CandidateDTO {
  id: string;
  roleId: string;
  name: string;
  resumeText: string;
  callNotes: string;
  status: "pending" | "done" | "error";
  error: string | null;
  assessment: Assessment | null;
  createdAt: string;
}

export interface RoleDetail {
  id: string;
  title: string;
  jdText: string;
  spec: RoleSpec;
  createdAt: string;
  candidates: CandidateDTO[];
}
