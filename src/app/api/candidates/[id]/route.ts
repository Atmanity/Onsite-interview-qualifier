import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeCandidate } from "@/lib/serialize";

export const runtime = "nodejs";

// PATCH /api/candidates/:id — edit a candidate's name or assets. Editing the
// assets clears the stale assessment so it can be re-run.
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  let body: { name?: string; resumeText?: string; callNotes?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  if (typeof body.name === "string") data.name = body.name.trim();
  if (typeof body.resumeText === "string") data.resumeText = body.resumeText.trim();
  if (typeof body.callNotes === "string") data.callNotes = body.callNotes.trim();

  if ("resumeText" in data || "callNotes" in data) {
    // Assets changed — any prior assessment is now stale.
    data.assessment = null;
    data.status = "pending";
    data.error = null;
  }

  try {
    const candidate = await prisma.candidate.update({
      where: { id: params.id },
      data,
    });
    return NextResponse.json(serializeCandidate(candidate));
  } catch {
    return NextResponse.json({ error: "Candidate not found." }, { status: 404 });
  }
}

// DELETE /api/candidates/:id
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  try {
    await prisma.candidate.delete({ where: { id: params.id } });
  } catch {
    return NextResponse.json({ error: "Candidate not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
