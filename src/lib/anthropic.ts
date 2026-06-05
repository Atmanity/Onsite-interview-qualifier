import Anthropic from "@anthropic-ai/sdk";
import { CRITERIA, CRITERIA_KEYS } from "./criteria";
import type { Assessment, RoleSpec } from "./types";

const MODEL = process.env.ASSESSMENT_MODEL || "claude-opus-4-8";

function getClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. Add it to your .env file (see .env.example).",
    );
  }
  return new Anthropic();
}

// Pull the JSON object out of a structured-output response. With adaptive
// thinking enabled the response may lead with a thinking block, so we find the
// first text block rather than assuming index 0.
function parseJsonFromMessage<T>(message: Anthropic.Message): T {
  const textBlock = message.content.find(
    (b): b is Anthropic.TextBlock => b.type === "text",
  );
  if (!textBlock) {
    throw new Error("Model returned no text content to parse.");
  }
  return JSON.parse(textBlock.text) as T;
}

// output_config / structured outputs may be newer than the installed SDK's
// types — keep the params loosely typed so the build never breaks on them.
async function createStructured(args: {
  system: string;
  user: string;
  schema: Record<string, unknown>;
  maxTokens?: number;
}): Promise<Anthropic.Message> {
  const client = getClient();
  const params = {
    model: MODEL,
    max_tokens: args.maxTokens ?? 8000,
    thinking: { type: "adaptive" },
    output_config: {
      effort: "high",
      format: { type: "json_schema", schema: args.schema },
    },
    system: args.system,
    messages: [{ role: "user", content: args.user }],
  };
  return client.messages.create(params as never) as Promise<Anthropic.Message>;
}

// ---------------------------------------------------------------------------
// Role curation: raw JD text -> structured RoleSpec
// ---------------------------------------------------------------------------

const roleSpecSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    title: { type: "string" },
    seniority: { type: "string" },
    icOrManager: { type: "string", enum: ["ic", "manager", "both"] },
    summary: { type: "string" },
    responsibilities: { type: "array", items: { type: "string" } },
    requiredSkills: { type: "array", items: { type: "string" } },
    niceToHave: { type: "array", items: { type: "string" } },
    idealProfile: { type: "string" },
    criteriaGuidance: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          key: { type: "string", enum: CRITERIA_KEYS },
          guidance: { type: "string" },
        },
        required: ["key", "guidance"],
      },
    },
  },
  required: [
    "title",
    "seniority",
    "icOrManager",
    "summary",
    "responsibilities",
    "requiredSkills",
    "niceToHave",
    "idealProfile",
    "criteriaGuidance",
  ],
};

export async function curateRole(jdText: string): Promise<RoleSpec> {
  const criteriaList = CRITERIA.map(
    (c) => `- ${c.key} (${c.label}): ${c.description}`,
  ).join("\n");

  const system = `You are an expert technical recruiter and hiring manager. You turn a raw job description into a clean, structured role specification that will be used to evaluate candidates for an onsite (in-person or virtual) interview.

Be concrete and opinionated. Infer reasonable details where the JD is vague, but do not invent hard requirements that aren't implied.

For criteriaGuidance, provide one entry for EACH of these criteria keys, describing what "strong" looks like for THIS specific role:
${criteriaList}`;

  const user = `Here is the job description. Curate it into a structured role spec.\n\n<job_description>\n${jdText}\n</job_description>`;

  const message = await createStructured({
    system,
    user,
    schema: roleSpecSchema,
    maxTokens: 6000,
  });
  return parseJsonFromMessage<RoleSpec>(message);
}

// ---------------------------------------------------------------------------
// Candidate assessment: RoleSpec + candidate assets -> Assessment
// ---------------------------------------------------------------------------

const assessmentSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    overallScore: { type: "integer" },
    recommendation: {
      type: "string",
      enum: ["strong_yes", "yes", "maybe", "no"],
    },
    summary: { type: "string" },
    strengths: { type: "array", items: { type: "string" } },
    concerns: { type: "array", items: { type: "string" } },
    icVsManager: { type: "string", enum: ["ic", "manager", "both"] },
    startupVsBigCorp: {
      type: "string",
      enum: ["startup", "big_corp", "balanced"],
    },
    criteria: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          key: { type: "string", enum: CRITERIA_KEYS },
          score: { type: "integer" },
          rationale: { type: "string" },
        },
        required: ["key", "score", "rationale"],
      },
    },
  },
  required: [
    "overallScore",
    "recommendation",
    "summary",
    "strengths",
    "concerns",
    "icVsManager",
    "startupVsBigCorp",
    "criteria",
  ],
};

export async function assessCandidate(args: {
  spec: RoleSpec;
  name: string;
  resumeText: string;
  callNotes: string;
}): Promise<Assessment> {
  const { spec, name, resumeText, callNotes } = args;

  const criteriaList = CRITERIA.map(
    (c) => `- ${c.key} (${c.label}): ${c.description}`,
  ).join("\n");

  const guidance = spec.criteriaGuidance
    .map((g) => `- ${g.key}: ${g.guidance}`)
    .join("\n");

  const system = `You are a sharp, calibrated hiring manager deciding whether a candidate should be recommended for an onsite (in-person or virtual) interview. Be rigorous and honest — do not inflate scores. Distinguish clearly between strong and mediocre candidates.

Score EACH of these 14 criteria from 1 (poor) to 10 (exceptional), based only on the evidence available. When evidence is thin for a criterion, score conservatively and say so in the rationale.
${criteriaList}

Then produce:
- overallScore: a holistic 1-100 fit score for THIS role. Weight the criteria by what actually matters for this role (use the role's criteria guidance). It should not be a naive average — a fatal gap on a must-have should pull the score down hard.
- recommendation: one of strong_yes, yes, maybe, no — your call on advancing them to onsite.
- summary: 2-4 sentences on the overall read.
- strengths / concerns: the few that genuinely matter.
- icVsManager: whether they read as more ic, more manager, or both.
- startupVsBigCorp: whether they read as more startup, more big_corp, or balanced.

Every score and rationale must reference concrete signals from the resume or the intro call notes.`;

  const role = `<role_spec>
Title: ${spec.title}
Seniority: ${spec.seniority}
IC or Manager expectation: ${spec.icOrManager}
Summary: ${spec.summary}
Responsibilities:
${spec.responsibilities.map((r) => `  - ${r}`).join("\n")}
Required skills:
${spec.requiredSkills.map((r) => `  - ${r}`).join("\n")}
Nice to have:
${spec.niceToHave.map((r) => `  - ${r}`).join("\n")}
Ideal profile: ${spec.idealProfile}
What "strong" looks like per criterion for this role:
${guidance}
</role_spec>`;

  const candidate = `<candidate name="${name}">
<resume>
${resumeText || "(no resume provided)"}
</resume>
<intro_call_notes>
${callNotes || "(no intro call notes / transcript provided)"}
</intro_call_notes>
</candidate>`;

  const user = `Assess this candidate against the role.\n\n${role}\n\n${candidate}`;

  const message = await createStructured({
    system,
    user,
    schema: assessmentSchema,
    maxTokens: 8000,
  });
  return parseJsonFromMessage<Assessment>(message);
}
