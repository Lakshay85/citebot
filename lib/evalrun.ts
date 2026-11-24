import { TESTSET, type EvalCase } from "../evals/testset";
import { answerQuestion, type RagDeps } from "./rag";
import { seedChunks } from "./corpus";
import type { Answer } from "./types";

export type EvalRow = {
  id: string;
  workspaceId: string;
  kind: EvalCase["kind"];
  question: string;
  status: Answer["status"];
  answer: string;
  citedArticles: string[];
  expectArticle: string | null;
  correct: boolean;
  citationCorrect: boolean | null;
  costUsdListPrice: number;
  promptTokens: number;
  completionTokens: number;
  latencyMs: number;
};

export function scoreCase(c: EvalCase, a: Answer): Pick<EvalRow, "correct" | "citationCorrect" | "citedArticles"> {
  const cited = a.citations.map((x) => x.chunkId.split("/")[1]?.split("#")[0] ?? "");
  if (c.expectArticle === null) {
    return { correct: a.status === "handoff", citationCorrect: null, citedArticles: cited };
  }
  const citationCorrect = a.status === "answered" && cited.includes(c.expectArticle);
  const textOk = (c.mustMatch ?? []).every((re) => re.test(a.answer));
  return { correct: a.status === "answered" && citationCorrect && textOk, citationCorrect, citedArticles: cited };
}

export async function runEvals(deps: RagDeps, concurrency = 4): Promise<EvalRow[]> {
  const rows: EvalRow[] = new Array(TESTSET.length);
  let next = 0;
  async function worker() {
    while (next < TESTSET.length) {
      const i = next++;
      const c = TESTSET[i];
      const a = await answerQuestion(c.question, [], seedChunks(c.workspaceId), deps);
      rows[i] = {
        id: c.id, workspaceId: c.workspaceId, kind: c.kind, question: c.question, status: a.status, answer: a.answer,
        expectArticle: c.expectArticle, ...scoreCase(c, a),
        costUsdListPrice: a.usage.costUsdListPrice, promptTokens: a.usage.promptTokens, completionTokens: a.usage.completionTokens, latencyMs: a.latencyMs,
      };
    }
  }
  await Promise.all(Array.from({ length: concurrency }, worker));
  return rows;
}

export function summarize(rows: EvalRow[]) {
  const pct = (n: number, d: number) => (d ? Math.round((n / d) * 1000) / 10 : 0);
  const ans = rows.filter((r) => r.kind === "answerable");
  const un = rows.filter((r) => r.kind !== "answerable");
  const answered = rows.filter((r) => r.status === "answered");
  const totalCost = rows.reduce((s, r) => s + r.costUsdListPrice, 0);
  const lat = rows.map((r) => r.latencyMs).sort((a, b) => a - b);
  return {
    total: rows.length,
    answerAccuracy: pct(ans.filter((r) => r.correct).length, ans.length),
    citationAccuracy: pct(ans.filter((r) => r.citationCorrect).length, ans.length),
    correctHandoffRate: pct(un.filter((r) => r.correct).length, un.length),
    falseHandoffRate: pct(ans.filter((r) => r.status === "handoff").length, ans.length),
    overall: pct(rows.filter((r) => r.correct).length, rows.length),
    avgCostPerAnswerUsd: answered.length ? answered.reduce((s, r) => s + r.costUsdListPrice, 0) / answered.length : 0,
    totalCostUsd: totalCost,
    p50LatencyMs: lat[Math.floor(lat.length / 2)] ?? 0,
    p95LatencyMs: lat[Math.min(lat.length - 1, Math.floor(lat.length * 0.95))] ?? 0,
  };
}
