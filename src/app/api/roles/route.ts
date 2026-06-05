import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { curateRole } from "@/lib/anthropic";
import type { RoleListItem } from "@/lib/types";

export const runtime = "nodejs";

// GET /api/roles — list all roles with candidate counts.
export async function GET() {
  const roles = await prisma.role.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { candidates: true } } },
  });

  const items: RoleListItem[] = roles.map((r) => ({
    id: r.id,
    title: r.title,
    createdAt: r.createdAt.toISOString(),
    candidateCount: r._count.candidates,
  }));

  return NextResponse.json(items);
}

// POST /api/roles — curate a JD into a structured role and store it.
export async function POST(req: Request) {
  let body: { jdText?: string; title?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const jdText = (body.jdText || "").trim();
  if (jdText.length < 30) {
    return NextResponse.json(
      { error: "Please paste a fuller job description (at least a few sentences)." },
      { status: 400 },
    );
  }

  try {
    const spec = await curateRole(jdText);
    const role = await prisma.role.create({
      data: {
        title: (body.title?.trim() || spec.title || "Untitled role").slice(0, 200),
        jdText,
        spec: JSON.stringify(spec),
      },
    });
    return NextResponse.json({ id: role.id }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to curate role.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
