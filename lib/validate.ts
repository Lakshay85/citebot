import type { Chunk, ChatTurn } from "./types";

export const LIMITS = {
  question: 600,
  history: 6,
  historyChars: 1200,
  uploadBytes: 120_000,
  uploadChunks: 40,
  customChunksPerRequest: 60,
  chunkChars: 1600,
};

export class ValidationError extends Error {}

export function cleanQuestion(q: unknown): string {
  if (typeof q !== "string") throw new ValidationError("question must be a string");
  // strip control characters, collapse whitespace
  const s = q.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").replace(/\s+/g, " ").trim();
  if (!s) throw new ValidationError("question is empty");
  if (s.length > LIMITS.question) throw new ValidationError(`question exceeds ${LIMITS.question} characters`);
  return s;
}

export function cleanHistory(h: unknown): ChatTurn[] {
  if (h === undefined || h === null) return [];
  if (!Array.isArray(h)) throw new ValidationError("history must be an array");
  return h
    .slice(-LIMITS.history)
    .filter((t): t is ChatTurn => !!t && (t.role === "user" || t.role === "assistant") && typeof t.content === "string")
    .map((t) => ({ role: t.role, content: t.content.slice(0, LIMITS.historyChars) }));
}

export function cleanCustomChunks(c: unknown): Chunk[] {
  if (c === undefined || c === null) return [];
  if (!Array.isArray(c)) throw new ValidationError("customChunks must be an array");
  if (c.length > LIMITS.customChunksPerRequest) throw new ValidationError("too many custom chunks");
  return c.map((x, i) => {
    if (!x || typeof x.text !== "string" || typeof x.title !== "string") throw new ValidationError("bad chunk");
    const vector = Array.isArray(x.vector) && x.vector.length <= 2048 && x.vector.every((n: unknown) => typeof n === "number" && Number.isFinite(n)) ? (x.vector as number[]) : undefined;
    return {
      id: `custom/${String(x.articleId ?? "upload").slice(0, 40).replace(/[^a-z0-9_-]/gi, "-")}#${i}`,
      workspaceId: "custom",
      articleId: String(x.articleId ?? "upload").slice(0, 40),
      title: x.title.slice(0, 120),
      text: x.text.slice(0, LIMITS.chunkChars),
      vector,
    };
  });
}

/** Naive in-memory sliding-window rate limiter. Best effort on serverless (per instance). */
const hits = new Map<string, number[]>();
export function rateLimited(key: string, max = 20, windowMs = 60_000, now = Date.now()): boolean {
  const arr = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (arr.length >= max) {
    hits.set(key, arr);
    return true;
  }
  arr.push(now);
  hits.set(key, arr);
  if (hits.size > 5000) hits.clear();
  return false;
}
