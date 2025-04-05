export function addCORSHeaders(response: Response): Response {
  response.headers.set("Access-Control-Allow-Origin", "*"); // Allow all origins
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE, OPTIONS"
  );
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return response;
}
