import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeCandidate } from "@/lib/serialize";

export const runtime = "nodejs";

// POST /api/candidates — add a candidate to a role.
export async function POST(req: Request) {
  let body: {
    roleId?: string;
    name?: string;
    resumeText?: string;
    callNotes?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const roleId = (body.roleId || "").trim();
  const name = (body.name || "").trim();
  const resumeText = (body.resumeText || "").trim();
  const callNotes = (body.callNotes || "").trim();

  if (!roleId) {
    return NextResponse.json({ error: "roleId is required." }, { status: 400 });
  }
  if (!name) {
    return NextResponse.json(
      { error: "A candidate name is required." },
      { status: 400 },
    );
  }
  if (!resumeText && !callNotes) {
    return NextResponse.json(
      { error: "Provide at least a resume or intro call notes." },
      { status: 400 },
    );
  }

  const role = await prisma.role.findUnique({ where: { id: roleId } });
  if (!role) {
    return NextResponse.json({ error: "Role not found." }, { status: 404 });
  }

  const candidate = await prisma.candidate.create({
    data: { roleId, name, resumeText, callNotes },
  });

  return NextResponse.json(serializeCandidate(candidate), { status: 201 });
}
