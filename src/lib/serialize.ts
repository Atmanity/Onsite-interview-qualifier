import type { Candidate, Role } from "@prisma/client";
import type { Assessment, CandidateDTO, RoleSpec } from "./types";

export function serializeCandidate(c: Candidate): CandidateDTO {
  return {
    id: c.id,
    roleId: c.roleId,
    name: c.name,
    resumeText: c.resumeText,
    callNotes: c.callNotes,
    status: c.status as CandidateDTO["status"],
    error: c.error,
    assessment: c.assessment
      ? (JSON.parse(c.assessment) as Assessment)
      : null,
    createdAt: c.createdAt.toISOString(),
  };
}

export function parseSpec(role: Role): RoleSpec {
  return JSON.parse(role.spec) as RoleSpec;
}
