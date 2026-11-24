# PRD: Citebot
**Goal:** cut repeat support load without wrong answers.
**Users:** (1) end customers asking help-center questions; (2) support agents receiving handoffs; (3) a company admin who loads docs.
**Requirements**
1. Workspace-scoped Q&A over that workspace's docs only (multi-tenant).
2. Every answer has inline citations that link to a source snippet.
3. If grounding is weak, hand off to a human with context, never guess.
4. Upload your own docs (text/markdown), limits enforced.
5. Eval page: scored test set, cost per answer.
6. Zero paid services.
**Non-goals (v1):** auth, persistence, real ticketing integration, streaming.
**Success metrics:** >=85% answer accuracy, 100% citation validity, 100% handoff on unanswerable, <$0.001/answer.
**Second act:** ticket triage (classify, route, draft reply) on top of the handoff packet.
