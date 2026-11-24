import { NextResponse } from "next/server";
import { chunkArticle } from "@/lib/chunk";
import { embedTexts } from "@/lib/embed";
import { LIMITS, rateLimited, ValidationError } from "@/lib/validate";

export const maxDuration = 30;

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (rateLimited(`ingest:${ip}`, 6)) return NextResponse.json({ error: "Too many uploads. Try again in a minute." }, { status: 429 });
  try {
    const text = await req.text();
    if (text.length > LIMITS.uploadBytes * 1.5) throw new ValidationError("File too large (max ~120 KB)");
    const body = JSON.parse(text);
    const name = typeof body.name === "string" ? body.name.replace(/[^\w .-]/g, "").slice(0, 80) || "Uploaded document" : "Uploaded document";
    const content = typeof body.text === "string" ? body.text.replace(/\u0000/g, "") : "";
    if (content.trim().length < 40) throw new ValidationError("Document is empty or too short");
    if (content.length > LIMITS.uploadBytes) throw new ValidationError("File too large (max ~120 KB)");
    const articleId = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40) || "upload";
    const chunks = chunkArticle("custom", { id: articleId, title: name, body: content }).slice(0, LIMITS.uploadChunks);
    const vectors = await embedTexts(chunks.map((c) => `${c.title}\n${c.text}`), "document").catch(() => [] as number[][]);
    return NextResponse.json({
      chunks: chunks.map((c, i) => ({ articleId: c.articleId, title: c.title, text: c.text, vector: vectors[i]?.map((n) => Math.round(n * 1e4) / 1e4) })),
      embedded: vectors.length === chunks.length,
    });
  } catch (e) {
    if (e instanceof ValidationError) return NextResponse.json({ error: e.message }, { status: 400 });
    if (e instanceof SyntaxError) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    console.error("ingest error", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "Could not process the document." }, { status: 502 });
  }
}
