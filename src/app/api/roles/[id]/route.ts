import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseSpec, serializeCandidate } from "@/lib/serialize";
import type { RoleDetail } from "@/lib/types";

export const runtime = "nodejs";

// GET /api/roles/:id — full role detail with candidates and assessments.
export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const role = await prisma.role.findUnique({
    where: { id: params.id },
    include: { candidates: { orderBy: { createdAt: "asc" } } },
  });

  if (!role) {
    return NextResponse.json({ error: "Role not found." }, { status: 404 });
  }

  const detail: RoleDetail = {
    id: role.id,
    title: role.title,
    jdText: role.jdText,
    spec: parseSpec(role),
    createdAt: role.createdAt.toISOString(),
    candidates: role.candidates.map(serializeCandidate),
  };

  return NextResponse.json(detail);
}

// DELETE /api/roles/:id — remove a role and its candidates (cascade).
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  try {
    await prisma.role.delete({ where: { id: params.id } });
  } catch {
    return NextResponse.json({ error: "Role not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
