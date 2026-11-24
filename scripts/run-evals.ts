// Runs the scored test set against the live pipeline and writes data/eval-results.json
import { writeFileSync, readFileSync, existsSync } from "node:fs";
if (existsSync(".env.local")) for (const l of readFileSync(".env.local", "utf8").split("\n")) { const m = l.match(/^([A-Z_]+)=(.*)$/); if (m && !process.env[m[1]]) process.env[m[1]] = m[2]; }

async function main() {
  const { runEvals, summarize } = await import("../lib/evalrun");
  const { liveDeps } = await import("../lib/service");
  const rows = await runEvals(liveDeps, 1);
  const summary = summarize(rows);
  writeFileSync("data/eval-results.json", JSON.stringify({ ranAt: new Date().toISOString(), model: process.env.GROQ_MODEL, summary, rows }, null, 2));
  console.log(JSON.stringify(summary, null, 2));
  for (const r of rows) if (!r.correct) console.log("MISS", r.id, r.kind, r.status, r.citedArticles.join(","), "|", r.answer.slice(0, 120));
}
main();
