// The 14 assessment criteria that make up a candidate's overall fit score.
// `key` is the stable identifier stored in the DB and used in API schemas;
// `label` and `description` drive the UI and the model prompts.

export const CRITERIA = [
  {
    key: "backgroundFit",
    label: "Background Fit",
    description:
      "How well their background (industries, domains, company types) aligns with what the role needs.",
  },
  {
    key: "experienceFit",
    label: "Experience Fit",
    description:
      "Relevance and depth of their hands-on experience for the responsibilities of this role.",
  },
  {
    key: "seniorityFit",
    label: "Seniority Fit",
    description:
      "Whether their level, scope, and span of impact match the seniority the role calls for.",
  },
  {
    key: "icVsManager",
    label: "IC vs Manager",
    description:
      "Are they more of an individual contributor, a people manager, or able to do both? Score reflects fit to the role's expectation and overall versatility.",
  },
  {
    key: "leadershipOwnership",
    label: "Leadership & Ownership",
    description:
      "Capacity to lead initiatives and take genuine end-to-end ownership of outcomes.",
  },
  {
    key: "accountabilityReliability",
    label: "Accountability & Reliability",
    description:
      "How accountable, dependable, and consistent they are in actually delivering.",
  },
  {
    key: "scrappiness",
    label: "Scrappiness",
    description:
      "Resourcefulness and the ability to get things done with limited resources and ambiguity.",
  },
  {
    key: "sharpnessInsight",
    label: "Sharpness & Insight",
    description:
      "Intellectual sharpness, quality of judgment, and the depth of insight they bring.",
  },
  {
    key: "entrepreneurial",
    label: "Entrepreneurial",
    description:
      "Entrepreneurial drive and ownership mentality; startup-minded builder vs big-corp operator.",
  },
  {
    key: "technical",
    label: "Technical Ability",
    description:
      "Familiarity and depth with the technical tools and abilities relevant to this role.",
  },
  {
    key: "businessSavvy",
    label: "Business Savvy",
    description:
      "Familiarity with the relevant business and product methodologies and commercial judgment.",
  },
  {
    key: "communication",
    label: "Communication",
    description: "Clarity, structure, and effectiveness of how they communicate.",
  },
  {
    key: "growthPotential",
    label: "Growth Potential",
    description:
      "Trajectory and capacity to keep growing into a bigger scope over time.",
  },
  {
    key: "teamPlayer",
    label: "Team Player",
    description:
      "Collaboration, generosity, and how effectively they work within a team.",
  },
] as const;

export type CriterionKey = (typeof CRITERIA)[number]["key"];

export const CRITERIA_KEYS = CRITERIA.map((c) => c.key) as CriterionKey[];

export const CRITERION_LABEL: Record<string, string> = Object.fromEntries(
  CRITERIA.map((c) => [c.key, c.label]),
);
