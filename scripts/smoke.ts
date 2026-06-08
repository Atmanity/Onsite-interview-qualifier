// End-to-end smoke test of the real Claude calls used by the app.
// Runs the actual src/lib/anthropic.ts logic against the live API.
import { curateRole, assessCandidate } from "../src/lib/anthropic";

const JD = `Founding Product Engineer — early-stage seed startup (5 people).
You'll own features end-to-end: design, build, and ship our core web platform in
TypeScript, React, and Node. You'll talk to customers weekly, turn their pain into
product, and move fast with limited resources. We want a scrappy generalist who can
operate with ambiguity, has strong product sense, and wants to grow into a tech lead.
Nice to have: experience at a startup, some backend/infra depth, prior 0->1 work.`;

const STRONG = {
  name: "Maya Chen",
  resumeText: `Maya Chen — Full-stack engineer, 6 yrs.
- Employee #3 at a seed startup (acq'd). Built the entire web app in React/TypeScript/Node,
  shipped billing, auth, and the core workflow product solo in the first year.
- Ran weekly customer calls, translated feedback into a roadmap, drove 0->1 launch to 200 paying teams.
- Set up CI/CD, Postgres schema, and basic infra on AWS.
- Later led a team of 3 as the company grew; mentored two juniors.`,
  callNotes: `Intro call: Extremely crisp communicator. Lights up talking about talking to
users and shipping. Gave a concrete story of cutting scope to ship a billing MVP in a weekend
when a big customer needed it. Comfortable with ambiguity, clearly startup-minded, said big-co
process "drives her crazy". Wants to grow into a technical leadership role. Thoughtful on tradeoffs.`,
};

const WEAK = {
  name: "Robert Lang",
  resumeText: `Robert Lang — Software Engineer, 8 yrs, all at a Fortune 100 bank.
- Maintained internal Java batch systems within a 40-person team; worked on a small slice of a large system.
- Followed detailed specs handed down by architects; limited customer contact.
- No startup experience; primarily backend Java, little frontend/TypeScript.`,
  callNotes: `Intro call: Polite but reserved. Prefers clear requirements and established process.
When asked about ambiguity, said he likes "a well-defined ticket". No examples of owning something
end-to-end or shipping under pressure. Limited product instinct. Seemed happiest in big-company structure.`,
};

function ms(n: number) {
  return `${(n / 1000).toFixed(1)}s`;
}

async function main() {
  console.log("== Curating role from JD ==");
  let t = Date.now();
  const spec = await curateRole(JD);
  console.log(`  done in ${ms(Date.now() - t)}`);
  console.log("  title:", spec.title);
  console.log("  seniority:", spec.seniority, "| icOrManager:", spec.icOrManager);
  console.log("  requiredSkills:", spec.requiredSkills.slice(0, 5).join(", "));
  console.log("  criteriaGuidance entries:", spec.criteriaGuidance.length);

  for (const cand of [STRONG, WEAK]) {
    console.log(`\n== Assessing ${cand.name} ==`);
    t = Date.now();
    const a = await assessCandidate({ spec, ...cand });
    console.log(`  done in ${ms(Date.now() - t)}`);
    console.log(`  overallScore: ${a.overallScore}  recommendation: ${a.recommendation}`);
    console.log(`  icVsManager: ${a.icVsManager} | startupVsBigCorp: ${a.startupVsBigCorp}`);
    console.log(`  criteria returned: ${a.criteria.length}/14`);
    console.log(`  summary: ${a.summary}`);
    console.log(
      "  top scores:",
      [...a.criteria].sort((x, y) => y.score - x.score).slice(0, 3)
        .map((c) => `${c.key}=${c.score}`).join(", "),
    );
    console.log(
      "  low scores:",
      [...a.criteria].sort((x, y) => x.score - y.score).slice(0, 3)
        .map((c) => `${c.key}=${c.score}`).join(", "),
    );
  }
  console.log("\n✓ smoke test complete");
}

main().catch((e) => {
  console.error("SMOKE TEST FAILED:", e?.message || e);
  process.exit(1);
});
