/**
 * Embeddings with a provider switch. Both options are free tier.
 *  - gemini  : gemini-embedding-001 (768 dims)
 *  - nvidia  : nvidia/nv-embedqa-e5-v5 via NVIDIA NIM (1024 dims)
 * The vector index shipped in data/index.json records which provider built it;
 * queries must use the same provider.
 */
export type EmbedKind = "query" | "document";

export function embedProvider(): "gemini" | "nvidia" {
  return process.env.EMBED_PROVIDER === "nvidia" ? "nvidia" : "gemini";
}

async function fetchJson(url: string, init: RequestInit, retries = 3): Promise<any> {
  let lastErr: unknown;
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url, { ...init, signal: AbortSignal.timeout(20000) });
      if (res.ok) return await res.json();
      if (res.status === 429 || res.status >= 500) {
        await new Promise((r) => setTimeout(r, 600 * (i + 1)));
        lastErr = new Error(`HTTP ${res.status}`);
        continue;
      }
      throw new Error(`HTTP ${res.status}`);
    } catch (e) {
      lastErr = e;
      await new Promise((r) => setTimeout(r, 400 * (i + 1)));
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("embedding request failed");
}

export async function embedTexts(texts: string[], kind: EmbedKind): Promise<number[][]> {
  if (!texts.length) return [];
  if (embedProvider() === "nvidia") {
    const key = process.env.NVIDIA_API_KEY;
    if (!key) throw new Error("NVIDIA_API_KEY missing");
    const out: number[][] = [];
    for (let i = 0; i < texts.length; i += 32) {
      const json = await fetchJson("https://integrate.api.nvidia.com/v1/embeddings", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "nvidia/nv-embedqa-e5-v5",
          input: texts.slice(i, i + 32),
          input_type: kind === "query" ? "query" : "passage",
          truncate: "END",
        }),
      });
      out.push(...json.data.map((d: any) => d.embedding as number[]));
    }
    return out;
  }
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY missing");
  const out: number[][] = [];
  for (let i = 0; i < texts.length; i += 50) {
    const batch = texts.slice(i, i + 50);
    const json = await fetchJson(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:batchEmbedContents",
      {
        method: "POST",
        headers: { "x-goog-api-key": key, "Content-Type": "application/json" },
        body: JSON.stringify({
          requests: batch.map((t) => ({
            model: "models/gemini-embedding-001",
            content: { parts: [{ text: t }] },
            taskType: kind === "query" ? "RETRIEVAL_QUERY" : "RETRIEVAL_DOCUMENT",
            outputDimensionality: 768,
          })),
        }),
      },
    );
    out.push(...json.embeddings.map((e: any) => e.values as number[]));
  }
  return out;
}
