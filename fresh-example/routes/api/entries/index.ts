/// <reference lib="deno.unstable" />
import { Handlers } from "$fresh/server.ts";
import { Entry } from "../../../types/entry.ts";
import { errorResponse } from "../../../utils/validation.ts";
import { addCORSHeaders } from "../../../utils/cors.ts";

const kv = await Deno.openKv();

export const handler: Handlers<Entry | null> = {
  async GET(_req, _ctx) {
    try {
      const entries = [];

      for await (const res of kv.list({ prefix: ["entry"] })) {
        entries.push(res.value);
      }

      const response = new Response(JSON.stringify(entries), {
        headers: { "Content-Type": "application/json" },
      });

      return addCORSHeaders(response);
    } catch (error) {
      console.error("Unexpected error in GET: ", error);
      return addCORSHeaders(
        new Response(JSON.stringify({ error: "Internal Server Error" }), {
          status: 500,
        }),
      );
    }
  },
  async POST(req, _ctx) {
    try {
      const body = (await req.json()) as Entry;
      console.log("POST body: ", typeof body);

      if (!body || typeof body.content !== "string") {
        return addCORSHeaders(
          errorResponse(400, "Invalid request. Content is required."),
        );
      }

      const entry: Entry = {
        id: crypto.randomUUID(),
        content: body.content,
        date: new Date().toISOString(),
      };
      const entryKey = ["entry", entry.id];

      const ok = await kv.atomic().set(entryKey, entry).commit();

      if (!ok) throw new Error("Something went wrong.");

      return addCORSHeaders(
        new Response(JSON.stringify(entry), {
          status: 201,
          headers: { "Content-Type": "application/json" },
        }),
      );
    } catch (error) {
      console.error("Unexpected error in POST: ", error);
      return addCORSHeaders(
        new Response(JSON.stringify({ error: "Internal Server Error" }), {
          status: 500,
        }),
      );
    }
  },
};
