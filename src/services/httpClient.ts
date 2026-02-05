import axios, { type Method } from "axios";
import { request as obsidianRequest } from "obsidian";

export interface HttpClient {
  post(
    url: string,
    options: { body?: string; headers?: Record<string, string> },
  ): Promise<unknown>;
}

export class ObsidianHttpClient implements HttpClient {
  async post(
    url: string,
    options: { body?: string; headers?: Record<string, string> },
  ): Promise<unknown> {
    const response = await obsidianRequest({
      url: url,
      method: "POST",
      body: options.body,
      headers: options.headers,
    });
    return JSON.parse(response);
  }
}

export async function request(options: {
  url: string;
  method: string;
  body?: string;
  headers: { [key: string]: string };
}) {
  const response = await axios({
    method: options.method as Method,
    url: options.url,
    data: options.body,
    headers: options.headers,
  });

  return JSON.stringify(response.data);
}
