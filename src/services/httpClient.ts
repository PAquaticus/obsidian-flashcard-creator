// src/services/httpClient.ts
import { request as obsidianRequest } from 'obsidian';

export interface HttpClient {
    post(url: string, options: { headers: any, body: any }): Promise<any>;
}

export class ObsidianHttpClient implements HttpClient {
    async post(url: string, options: { headers: any, body: any }): Promise<any> {
        const response = await obsidianRequest({
            url,
            method: 'POST',
            headers: options.headers,
            body: options.body
        });
        return JSON.parse(response);
    }
}
