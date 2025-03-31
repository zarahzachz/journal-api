import { Router, Status } from "@oak/oak";
import { validateRequestBody } from "../utils/validation.ts";
import { Entry } from "../types/entry.ts";

const entries = new Map<string, Entry>();

entries.set("1", {
  id: "1",
  content:
    "This is the first entry in my journal API. It's a simple entry to demonstrate the API functionality. Feel free to modify it as needed.",
  date: new Date().toISOString(),
});

const router = new Router();
const API_ENDPOINT = "/api/entries";

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

export default router;
