import { Status } from "@oak/oak";

export async function validateRequestBody(
  ctx: any
): Promise<{ content: string }> {
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
