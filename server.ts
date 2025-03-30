import { Application, Router, Status } from "@oak/oak";

interface Entry {
  id: string;
  content: string;
  date: string;
  modDate?: string;
}

const entries = new Map<string, Entry>();

entries.set("1", {
  id: "1",
  content:
    "This is the first entry of my Journal app built with Deno and HTMX. This is a pretty barebones implementation - no Markdown support, no links or images, etc. - but it works well for a simple journal. Like Twitter, there's no edit feature. I just couldn't figure the UI out for it. I may add it later, but for now, if I want to update an entry, I just delete it and create a new one.",
  date: new Date().toISOString(),
});

async function validateRequestBody(ctx: any): Promise<{ content: string }> {
  const body = ctx.request.body();

  if (body.type !== "json") {
    ctx.throw(Status.BadRequest, "Invalid data");
  }

  const { content } = await body.value;

  if (!content) {
    ctx.throw(Status.BadRequest, "Content is required");
  }

  return { content };
}

const API_ENDPOINT = "/api/entries";

const router = new Router();
router
  .get(API_ENDPOINT, (ctx) => {
    const data = Array.from(entries.values());

    ctx.response.body = data.length ? JSON.stringify(data) : "No content";
    ctx.response.headers.set("Content-Type", "application/json");
    ctx.response.status = Status.OK;
  })
  .get(`${API_ENDPOINT}/:id`, (ctx) => {
    const id = ctx.params.id;

    if (!id || !entries.has(id)) {
      ctx.throw(Status.NotFound, "Entry not found");
    }

    const entry = entries.get(id);

    ctx.response.body = entry
      ? JSON.stringify(entry)
      : { message: "Entry not found" };
    ctx.response.headers.set("Content-Type", "application/json");
    ctx.response.status = Status.OK;
  })
  .post(API_ENDPOINT, async (ctx) => {
    const { content } = await validateRequestBody(ctx);
    const newEntry: Entry = {
      id: crypto.randomUUID(),
      content,
      date: new Date().toISOString(),
    };

    entries.set(newEntry.id, newEntry);

    ctx.response.body = JSON.stringify(newEntry);
    ctx.response.headers.set("Content-Type", "application/json");
    ctx.response.status = Status.Created;
  })
  .put(`${API_ENDPOINT}/:id`, async (ctx) => {
    const id = ctx.params.id;

    if (!id || !entries.has(id)) {
      ctx.throw(Status.NotFound, "Entry not found");
    }

    const { content } = await validateRequestBody(ctx);
    const existingEntry = entries.get(id) as Entry;
    const updatedEntry: Entry = {
      ...existingEntry,
      content,
      modDate: new Date().toISOString(),
    };

    entries.set(id, updatedEntry);

    ctx.response.body = JSON.stringify(updatedEntry);
    ctx.response.headers.set("Content-Type", "application/json");
    ctx.response.status = Status.OK;
  })
  .delete(`${API_ENDPOINT}/:id`, (ctx) => {
    const id = ctx.params.id;

    if (!id || !entries.has(id)) {
      ctx.throw(Status.NotFound, "Entry not found");
    }

    entries.delete(id);

    ctx.response.status = Status.NoContent;
    ctx.response.body = null;
  });

const app = new Application();

app.use(router.routes());
app.use(router.allowedMethods());

app.addEventListener("listen", ({ hostname, port, serverType }) => {
  console.log(
    `🚀 Server running at http://${hostname}:${port} (using ${serverType})`
  );
});

await app.listen({ hostname: "127.0.0.1", port: 8000 });
