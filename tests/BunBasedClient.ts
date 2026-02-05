import { HttpClient } from "../src/services/httpClient";

export class BunBasedClient implements HttpClient {
  async post(
    url: string,
    options: { body?: string; headers?: Record<string, string> },
  ): Promise<unknown> {
    const response = await fetch(url, {
      method: "POST",
      body: options.body,
      headers: options.headers,
    });
    const data = await response.json();
    return data;
  }
}
