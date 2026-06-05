// Extract plain text from an uploaded file (PDF, DOCX, or plain text).
// Runs server-side only. Libraries are imported dynamically so they never end
// up in a client bundle and import-time side effects are avoided.

export async function extractText(
  buffer: Buffer,
  filename: string,
): Promise<string> {
  const lower = filename.toLowerCase();

  if (lower.endsWith(".pdf")) {
    // Import the implementation directly to avoid pdf-parse's index.js debug
    // harness, which tries to read a sample file on load.
    const pdfParse = (await import("pdf-parse/lib/pdf-parse.js")).default as (
      data: Buffer,
    ) => Promise<{ text: string }>;
    const result = await pdfParse(buffer);
    return result.text.trim();
  }

  if (lower.endsWith(".docx")) {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return result.value.trim();
  }

  if (lower.endsWith(".txt") || lower.endsWith(".md")) {
    return buffer.toString("utf-8").trim();
  }

  if (lower.endsWith(".doc")) {
    throw new Error(
      "Legacy .doc files aren't supported — please convert to .docx or .pdf, or paste the text directly.",
    );
  }

  // Best-effort: treat unknown types as UTF-8 text.
  return buffer.toString("utf-8").trim();
}
