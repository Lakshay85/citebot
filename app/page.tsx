import Link from "next/link";
import results from "@/data/eval-results.json";

const s = results.summary;

function Stat({ big, label }: { big: string; label: string }) {
  return (
    <div className="rounded-2xl border border-line bg-panel p-5">
      <div className="text-3xl font-semibold tracking-tight text-accent">{big}</div>
      <div className="mt-1 text-xs text-muted">{label}</div>
    </div>
  );
}

const STEPS = [
  ["1. Chunk and embed", "Help articles are split into paragraph-aligned chunks and embedded once (Gemini embeddings, free tier). Uploaded docs are embedded on upload."],
  ["2. Hybrid retrieval", "Each question is matched by dense cosine similarity and BM25 keyword scoring, then merged with reciprocal rank fusion. Exact terms like plan names and error codes still win."],
  ["3. Gate before the LLM", "If even the best chunk is a weak match, the bot hands off without spending a token on the model."],
  ["4. Grounded answer", "Groq runs gpt-oss-120b with the top 4 chunks. It must return JSON with citations and a confidence score."],
  ["5. Gate after the LLM", "No valid citation, low confidence, or 'not in sources' all route to a human with the closest articles attached."],
];

export default function Home() {
  return (
    <main>
      <section className="glow">
        <div className="mx-auto max-w-4xl px-5 pb-20 pt-24 text-center">
          <span className="rounded-full border border-line px-3 py-1 text-xs text-muted">Portfolio case study · AI support copilot</span>
          <h1 className="mt-6 text-5xl font-semibold leading-tight tracking-tight sm:text-6xl">
            Support answers <span className="text-accent">with receipts.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted">
            Citebot answers customer questions from your help docs, cites the exact passage, and hands off to a human the moment it is not sure. It publishes its own accuracy and cost numbers.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link href="/demo" className="rounded-full bg-accent px-6 py-3 text-sm font-medium text-black hover:brightness-110">Try the live demo</Link>
            <Link href="/evals" className="rounded-full border border-line px-6 py-3 text-sm hover:border-accent">See the eval results</Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5">
        <h2 className="mb-6 text-sm uppercase tracking-widest text-muted">Result, measured on a scored test set ({s.total} questions)</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Stat big={`${s.overall}%`} label="questions handled correctly overall" />
          <Stat big={`${s.citationAccuracy}%`} label="answers citing the right article" />
          <Stat big={`${s.correctHandoffRate}%`} label="out-of-scope and adversarial questions handed off" />
          <Stat big={`$${s.avgCostPerAnswerUsd.toFixed(5)}`} label="average cost per answer at list price ($0 on free tier)" />
        </div>
      </section>

      <section className="mx-auto mt-20 grid max-w-5xl gap-10 px-5 md:grid-cols-2">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">The problem</h2>
          <p className="mt-3 text-muted">Support teams answer the same 20 questions all day, and generic chatbots answer confidently even when they are wrong. A wrong refund policy costs more than a slow reply. The hard part is not generating an answer, it is knowing when not to.</p>
        </div>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">What I built</h2>
          <p className="mt-3 text-muted">A multi-workspace RAG assistant with inline citations, a three-stage confidence gate, human handoff, bring-your-own-docs upload, and an eval harness that scores every change against a fixed test set including out-of-scope and prompt-injection questions.</p>
        </div>
      </section>

      <section id="how" className="mx-auto mt-20 max-w-5xl px-5">
        <h2 className="text-2xl font-semibold tracking-tight">Architecture</h2>
        <div className="mt-6 grid gap-3 md:grid-cols-5">
          {STEPS.map(([t, d]) => (
            <div key={t} className="rounded-xl border border-line bg-panel p-4">
              <div className="text-sm font-medium text-accent">{t}</div>
              <p className="mt-2 text-xs leading-relaxed text-muted">{d}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 font-mono text-xs text-muted">Next.js App Router · TypeScript · Groq (gpt-oss-120b) · Gemini embeddings (NVIDIA NIM switchable) · Vercel · Vitest</p>
      </section>

      <section className="mx-auto mt-20 grid max-w-5xl gap-6 px-5 md:grid-cols-3">
        {[
          ["Why hybrid retrieval", "Dense search finds meaning, BM25 finds exact tokens such as $99, 429 and SAML. Fusing the two beat either alone on the plan-and-limits questions that dominate real support traffic."],
          ["Why gates, not prompts alone", "A prompt can ask the model to behave. A gate enforces it: weak retrieval, low confidence and uncited answers never reach the customer."],
          ["Cost per answer", `About ${Math.round((s.avgCostPerAnswerUsd) * 1e5) / 1e5} dollars per answered question at Groq list prices, and nothing on the free tier. Handoffs that fail the retrieval gate cost zero model tokens.`],
        ].map(([t, d]) => (
          <div key={t} className="rounded-xl border border-line p-5">
            <h3 className="font-medium">{t}</h3>
            <p className="mt-2 text-sm text-muted">{d}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto mt-20 max-w-5xl px-5">
        <div className="rounded-2xl border border-line bg-panel p-8">
          <h2 className="text-2xl font-semibold tracking-tight">Second act: triage and handoff</h2>
          <p className="mt-3 max-w-3xl text-muted">The handoff is a product surface, not an error. Next step on the roadmap is ticket triage: classify the handed-off question, draft a reply for the agent to approve, and route by topic and urgency, with per-company workspaces and role-based access.</p>
          <div className="mt-6 flex gap-3">
            <Link href="/demo" className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-black">Open the demo</Link>
            <a href="https://github.com/Lakshay85/citebot" target="_blank" rel="noreferrer" className="rounded-full border border-line px-5 py-2.5 text-sm hover:border-accent">Read the code</a>
          </div>
        </div>
      </section>
    </main>
  );
}
