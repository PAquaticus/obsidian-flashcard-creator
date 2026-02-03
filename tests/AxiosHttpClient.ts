// tests/AxiosHttpClient.ts
import axios from "axios";
import type { HttpClient } from "../src/services/httpClient";

export class AxiosHttpClient implements HttpClient {
  async post(url: string, options: { headers: any; body: any }): Promise<any> {
    const response = await axios.post(url, options.body, {
      headers: options.headers,
    });
    return response.data;
  }
}
