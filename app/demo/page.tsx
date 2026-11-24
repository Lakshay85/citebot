import Chat from "@/components/Chat";
import { WORKSPACES } from "@/lib/workspaces";

export const metadata = { title: "Live demo | Citebot" };

const SUGGESTIONS: Record<string, string[]> = {
  lumen: ["Which plan includes SSO?", "Can I get a refund on an annual plan after 3 weeks?", "Does Lumen have a Flutter SDK?"],
  parcelo: ["How do I insure a $2,000 shipment?", "How long are return labels valid?", "Do you deliver by drone?"],
  fernwood: ["How many PTO days carry over?", "How much parental leave do I get?", "What is the stock option vesting schedule?"],
};

export default function Demo() {
  const workspaces = WORKSPACES.map((w) => ({
    id: w.id,
    name: w.name,
    tagline: w.tagline,
    suggestions: SUGGESTIONS[w.id] ?? [],
    articles: w.articles.map((a) => ({ id: a.id, title: a.title })),
  }));
  return (
    <main>
      <div className="mx-auto max-w-6xl px-5 pt-10">
        <h1 className="text-3xl font-semibold tracking-tight">Live demo</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">Pick a sample company (or upload your own doc) and ask anything. The third suggestion in each workspace is deliberately outside the docs, so you can watch the human handoff.</p>
      </div>
      <Chat workspaces={workspaces} />
    </main>
  );
}
