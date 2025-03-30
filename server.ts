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

function entryMarkup(entry: Entry): string {
  return `
<article id="entry-${entry.id}">
  <div>${entry.content}</div>
  <footer>
    <p>
      <time datetime="${entry.date}">
        ${new Date(entry.date).toLocaleDateString()}
      </time>
    </p>
    <ul role="list">
      <li>
        <button 
          type="button" 
          hx-get="/api/entries/${entry.id}" 
          hx-target="#entries" 
          hx-push-url="true"
        >
          View
        </button>
      </li>
      <li>
        <button 
          type="button" 
          hx-delete="/api/entries/${entry.id}" 
          hx-target="#entry-${entry.id}" 
          hx-swap="outerHTML"
        >
          Delete
        </button>
      </li>
    </ul>
  </footer>
</article>`;
}

const API_ENDPOINT = "/api/entries";

const router = new Router();
router
  .get(API_ENDPOINT, (ctx) => {
    const data = Array.from(entries.values()).reverse();

    ctx.response.body = data.length
      ? data.map((entry) => entryMarkup(entry)).join("")
      : "No content";
    ctx.response.headers.set("Content-Type", "text/html");
  })
  .get(`${API_ENDPOINT}/:id`, (ctx) => {
    const id = ctx.params.id;

    if (!id || !entries.has(id)) {
      ctx.throw(Status.NotFound, "Entry not found");
    }

    const entry = entries.get(id);

    ctx.response.body = entry ? entryMarkup(entry) : "Entry not found";
    ctx.response.headers.set("Content-Type", "text/html");
  })
  .post(API_ENDPOINT, async (ctx) => {
    const body = ctx.request.body;

    if (body.type() !== "form") {
      ctx.throw(Status.BadRequest, "Invalid data");
    }

    const form = await body.form();
    const content = form.get("status") as string;

    if (!content) {
      ctx.throw(Status.BadRequest, "Content is required");
    }

    const newEntry: Entry = {
      id: crypto.randomUUID(),
      content,
      date: new Date().toISOString(),
    };

    entries.set(newEntry.id, newEntry);

    ctx.response.body = entryMarkup(newEntry);
    ctx.response.headers.set("Content-Type", "text/html");
    ctx.response.status = Status.Created;
  })
  .put(`${API_ENDPOINT}/:id`, async (ctx) => {
    const id = ctx.params.id;

    if (!id || !entries.has(id)) {
      ctx.throw(Status.NotFound, "Entry not found");
    }

    const body = ctx.request.body;

    if (body.type() !== "form") {
      ctx.throw(Status.BadRequest, "Invalid data");
    }

    const form = await body.form();
    const content = form.get("status") as string;

    if (!content) {
      ctx.throw(Status.BadRequest, "Content is required");
    }

    const updatedEntry: Entry = {
      id,
      content,
      date: entries.get(id)?.date as string,
      modDate: new Date().toISOString(),
    };

    entries.set(id, updatedEntry);

    ctx.response.body = entryMarkup(updatedEntry);
    ctx.response.headers.set("Content-Type", "text/html");
    ctx.response.status = Status.OK;
  })
  .delete(`${API_ENDPOINT}/:id`, (ctx) => {
    const id = ctx.params.id;

    if (!id || !entries.has(id)) {
      ctx.throw(Status.NotFound, "Entry not found");
    }

    entries.delete(id);

    ctx.response.status = Status.OK;
    ctx.response.body = "";
  });

const app = new Application();

app.use((ctx, next) => {
  ctx.response.headers.set("Access-Control-Allow-Origin", "*");
  ctx.response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  ctx.response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return next();
});
app.use(router.routes());
app.use(router.allowedMethods());

app.use(async (context) => {
  await context.send({
    root: Deno.cwd(),
    index: "index.html",
  });
});

app.addEventListener("listen", ({ hostname, port, serverType }) => {
  console.log(
    `🚀 Server running at http://${hostname}:${port} (using ${serverType})`
  );
});

await app.listen({ hostname: "127.0.0.1", port: 8000 });
