import { answerQuestion } from "./rag";
import { groqChat } from "./llm";
import { embedTexts } from "./embed";
import { seedChunks } from "./corpus";
import { WORKSPACE_BY_ID } from "./workspaces";
import { cleanCustomChunks, cleanHistory, cleanQuestion, ValidationError } from "./validate";
import type { Answer } from "./types";

import type { RagDeps } from "./rag";
export const liveDeps: RagDeps = {
  llm: groqChat,
  embedQuery: async (q: string) => (await embedTexts([q], "query"))[0] ?? null,
};

export async function handleChat(body: any, deps: RagDeps = liveDeps): Promise<Answer> {
  if (!body || typeof body !== "object") throw new ValidationError("invalid body");
  const question = cleanQuestion(body.question);
  const history = cleanHistory(body.history);
  const workspaceId = typeof body.workspaceId === "string" ? body.workspaceId : "";
  let corpus;
  if (workspaceId === "custom") {
    corpus = cleanCustomChunks(body.customChunks);
    if (!corpus.length) throw new ValidationError("upload a document first");
  } else if (WORKSPACE_BY_ID[workspaceId]) {
    corpus = seedChunks(workspaceId);
  } else throw new ValidationError("unknown workspace");
  return answerQuestion(question, history, corpus, deps);
}
