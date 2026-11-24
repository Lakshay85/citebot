import { WORKSPACES } from "./workspaces";
import { chunkArticle } from "./chunk";
import type { Chunk } from "./types";
import indexJson from "../data/index.json";

type IndexFile = { provider: string; dims: number; vectors: Record<string, number[]> };
const index = indexJson as unknown as IndexFile;

export function seedChunks(workspaceId?: string): Chunk[] {
  return WORKSPACES.filter((w) => !workspaceId || w.id === workspaceId)
    .flatMap((w) => w.articles.flatMap((a) => chunkArticle(w.id, a)))
    .map((c) => ({ ...c, vector: index.vectors[c.id] }));
}

export const INDEX_PROVIDER = index.provider;
