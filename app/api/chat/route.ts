import { NextResponse } from "next/server";
import { handleChat } from "@/lib/service";
import { rateLimited, ValidationError } from "@/lib/validate";

export const maxDuration = 30;

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (rateLimited(`chat:${ip}`, 20)) return NextResponse.json({ error: "Too many requests. Try again in a minute." }, { status: 429 });
  let body: unknown;
  try {
    const text = await req.text();
    if (text.length > 400_000) return NextResponse.json({ error: "Request too large" }, { status: 413 });
    body = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  try {
    return NextResponse.json(await handleChat(body));
  } catch (e) {
    if (e instanceof ValidationError) return NextResponse.json({ error: e.message }, { status: 400 });
    console.error("chat error", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "The assistant is temporarily unavailable. Please try again." }, { status: 502 });
  }
}
