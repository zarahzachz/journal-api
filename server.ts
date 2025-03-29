import { join } from "@std/path";

const API_ENDPOINT = "/api/entries";

// Mock data
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

// Utility: Add CORS Headers
function addCORS(response: Response): Response {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return response;
}

// Serve Static Files
async function serveFile(pathname: string): Promise<Response> {
  const filePath = join(Deno.cwd(), pathname);
  try {
    const file = await Deno.readFile(filePath);
    return new Response(file, { headers: { "Content-Type": "text/html" } });
  } catch {
    return new Response("File not found", { status: 404 });
  }
}

// API Request Handler
async function handleAPIRequest(req: Request, url: URL): Promise<Response> {
  if (req.method === "OPTIONS")
    return addCORS(new Response(null, { status: 204 }));

  const id = url.pathname.replace(`${API_ENDPOINT}/`, "").split("/")[0];
  let response: Response;

  switch (req.method) {
    case "GET":
      response = id && id !== "entries" ? getEntry(id) : getEntries();
      break;
    case "POST":
      response = await createEntry(req);
      break;
    case "PUT":
      response = id
        ? await updateEntry(req, id)
        : new Response("ID required", { status: 400 });
      break;
    case "DELETE":
      response = id
        ? deleteEntry(id)
        : new Response("ID required", { status: 400 });
      break;
    default:
      response = new Response("Method not allowed", { status: 405 });
  }

  return addCORS(response);
}

// Generate Entry Markup for HTMX
function entryMarkup(entry: Entry): string {
  return `
<article id="entry-${entry.id}" class="entry">
  <div class="content">${entry.content}</div>
  <footer>
    <p><time datetime="${entry.date}">${new Date(
    entry.date
  ).toLocaleDateString()}</time></p>
    <ul role="list">
      <li><a hx-get="/api/entries/${
        entry.id
      }" hx-target="#entries" hx-push-url="true">View</a></li>
      <li><button type="button" hx-delete="/api/entries/${
        entry.id
      }" hx-target="#entry-${entry.id}" hx-swap="outerHTML">Delete</button></li>
    </ul>
  </footer>
</article>`;
}

// GET /api/entries
function getEntries(): Response {
  const data = Array.from(entries.values()).reverse();
  return data.length
    ? new Response(data.map(entryMarkup).join(""), {
        headers: { "Content-Type": "text/html" },
      })
    : new Response("No content", { status: 204 });
}

// GET /api/entries/:id
function getEntry(id: string): Response {
  const entry = entries.get(id);
  return entry
    ? new Response(entryMarkup(entry), {
        headers: { "Content-Type": "text/html" },
      })
    : new Response("Entry not found", { status: 404 });
}

// POST /api/entries
async function createEntry(request: Request): Promise<Response> {
  try {
    const formData = await request.formData();
    const content = formData.get("status") as string;

    if (!content)
      return new Response(JSON.stringify({ error: "Content is required" }), {
        status: 400,
      });

    const newEntry: Entry = {
      id: crypto.randomUUID(),
      content,
      date: new Date().toISOString(),
    };
    entries.set(newEntry.id, newEntry);

    return new Response(entryMarkup(newEntry), {
      headers: { "Content-Type": "text/html" },
      status: 201,
    });
  } catch {
    return new Response(JSON.stringify({ error: "Invalid data" }), {
      status: 400,
    });
  }
}

// PUT /api/entries/:id
async function updateEntry(request: Request, id: string): Promise<Response> {
  const entry = entries.get(id);
  if (!entry) return new Response("Entry not found", { status: 404 });

  try {
    const formData = await request.formData();
    const content = formData.get("status") as string;

    if (!content)
      return new Response(JSON.stringify({ error: "Content is required" }), {
        status: 400,
      });

    const updatedEntry = {
      ...entry,
      content,
      modDate: new Date().toISOString(),
    };
    entries.set(id, updatedEntry);

    return new Response(entryMarkup(updatedEntry), {
      headers: { "Content-Type": "text/html" },
    });
  } catch {
    return new Response(JSON.stringify({ error: "Invalid data" }), {
      status: 400,
    });
  }
}

// DELETE /api/entries/:id
function deleteEntry(id: string): Response {
  if (!entries.has(id)) return new Response("Entry not found", { status: 404 });

  entries.delete(id);
  return new Response(null, { status: 200 });
}

// Start Server
Deno.serve(async (req) => {
  const url = new URL(req.url);
  if (url.pathname.startsWith(API_ENDPOINT))
    return await handleAPIRequest(req, url);
  if (url.pathname === "/") return await serveFile("index.html");
  return new Response("Not Found", { status: 404 });
});
