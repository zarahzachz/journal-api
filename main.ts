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
  content: "This is my first entry",
  date: new Date().toISOString(),
});

// curl -X POST http://localhost:8000/api/entries \
//      -H "Content-Type: application/json" \
//      -d '{"content": "This is a new entry"}'

// curl -X PUT http://localhost:8000/api/entries/1 \
//      -d '{"content": "Updating this entry"}'

// curl -X DELETE http://localhost:8000/api/entries/1

// GET /api/entries
function getEntries(path: boolean): Response {
  const data = Array.from(entries.values());

  if (data.length === 0) {
    return new Response("No content", { status: 204 });
  }

  if (path && data.length > 0) {
    const response = JSON.stringify(data);

    return new Response(response, { status: 200 });
  }

  return new Response("Invalid request", { status: 400 });
}

// GET /api/entries/:id
function getEntry(path: boolean, id: string): Response {
  if (!id) {
    return new Response("Entry ID is required", { status: 400 });
  }

  const entry = entries.get(id);

  if (path && entry) {
    const response = JSON.stringify(entry);
    return new Response(response, { status: 200 });
  }

  return new Response("Entry not found", { status: 404 });
}

// POST /api/entries
async function createEntry(request: Request): Promise<Response> {
  try {
    const { content } = await request.json();
    if (!content) {
      return new Response(JSON.stringify({ error: "Content is required" }), {
        headers: { "Content-Type": "application/json" },
        status: 400,
      });
    }

    const newEntry: Entry = {
      id: crypto.randomUUID(),
      content,
      date: new Date().toISOString(),
    };

    entries.set(newEntry.id, newEntry);
    return new Response(JSON.stringify(newEntry), { status: 201 });
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      headers: { "Content-Type": "application/json" },
      status: 400,
    });
  }
}

// PUT /api/entries/:id
async function updateEntry(
  request: Request,
  id: string | undefined
): Promise<Response> {
  if (!id) {
    return new Response("Entry ID is required", { status: 400 });
  }

  const entry = entries.get(id);
  if (!entry) {
    return new Response("Entry not found", {
      headers: { "Content-Type": "application/json" },
      status: 404,
    });
  }

  try {
    const { content } = await request.json();
    if (!content) {
      return new Response(JSON.stringify({ error: "Content is required" }), {
        headers: { "Content-Type": "application/json" },
        status: 400,
      });
    }

    const updatedEntry: Entry = {
      ...entry,
      content,
      modDate: new Date().toISOString(),
    };

    entries.set(id, updatedEntry);

    return new Response(JSON.stringify(updatedEntry), { status: 200 });
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      headers: { "Content-Type": "application/json" },
      status: 400,
    });
  }
}

// DELETE /api/entries/:id
function deleteEntry(id: string | undefined): Response {
  if (!id) {
    return new Response("Entry ID is required", {
      headers: { "Content-Type": "application/json" },
      status: 400,
    });
  }

  const entry = entries.get(id);
  if (!entry) {
    return new Response("Entry not found", {
      headers: { "Content-Type": "application/json" },
      status: 404,
    });
  }

  entries.delete(id);
  return new Response(null, {
    headers: { "Content-Type": "application/json" },
    status: 204,
  });
}

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const API_PATH = "/api/entries";

  const idPattern = new URLPattern({ pathname: `${API_PATH}/:id` });
  const id = idPattern.exec(url)?.pathname.groups.id;

  switch (req.method) {
    case "GET":
      if (id) {
        return getEntry(url.pathname.includes(API_PATH), id);
      } else {
        return getEntries(url.pathname.includes(API_PATH));
      }
    case "POST":
      return await createEntry(req);
    case "PUT":
      return await updateEntry(req, id);
    case "DELETE":
      return deleteEntry(id);
    default:
      return new Response("Method not allowed", {
        headers: { "Content-Type": "application/json" },
        status: 405,
      });
  }
});
