import app from "./app.ts";

const PORT = 8000;

app.addEventListener("listen", ({ hostname, port, serverType }) => {
  console.log(
    `🚀 Server running at http://${hostname}:${port} (using ${serverType})`
  );
});

await app.listen({ hostname: "127.0.0.1", port: PORT });
