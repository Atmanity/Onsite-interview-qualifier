import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assessCandidate } from "@/lib/anthropic";
import { parseSpec, serializeCandidate } from "@/lib/serialize";

export const runtime = "nodejs";
// Assessment calls the model with adaptive thinking; give it room to run.
export const maxDuration = 300;

// POST /api/candidates/:id/assess — run (or re-run) the fit assessment.
export async function POST(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const candidate = await prisma.candidate.findUnique({
    where: { id: params.id },
    include: { role: true },
  });

  if (!candidate) {
    return NextResponse.json({ error: "Candidate not found." }, { status: 404 });
  }

  try {
    const spec = parseSpec(candidate.role);
    const assessment = await assessCandidate({
      spec,
      name: candidate.name,
      resumeText: candidate.resumeText,
      callNotes: candidate.callNotes,
    });

    const updated = await prisma.candidate.update({
      where: { id: candidate.id },
      data: {
        assessment: JSON.stringify(assessment),
        status: "done",
        error: null,
      },
    });

    return NextResponse.json(serializeCandidate(updated));
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Assessment failed.";
    const updated = await prisma.candidate.update({
      where: { id: candidate.id },
      data: { status: "error", error: message },
    });
    return NextResponse.json(
      { ...serializeCandidate(updated), error: message },
      { status: 500 },
    );
  }
}
