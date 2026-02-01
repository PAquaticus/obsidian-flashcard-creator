import { request } from "./httpClient";
import type { Note } from "../types";

export async function checkVersion(url: string) {
  const response = await request({
    url: url,
    method: "POST",
    body: JSON.stringify({ action: "version", version: 6, params: {} }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = JSON.parse(response);
  if (data.error) {
    throw new Error(data.error);
  }
  return data.result;
}

export async function getDecks(url: string) {
  const response = await request({
    url: `${url}/decks`,
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = JSON.parse(response);
  if (data.error) {
    throw new Error(data.error);
  }
  return data.decks;
}

export async function addNote(url: string, note: Note) {
  const response = await request({
    url: `${url}/add-card`,
    method: "POST",
    body: JSON.stringify(note),
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = JSON.parse(response);
  if (data.error) {
    throw new Error(data.error);
  }
  return data;
}
