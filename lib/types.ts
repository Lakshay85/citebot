export type Article = { id: string; title: string; body: string };

export type Workspace = {
  id: string;
  name: string;
  tagline: string;
  company: string;
  articles: Article[];
};

export type Chunk = {
  id: string; // stable id, e.g. "lumen/billing-plans#0"
  workspaceId: string;
  articleId: string;
  title: string;
  text: string;
  vector?: number[];
};

export type Citation = {
  n: number;
  chunkId: string;
  title: string;
  snippet: string;
  score: number;
};

export type Usage = {
  promptTokens: number;
  completionTokens: number;
  costUsdListPrice: number;
};

export type Answer = {
  status: "answered" | "handoff";
  answer: string;
  citations: Citation[];
  confidence: number;
  reason?: string;
  usage: Usage;
  latencyMs: number;
};

export type ChatTurn = { role: "user" | "assistant"; content: string };
