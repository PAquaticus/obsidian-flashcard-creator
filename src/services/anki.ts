import { request } from "obsidian";

async function ankiRequest(url: string, action: string, params = {}) {
    const response = await request({
        url: url,
        method: 'POST',
        body: JSON.stringify({ action, version: 6, params }),
        headers: {
            'Content-Type': 'application/json'
        }
    });

    const data = JSON.parse(response);

    if (data.error) {
        throw new Error(data.error);
    }

    return data.result;
}

export async function checkVersion(url: string) {
    return await ankiRequest(url, "version");
}

export async function addNote(url: string, deckName: string, modelName: string, fields: { [key: string]: string }, tags: string[] = []) {
    return await ankiRequest(url, "addNote", {
        note: {
            deckName,
            modelName,
            fields,
            tags
        }
    });
}
