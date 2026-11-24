import type { Chunk } from "./types";

const STOP = new Set(
  "a an and are as at be by can do does for from has have how i if in is it its my of on or our so that the their then there this to was we what when where which who will with you your".split(
    " ",
  ),
);

export function tokenize(s: string): string[] {
  return (s.toLowerCase().match(/[a-z0-9$%][a-z0-9.$%_-]*/g) ?? [])
    .map((t) => t.replace(/[.-]+$/g, ""))
    .filter((t) => t.length > 1 && !STOP.has(t))
    .map(stem);
}

function stem(t: string): string {
  if (t.length > 4 && t.endsWith("ies")) return t.slice(0, -3) + "y";
  if (t.length > 4 && t.endsWith("ing")) return t.slice(0, -3);
  if (t.length > 3 && t.endsWith("es")) return t.slice(0, -2);
  if (t.length > 3 && t.endsWith("s")) return t.slice(0, -1);
  return t;
}

export function cosine(a: number[], b: number[]): number {
  let dot = 0,
    na = 0,
    nb = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return na && nb ? dot / (Math.sqrt(na) * Math.sqrt(nb)) : 0;
}

/** Okapi BM25 over the supplied chunks. Returns a score per chunk, same order. */
export function bm25(query: string, chunks: Chunk[], k1 = 1.5, b = 0.75): number[] {
  const docs = chunks.map((c) => tokenize(`${c.title} ${c.text}`));
  const N = docs.length || 1;
  const avg = docs.reduce((s, d) => s + d.length, 0) / N || 1;
  const df = new Map<string, number>();
  for (const d of docs) for (const t of new Set(d)) df.set(t, (df.get(t) ?? 0) + 1);
  const q = [...new Set(tokenize(query))];
  return docs.map((d) => {
    const tf = new Map<string, number>();
    for (const t of d) tf.set(t, (tf.get(t) ?? 0) + 1);
    let score = 0;
    for (const t of q) {
      const f = tf.get(t) ?? 0;
      if (!f) continue;
      const n = df.get(t) ?? 0;
      const idf = Math.log(1 + (N - n + 0.5) / (n + 0.5));
      score += (idf * f * (k1 + 1)) / (f + k1 * (1 - b + (b * d.length) / avg));
    }
    return score;
  });
}

export type Scored = { chunk: Chunk; score: number; dense: number; lexical: number };

/**
 * Hybrid retrieval: reciprocal-rank fusion of dense cosine and BM25.
 * `dense` is the raw cosine of the best signal and is what the handoff gate uses.
 */
export function hybridSearch(query: string, queryVec: number[] | null, chunks: Chunk[], k = 4): Scored[] {
  const lex = bm25(query, chunks);
  const dense = chunks.map((c) => (queryVec && c.vector ? cosine(queryVec, c.vector) : 0));
  const rank = (vals: number[]) => {
    const order = vals.map((v, i) => [v, i] as const).sort((a, b) => b[0] - a[0]);
    const r = new Array<number>(vals.length);
    order.forEach(([, i], pos) => (r[i] = pos + 1));
    return r;
  };
  const rl = rank(lex);
  const rd = queryVec ? rank(dense) : null;
  const scored = chunks.map((chunk, i) => {
    const fused = 1 / (60 + rl[i]) + (rd ? 1 / (60 + rd[i]) : 0);
    return { chunk, score: fused, dense: dense[i], lexical: lex[i] };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, k);
}
