import { Handlers, PageProps } from "$fresh/server.ts";
import { Entry } from "../types/entry.ts";
import EntryArticle from "../islands/EntryArticle.tsx";

export const handler: Handlers<Entry | null> = {
  async GET(_, ctx) {
    const { id } = ctx.params;
    try {
      const baseUrl = new URL(ctx.url).origin;
      const response = await fetch(`${baseUrl}/api/entries/${id}`);

      if (!response.ok) {
        console.error(`Entry ${id} not found`);
        return ctx.render(null);
      }

      const entry = await response.json();
      return ctx.render(entry);
    } catch (error) {
      console.error(`Failed to fetch entry id ${id}`, error);
      return ctx.render(null);
    }
  },
};

export default function EntryPage({ data }: PageProps<Entry | null>) {
  if (!data) {
    return (
      <article>
        <p>Entry not found.</p>
      </article>
    );
  }

  return <EntryArticle entry={data} />;
}
