export type LlmMessage = { role: "system" | "user" | "assistant"; content: string };
export type LlmResult = { text: string; promptTokens: number; completionTokens: number };

// Groq list price for openai/gpt-oss-120b, USD per 1M tokens. Used only to show
// what an answer WOULD cost on a paid plan; the demo itself runs on the free tier.
export const PRICE_IN_PER_M = 0.15;
export const PRICE_OUT_PER_M = 0.6;

export function listPriceUsd(promptTokens: number, completionTokens: number): number {
  return (promptTokens * PRICE_IN_PER_M + completionTokens * PRICE_OUT_PER_M) / 1_000_000;
}

export type LlmFn = (messages: LlmMessage[]) => Promise<LlmResult>;

export const groqChat: LlmFn = async (messages) => {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("GROQ_API_KEY missing");
  const model = process.env.GROQ_MODEL ?? "openai/gpt-oss-120b";
  let lastErr: unknown;
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.1,
          max_tokens: 700,
          reasoning_effort: "low",
          response_format: { type: "json_object" },
        }),
        signal: AbortSignal.timeout(25000),
      });
      if (res.status === 429 || res.status >= 500) {
        lastErr = new Error(`Groq HTTP ${res.status}`);
        const ra = Number(res.headers.get("retry-after"));
        await new Promise((r) => setTimeout(r, Math.min(8000, Number.isFinite(ra) && ra > 0 ? ra * 1000 : 800 * (attempt + 1))));
        continue;
      }
      if (!res.ok) throw new Error(`Groq HTTP ${res.status}`);
      const json = await res.json();
      return {
        text: json.choices?.[0]?.message?.content ?? "",
        promptTokens: json.usage?.prompt_tokens ?? 0,
        completionTokens: json.usage?.completion_tokens ?? 0,
      };
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("LLM request failed");
};
