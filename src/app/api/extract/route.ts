import { NextResponse } from "next/server";
import { extractText } from "@/lib/extract";

export const runtime = "nodejs";

// POST /api/extract — multipart upload of a resume / notes file -> plain text.
export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  if (file.size > 15 * 1024 * 1024) {
    return NextResponse.json(
      { error: "File is too large (max 15MB)." },
      { status: 400 },
    );
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const text = await extractText(buffer, file.name);
    if (!text) {
      return NextResponse.json(
        { error: "Couldn't extract any text from that file." },
        { status: 422 },
      );
    }
    return NextResponse.json({ text, filename: file.name });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to read file.";
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
