"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Answer, ChatTurn } from "@/lib/types";

type WS = { id: string; name: string; tagline: string; suggestions: string[]; articles: { id: string; title: string }[] };
type Msg = { role: "user" | "assistant"; content: string; answer?: Answer; error?: boolean };
type CustomChunk = { articleId: string; title: string; text: string; vector?: number[] };

export default function Chat({ workspaces }: { workspaces: WS[] }) {
  const [wsId, setWsId] = useState(workspaces[0].id);
  const [msgs, setMsgs] = useState<Record<string, Msg[]>>({});
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [custom, setCustom] = useState<{ name: string; chunks: CustomChunk[] } | null>(null);
  const [uploadErr, setUploadErr] = useState("");
  const [uploading, setUploading] = useState(false);
  const [active, setActive] = useState<{ msg: number; n: number } | null>(null);
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("citebot-custom");
      if (saved) setCustom(JSON.parse(saved));
    } catch {}
  }, []);
  useEffect(() => { bottom.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, busy, wsId]);

  const ws = workspaces.find((w) => w.id === wsId);
  const list = msgs[wsId] ?? [];
  const suggestions = ws?.suggestions ?? ["What does this document cover?", "Summarize the key limits mentioned."];

  async function ask(q: string) {
    if (!q.trim() || busy) return;
    const history: ChatTurn[] = list.filter((m) => !m.error).map((m) => ({ role: m.role, content: m.content }));
    setMsgs((m) => ({ ...m, [wsId]: [...(m[wsId] ?? []), { role: "user", content: q }] }));
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId: wsId, question: q, history, customChunks: wsId === "custom" ? custom?.chunks : undefined }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Something went wrong");
      setMsgs((m) => ({ ...m, [wsId]: [...(m[wsId] ?? []), { role: "assistant", content: json.answer, answer: json }] }));
    } catch (e) {
      setMsgs((m) => ({ ...m, [wsId]: [...(m[wsId] ?? []), { role: "assistant", content: e instanceof Error ? e.message : "Error", error: true }] }));
    } finally {
      setBusy(false);
    }
  }

  async function upload(file: File) {
    setUploadErr("");
    if (!/\.(md|txt|markdown)$/i.test(file.name) && file.type !== "text/plain") { setUploadErr("Upload a .md or .txt file."); return; }
    if (file.size > 120_000) { setUploadErr("File is too large (max 120 KB)."); return; }
    setUploading(true);
    try {
      const text = await file.text();
      const res = await fetch("/api/ingest", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: file.name.replace(/\.[^.]+$/, ""), text }) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Upload failed");
      const c = { name: file.name, chunks: json.chunks as CustomChunk[] };
      setCustom(c);
      try { localStorage.setItem("citebot-custom", JSON.stringify(c)); } catch {}
      setWsId("custom");
    } catch (e) {
      setUploadErr(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  const tabs = useMemo(() => [...workspaces.map((w) => ({ id: w.id, name: w.name })), ...(custom ? [{ id: "custom", name: `Yours: ${custom.name}` }] : [])], [workspaces, custom]);
  const activeCite = active ? list[active.msg]?.answer?.citations.find((c) => c.n === active.n) : null;

  return (
    <div className="mx-auto grid max-w-6xl gap-5 px-5 py-8 lg:grid-cols-[260px_1fr_300px]">
      <aside className="space-y-4">
        <div>
          <h2 className="mb-2 text-xs uppercase tracking-widest text-muted">Workspace</h2>
          <div className="space-y-1.5">
            {tabs.map((t) => (
              <button key={t.id} onClick={() => setWsId(t.id)} className={`w-full truncate rounded-lg border px-3 py-2 text-left text-sm transition ${wsId === t.id ? "border-accent bg-accent/10 text-ink" : "border-line text-muted hover:text-ink"}`}>
                {t.name}
              </button>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-dashed border-line p-4">
          <p className="mb-2 text-sm font-medium">Bring your own docs</p>
          <p className="mb-3 text-xs text-muted">Upload a .md or .txt help article (max 120 KB). It stays in your browser and is sent only with your questions.</p>
          <label className="inline-block cursor-pointer rounded-full border border-line px-3 py-1.5 text-xs hover:border-accent">
            {uploading ? "Indexing..." : "Choose file"}
            <input type="file" accept=".md,.txt,.markdown,text/plain" className="hidden" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
          </label>
          {uploadErr && <p className="mt-2 text-xs text-warn">{uploadErr}</p>}
        </div>
        {ws && (
          <div>
            <h2 className="mb-2 text-xs uppercase tracking-widest text-muted">Knowledge base</h2>
            <ul className="space-y-1 text-xs text-muted">{ws.articles.map((a) => <li key={a.id}>- {a.title}</li>)}</ul>
          </div>
        )}
      </aside>

      <section className="flex min-h-[560px] flex-col rounded-2xl border border-line bg-panel">
        <div className="border-b border-line px-5 py-3 text-sm">
          <span className="font-medium">{tabs.find((t) => t.id === wsId)?.name}</span>
          <span className="ml-2 text-muted">support assistant</span>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5" style={{ maxHeight: "62vh" }}>
          {list.length === 0 && (
            <div className="space-y-3 text-sm text-muted">
              <p>Ask a support question. Every answer cites the article it came from. If the docs do not cover it, the bot hands off to a human instead of guessing.</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <button key={s} onClick={() => ask(s)} className="rounded-full border border-line px-3 py-1.5 text-left text-xs text-ink hover:border-accent">{s}</button>
                ))}
              </div>
            </div>
          )}
          {list.map((m, i) => (
            <div key={i} className={m.role === "user" ? "flex justify-end" : "flex"}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${m.role === "user" ? "bg-accent text-black" : m.error ? "border border-warn/40 bg-warn/10" : m.answer?.status === "handoff" ? "border border-warn/40 bg-warn/5" : "border border-line bg-bg"}`}>
                {m.answer?.status === "handoff" && <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-warn">Handed off to a human</div>}
                <p className="whitespace-pre-wrap">{renderWithCites(m.content, (n) => setActive({ msg: i, n }), m.answer?.status === "answered")}</p>
                {m.answer && (
                  <div className="mt-3 space-y-2 border-t border-line pt-2 text-xs text-muted">
                    {m.answer.citations.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        <span>{m.answer.status === "handoff" ? "Closest articles:" : "Sources:"}</span>
                        {m.answer.citations.map((c) => (
                          <button key={c.n} onClick={() => setActive({ msg: i, n: c.n })} className="rounded-full border border-line px-2 py-0.5 hover:border-accent hover:text-ink">[{c.n}] {c.title}</button>
                        ))}
                      </div>
                    )}
                    <div className="font-mono">
                      confidence {Math.round(m.answer.confidence * 100)}% · {m.answer.latencyMs} ms · {m.answer.usage.promptTokens + m.answer.usage.completionTokens} tokens · ${m.answer.usage.costUsdListPrice.toFixed(5)} at list price (free tier: $0)
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          {busy && <div className="text-sm text-muted">Searching the docs...</div>}
          <div ref={bottom} />
        </div>
        <form onSubmit={(e) => { e.preventDefault(); ask(input); }} className="flex gap-2 border-t border-line p-3">
          <input value={input} maxLength={600} onChange={(e) => setInput(e.target.value)} placeholder="Ask a support question..." className="flex-1 rounded-xl border border-line bg-bg px-4 py-2.5 text-sm outline-none focus:border-accent" aria-label="Question" />
          <button disabled={busy || !input.trim()} className="rounded-xl bg-accent px-5 text-sm font-medium text-black disabled:opacity-40">Ask</button>
        </form>
      </section>

      <aside>
        <h2 className="mb-2 text-xs uppercase tracking-widest text-muted">Source viewer</h2>
        {activeCite ? (
          <div className="rounded-xl border border-accent/50 bg-panel p-4 text-sm">
            <div className="mb-1 font-medium">[{activeCite.n}] {activeCite.title}</div>
            <p className="text-muted">{activeCite.snippet}</p>
            <div className="mt-2 font-mono text-xs text-muted">{activeCite.chunkId} · similarity {activeCite.score}</div>
          </div>
        ) : (
          <p className="rounded-xl border border-line p-4 text-xs text-muted">Click a citation to see the exact passage the answer was grounded on.</p>
        )}
      </aside>
    </div>
  );
}

function renderWithCites(text: string, onClick: (n: number) => void, enable: boolean) {
  if (!enable) return text;
  return text.split(/(\[\d+\])/g).map((part, i) => {
    const m = part.match(/^\[(\d+)\]$/);
    if (!m) return part;
    return (
      <button key={i} onClick={() => onClick(Number(m[1]))} className="mx-0.5 rounded bg-accent/20 px-1 text-xs font-semibold text-accent hover:bg-accent/30">{part}</button>
    );
  });
}
