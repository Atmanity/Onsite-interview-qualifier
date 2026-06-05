# Onsite Interview Qualifier

A web app that helps you decide which candidates to recommend for your onsite
(in-person or virtual) interviews. Pick the role you're hiring for, upload each
candidate's **resume** and **intro-call notes/transcript**, and get an
AI-generated **overall fit score** plus a breakdown across 14 hiring criteria —
with side-by-side comparison so you can review multiple candidates at once.

## How it works

1. **Create a role** — paste or upload a job description. It's curated by Claude
   into a structured role spec (seniority, IC/manager expectation,
   responsibilities, required skills, and what "strong" looks like per criterion).
2. **Add candidates** — for each candidate, paste or upload a resume and the
   intro-call summary/transcript (PDF, DOCX, or text).
3. **Assess** — each candidate is scored against the role on:
   1. Background fit
   2. Experience fit
   3. Seniority fit
   4. IC vs manager (or both)
   5. Leadership & ownership
   6. Accountability & reliability
   7. Scrappiness
   8. Sharpness & insight
   9. Entrepreneurial (startup vs big-corp)
   10. Technical ability
   11. Business savvy
   12. Communication
   13. Growth potential
   14. Team player

   These roll up into a holistic **overall fit score (1–100)** and a
   recommendation (strong yes / yes / maybe / no).
4. **Compare** — the Compare tab lays out every assessed candidate side by side,
   sorted by overall fit.

## Tech

- **Next.js 14** (App Router) full-stack — React UI + API routes
- **Claude** (`claude-opus-4-8` by default) via the Anthropic SDK, using
  structured outputs for reliable scoring
- **SQLite** via **Prisma** for local persistence

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
#   then edit .env and set ANTHROPIC_API_KEY=sk-ant-...

# 3. Create the local database
npm run db:push

# 4. Run it
npm run dev
```

Open http://localhost:3000.

## Configuration

| Env var             | Default            | Purpose                                          |
| ------------------- | ------------------ | ------------------------------------------------ |
| `ANTHROPIC_API_KEY` | _(required)_       | Powers JD curation and candidate assessment.     |
| `ASSESSMENT_MODEL`  | `claude-opus-4-8`  | Model used. Set to `claude-sonnet-4-6` for lower cost. |
| `DATABASE_URL`      | `file:./dev.db`    | SQLite database location.                        |

## Notes

- Resume/notes can always be pasted as text; file upload supports **PDF, DOCX,
  TXT, and MD**. Legacy `.doc` isn't supported — convert to `.docx`/`.pdf`.
- Editing a candidate's assets clears their prior assessment so it can be re-run.
- All data lives in the local SQLite file — nothing is sent anywhere except the
  candidate/role text sent to the Anthropic API for scoring.
