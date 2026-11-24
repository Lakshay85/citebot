# Citebot

**Ask your docs. Get a cited answer, or a human.** A multi-tenant RAG support bot: each company workspace has its own help center, every answer carries inline citations, and anything the bot can't ground goes to a human with context attached.

Live demo: https://citebot-ecru.vercel.app  |  Eval page: /evals  |  Case study: /

## Problem
Support teams answer the same doc questions all day. Generic chatbots hallucinate policy (refund windows, plan limits) and nobody can tell which answer is made up. The cost of one wrong answer is higher than the cost of a handoff.

## Result
On a 20-question scored set (answerable, unanswerable, adversarial) across 3 fictional workspaces: **90% overall, 100% citation accuracy, 100% correct handoff on unanswerable/adversarial questions, 0% false handoffs, about $0.00016 per answer at Groq list price**. Two answerable cases missed because of strict regex checks; they are left in, not tuned away. Raw results: `data/eval-results.json`.

## Architecture
```
question -> sanitize/limits -> hybrid retrieval (BM25 + Gemini embeddings, RRF)
         -> gate 1: dense similarity floor
         -> LLM (Groq gpt-oss-120b) returns JSON {answerable, confidence, answer, cites}
         -> gate 2: answerable && confidence >= 0.6
         -> gate 3: citations must reference retrieved chunks
         -> answer with [n] citations  OR  human handoff packet
```
- Next.js (App Router) + TypeScript, deployed on Vercel. No database: seeded indexes are prebuilt JSON; uploaded docs are chunked and embedded per request, never stored.
- Workspaces: `lumen`, `parcelo`, `fernwood` (7 articles each) plus "upload your own".
- Pages: `/` case study, `/demo` chat, `/evals` scored test set.

## Why this approach
Three independent gates make "I don't know" the default. Hybrid retrieval catches exact terms (plan names, error codes) that embeddings blur. Free tiers only: Groq for generation, Gemini `gemini-embedding-001` (768d) for embeddings. NVIDIA NIM embeddings are supported (`EMBED_PROVIDER=nvidia`) but were not used in the demo.

## Cost per answer
About 1.1k input + 150 output tokens per answer: ~$0.00016 at $0.15/$0.60 per M tokens. Running cost today: $0 (free tiers). Groq free tier is 8,000 tokens/min, so heavy concurrent use will hit 429s; the app retries once and then hands off.

## Second act: ticket triage + human handoff
The handoff packet (question, closest articles, confidence) is the seed of a triage layer: classify, route, prefill a reply for the agent. Not built yet; it is the next step.

## Run it
```
npm i --legacy-peer-deps
cp .env.example .env.local   # GROQ_API_KEY, GEMINI_API_KEY
npm run index    # rebuild embeddings
npm test         # 27 unit + integration tests
npm run evals    # scored test set (calls live APIs)
npm run dev
```
Docs: `docs/PRD.md`, `docs/BRD.md`, `docs/TEST-REPORT.md`, `docs/SECURITY.md`. Pre-build research: GitHub and free-for-dev were checked for free LLM/embedding tiers and existing RAG templates, plus a portfolio research doc that picked this project.
