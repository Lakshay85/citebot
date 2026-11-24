import type { Article, Chunk } from "./types";

const MAX_CHARS = 900;

/** Split an article into paragraph-aligned chunks of at most ~900 characters. */
export function chunkArticle(workspaceId: string, article: Article): Chunk[] {
  const paragraphs = article.body
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  const pieces: string[] = [];
  let current = "";
  for (const p of paragraphs) {
    if (current && current.length + p.length + 2 > MAX_CHARS) {
      pieces.push(current);
      current = p;
    } else {
      current = current ? `${current}\n\n${p}` : p;
    }
  }
  if (current) pieces.push(current);

  // Hard-split any single paragraph that is still too long, on sentence boundaries.
  const final: string[] = [];
  for (const piece of pieces) {
    if (piece.length <= MAX_CHARS * 1.3) {
      final.push(piece);
      continue;
    }
    const sentences = piece.match(/[^.!?]+[.!?]+\s*|[^.!?]+$/g) ?? [piece];
    let buf = "";
    for (const s of sentences) {
      if (buf && buf.length + s.length > MAX_CHARS) {
        final.push(buf.trim());
        buf = s;
      } else buf += s;
    }
    if (buf.trim()) final.push(buf.trim());
  }

  return final.map((text, i) => ({
    id: `${workspaceId}/${article.id}#${i}`,
    workspaceId,
    articleId: article.id,
    title: article.title,
    text,
  }));
}
