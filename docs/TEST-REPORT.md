# Test report
**Automated:** `npm test` (vitest): 2 files, 27 tests, all passing (15 unit: chunking, retrieval, validation, rate limiter; 12 integration: handleChat/RAG pipeline with stubbed LLM and embeddings covering answer, low-retrieval handoff, low-confidence handoff, invalid-citation handoff, custom docs, bad input).
**Types:** `tsc --noEmit` clean. **Build:** `next build` passes.
**Evals (live Groq + Gemini):** 20 questions. Overall 90%, answer accuracy 85.7%, citation accuracy 100%, correct handoff 100%, false handoff 0%, avg cost $0.000158/answer. Misses: l4 and f2, both caused by strict `mustMatch` regexes on a correct-looking answer; not tuned.
**Smoke test on production (Nov 24 2026):** /, /demo, /evals return 200; refund question answered with citation; world-cup and prompt-injection questions handed off.
**Known gap:** evals run against the live free tier; results can vary slightly run to run.
