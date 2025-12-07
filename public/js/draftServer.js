import { getOrCreateVisitorId } from './cookies.js';

export async function loadDraftFromServer() {
    try {
        const res = await fetch(`/api/draft/last/${getOrCreateVisitorId()}`);
        if (res.ok && res.headers.get("content-type")?.includes("application/json")) {
            const serverDraft = await res.json();
            if (serverDraft?._id) return serverDraft;
        }
    } catch (err) {
        console.error("Erro ao carregar draft do servidor:", err);
    }
    return {};
}

export async function saveDraftToServer(draft, draftId = null, isSubmitted = false) {
    const payload = {
        idVisitor: getOrCreateVisitorId(),
        logs: draft,
        submitted: isSubmitted
    };
    const url = draftId ? `/api/draft/${draftId}` : "/api/draft";
    const method = draftId ? "PUT" : "POST";

    try {
        const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (res.ok && res.headers.get("content-type")?.includes("application/json")) {
            const json = await res.json();
            if (!draftId && json._id) return json._id;
        }
    } catch (err) {
        console.error("Erro ao salvar draft:", err);
    }
    return draftId;
}
