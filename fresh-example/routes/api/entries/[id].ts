/// <reference lib="deno.unstable" />
import { Handlers } from "$fresh/server.ts";
import { Entry } from "../../../types/entry.ts";
import { errorResponse } from "../../../utils/validation.ts";

const kv = await Deno.openKv();

export const handler: Handlers<Entry | null> = {
  async GET(_req, ctx) {
    try {
      const id = ctx.params.id;
      const entryKey = ["entry", id];
      const entryRes = await kv.get(entryKey);

      if (!entryRes.value) {
        return errorResponse(404, `No entry with ID ${id} found.`);
      }

      const entry = entryRes.value as Entry;
      return new Response(JSON.stringify(entry), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Unexpected error in GET: ", error);
      return errorResponse(500, "Internal Server Error");
    }
  },
  async PATCH(req, ctx) {
    try {
      const id = ctx.params.id;
      const entryKey = ["entry", id];
      const entryRes = await kv.get(entryKey);

      if (!entryRes.value) {
        return errorResponse(404, `No entry with ID ${id} found.`);
      }

      const body = (await req.json()) as Entry;

      if (!body || typeof body.content !== "string") {
        return errorResponse(400, "Invalid request. Content is required.");
      }

      const entry = entryRes.value as Entry;

      const updatedEntry: Entry = {
        ...entry,
        content: body.content,
        modDate: new Date().toISOString(),
      };

      const ok = await kv
        .atomic()
        .check(entryRes)
        .set(entryKey, updatedEntry)
        .commit();

      if (!ok) throw new Error("Something went wrong.");

      return new Response(JSON.stringify(updatedEntry), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Unexpected error in PATCH: ", error);
      return errorResponse(500, "Internal Server Error");
    }
  },
  async DELETE(_req, ctx) {
    try {
      const id = ctx.params.id;
      const entryKey = ["entry", id];
      const entryRes = await kv.get(entryKey);

      if (!entryRes.value) {
        return errorResponse(404, `No entry with ID ${id} found.`);
      }

      const ok = await kv.atomic().check(entryRes).delete(entryKey).commit();

      if (!ok) throw new Error("Something went wrong.");

      return new Response(null, { status: 204 });
    } catch (error) {
      console.error("Unexpected error in DELETE: ", error);
      return errorResponse(500, "Internal Server Error");
    }
  },
};
