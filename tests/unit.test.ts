import { describe, it, expect } from "vitest";
import { chunkArticle } from "../lib/chunk";
import { bm25, cosine, hybridSearch, tokenize } from "../lib/retrieval";
import { cleanCustomChunks, cleanHistory, cleanQuestion, rateLimited, ValidationError } from "../lib/validate";
import { parseModelJson } from "../lib/rag";
import { listPriceUsd } from "../lib/llm";
import { seedChunks } from "../lib/corpus";

describe("chunking", () => {
  it("keeps short articles as one chunk with stable ids", () => {
    const c = chunkArticle("w", { id: "a", title: "T", body: "Short body." });
    expect(c).toHaveLength(1);
    expect(c[0].id).toBe("w/a#0");
  });
  it("splits long text under the size limit", () => {
    const body = Array.from({ length: 60 }, (_, i) => `Sentence number ${i} is here.`).join(" ");
    const c = chunkArticle("w", { id: "a", title: "T", body });
    expect(c.length).toBeGreaterThan(1);
    expect(Math.max(...c.map((x) => x.text.length))).toBeLessThan(1300);
  });
  it("seeds all three workspaces", () => {
    expect(seedChunks("lumen").length).toBeGreaterThan(5);
    expect(new Set(seedChunks().map((c) => c.workspaceId)).size).toBe(3);
  });
});

describe("retrieval", () => {
  it("tokenizes prices and drops stop words", () => {
    expect(tokenize("What is the $99 plan?")).toContain("$99");
    expect(tokenize("What is the plan")).not.toContain("the");
  });
  it("cosine is 1 for identical vectors and 0 for orthogonal", () => {
    expect(cosine([1, 2], [1, 2])).toBeCloseTo(1);
    expect(cosine([1, 0], [0, 1])).toBe(0);
  });
  it("BM25 ranks the SSO article first for an SSO question", () => {
    const chunks = seedChunks("lumen");
    const scores = bm25("Which plan has SSO and SAML?", chunks);
    const best = scores.indexOf(Math.max(...scores));
    expect(chunks[best].articleId).toBe("sso-saml");
  });
  it("hybrid search works without vectors (lexical fallback)", () => {
    const top = hybridSearch("how long are return labels valid", null, seedChunks("parcelo"), 2);
    expect(top[0].chunk.articleId).toBe("returns");
  });
});

describe("validation and security", () => {
  it("rejects empty, non-string and oversized questions", () => {
    expect(() => cleanQuestion("   ")).toThrow(ValidationError);
    expect(() => cleanQuestion(42)).toThrow(ValidationError);
    expect(() => cleanQuestion("x".repeat(601))).toThrow(ValidationError);
  });
  it("strips control characters", () => {
    expect(cleanQuestion("hi\u0000 there\u0007")).toBe("hi there");
  });
  it("limits and filters history roles", () => {
    const h = cleanHistory([{ role: "system", content: "evil" }, ...Array.from({ length: 10 }, () => ({ role: "user", content: "q" }))]);
    expect(h.length).toBeLessThanOrEqual(6);
    expect(h.every((t) => t.role === "user" || t.role === "assistant")).toBe(true);
  });
  it("sanitizes custom chunk ids and rejects malformed vectors", () => {
    const [c] = cleanCustomChunks([{ articleId: "../../etc/passwd", title: "t", text: "x", vector: [1, "a"] }]);
    expect(c.id).not.toContain("/etc");
    expect(c.vector).toBeUndefined();
  });
  it("rate limiter blocks after the max and resets after the window", () => {
    const k = "t" + Math.random();
    for (let i = 0; i < 3; i++) expect(rateLimited(k, 3, 1000, 1000)).toBe(false);
    expect(rateLimited(k, 3, 1000, 1500)).toBe(true);
    expect(rateLimited(k, 3, 1000, 2600)).toBe(false);
  });
});

describe("model output parsing and pricing", () => {
  it("parses JSON wrapped in prose", () => {
    const p = parseModelJson('Sure: {"answerable":true,"answer":"A [1]","citations":[1],"confidence":0.9}');
    expect(p?.answerable).toBe(true);
    expect(p?.citations).toEqual([1]);
  });
  it("returns null on garbage and clamps confidence", () => {
    expect(parseModelJson("nope")).toBeNull();
    expect(parseModelJson('{"answerable":true,"answer":"a","citations":[],"confidence":7}')?.confidence).toBe(1);
  });
  it("computes list-price cost", () => {
    expect(listPriceUsd(1_000_000, 0)).toBeCloseTo(0.15);
    expect(listPriceUsd(0, 1_000_000)).toBeCloseTo(0.6);
  });
});
