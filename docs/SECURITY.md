# Security review
## White-box (code review)
- Secrets only in server env vars; never sent to the client (checked: built pages contain no key prefixes). `.env*` is gitignored.
- Input validation (`lib/validate.ts`): question max 600 chars, history and custom chunk counts/sizes capped, body size cap (413), strict JSON parse.
- Per-IP in-memory rate limiter (best effort on serverless; resets per instance).
- Prompt injection: retrieved text is passed as delimited data; the model must return strict JSON; citations must map to retrieved chunk ids else handoff. Uploaded docs are an injection vector; impact is limited to the uploader's own session (no persistence, no tools, no secrets in context).
- No database, no auth, no stored user data, so no cross-tenant data store; workspace ids are whitelisted.
- Headers: CSP, HSTS, X-Frame-Options DENY, nosniff, referrer and permissions policies (next.config.ts).
- Output is rendered as React text, not HTML.
## Black-box (against https://citebot-ecru.vercel.app, Nov 24 2026)
| Test | Result |
|---|---|
| Security headers present | pass |
| Malformed JSON | 400 |
| 5,000-char question | 400 |
| ~3 MB body | 413 |
| GET on /api/chat | 405 |
| 40 rapid requests | first 14 processed, then 429 |
| Unknown workspace | 400 |
| Prompt-injection question | handoff, no prompt leak |
| API key patterns in served HTML | none |
## Residual risks
Rate limiter is per instance; free-tier LLM can be exhausted by a determined caller; the GitHub PAT and Vercel token used for the build should be revoked after the demo.
