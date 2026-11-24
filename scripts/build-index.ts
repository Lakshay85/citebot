// Precompute embeddings for the seeded help centers: npx tsx scripts/build-index.ts
import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { WORKSPACES } from "../lib/workspaces";
import { chunkArticle } from "../lib/chunk";
import { embedTexts, embedProvider } from "../lib/embed";

for (const f of [".env.local"]) {
  if (existsSync(f)) for (const l of readFileSync(f, "utf8").split("\n")) { const m = l.match(/^([A-Z_]+)=(.*)$/); if (m && !process.env[m[1]]) process.env[m[1]] = m[2]; }
}

async function main() {
  const chunks = WORKSPACES.flatMap((w) => w.articles.flatMap((a) => chunkArticle(w.id, a)));
  const vecs = await embedTexts(chunks.map((c) => `${c.title}\n${c.text}`), "document");
  const vectors: Record<string, number[]> = {};
  chunks.forEach((c, i) => (vectors[c.id] = vecs[i].map((n) => Math.round(n * 1e5) / 1e5)));
  writeFileSync("data/index.json", JSON.stringify({ provider: embedProvider(), dims: vecs[0].length, vectors }));
  console.log(`indexed ${chunks.length} chunks with ${embedProvider()} (${vecs[0].length} dims)`);
}
main();
