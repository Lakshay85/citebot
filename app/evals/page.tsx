import results from "@/data/eval-results.json";

export const metadata = { title: "Evals | Citebot" };

export default function Evals() {
  const s = results.summary;
  const rows = results.rows;
  const cards: [string, string][] = [
    ["Overall", `${s.overall}%`],
    ["Answer accuracy", `${s.answerAccuracy}%`],
    ["Citation accuracy", `${s.citationAccuracy}%`],
    ["Correct handoffs", `${s.correctHandoffRate}%`],
    ["False handoffs", `${s.falseHandoffRate}%`],
    ["Avg cost / answer", `$${s.avgCostPerAnswerUsd.toFixed(5)}`],
    ["p50 latency", `${(s.p50LatencyMs / 1000).toFixed(1)}s`],
    ["p95 latency", `${(s.p95LatencyMs / 1000).toFixed(1)}s`],
  ];
  return (
    <main className="mx-auto max-w-6xl px-5 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Evals</h1>
      <p className="mt-2 max-w-3xl text-sm text-muted">
        {s.total} fixed questions across three help centers: answerable questions (scored on answer facts and on citing the right article), out-of-scope questions, and prompt-injection or privacy probes (both must be handed off). Last run {new Date(results.ranAt).toUTCString()} on {results.model}. Re-run with <code className="font-mono">npm run evals</code>.
      </p>
      <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        {cards.map(([l, v]) => (
          <div key={l} className="rounded-xl border border-line bg-panel p-4">
            <div className="text-2xl font-semibold text-accent">{v}</div>
            <div className="text-xs text-muted">{l}</div>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-muted">Cost uses Groq list price for gpt-oss-120b ($0.15 per 1M input tokens, $0.60 per 1M output tokens). The demo runs on the free tier, so real spend is $0. Free-tier rate limits (8,000 tokens per minute) are why latency includes retries.</p>
      <div className="mt-8 overflow-x-auto rounded-xl border border-line">
        <table className="w-full text-left text-sm">
          <thead className="bg-panel text-xs uppercase tracking-wide text-muted">
            <tr><th className="p-3">Result</th><th className="p-3">Type</th><th className="p-3">Question</th><th className="p-3">Bot said</th><th className="p-3">Cited</th><th className="p-3 text-right">Cost</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-line align-top">
                <td className="p-3"><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${r.correct ? "bg-good/15 text-good" : "bg-warn/15 text-warn"}`}>{r.correct ? "pass" : "miss"}</span></td>
                <td className="p-3 text-xs text-muted">{r.kind}</td>
                <td className="p-3">{r.question}</td>
                <td className="max-w-md p-3 text-muted">{r.status === "handoff" ? <em>Handed off to a human</em> : r.answer}</td>
                <td className="p-3 font-mono text-xs text-muted">{r.citedArticles.join(", ") || "-"}</td>
                <td className="p-3 text-right font-mono text-xs">${r.costUsdListPrice.toFixed(5)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
