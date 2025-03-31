import { Application } from "@oak/oak";
import entriesRouter from "./routes/entries.ts";

const app = new Application();

app.use(entriesRouter.routes());
app.use(entriesRouter.allowedMethods());

export default app;
