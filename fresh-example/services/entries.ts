import { Entry } from "../types/entry.ts";

const API_URL = "/api/entries";

export async function fetchEntries(): Promise<Entry[]> {
  const response = await fetch(API_URL, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
  return response.json();
}

export async function createEntry(content: string): Promise<Entry> {
  const response = await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({ content }),
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
  return response.json();
}

export async function updateEntry(id: string, content: string): Promise<Entry> {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ content }),
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
  return response.json();
}

export async function deleteEntry(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
}
