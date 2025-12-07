export function loadLocalDraft(form, storageKey) {
    const stored = JSON.parse(localStorage.getItem(storageKey) || "{}");
    for (let el of form.elements) {
        if (el.name && stored[el.name]?.current) {
            el.value = stored[el.name].current;
        }
    }
    return stored;
}

export function mergeDrafts(localDraft = {}, serverDraft = {}) {
    const merged = {};

    for (const key in serverDraft) {
        merged[key] = {
            current: serverDraft[key]?.current || "",
            full: serverDraft[key]?.full || "",
            deleted: Array.isArray(serverDraft[key]?.deleted) ? serverDraft[key].deleted : []
        };
    }

    for (const key in localDraft) {
        if (!merged[key]) {
            merged[key] = {
                current: localDraft[key]?.current || "",
                full: localDraft[key]?.full || [],
                deleted: Array.isArray(localDraft[key]?.deleted) ? localDraft[key].deleted : []
            };
        } else {
            if ((localDraft[key]?.current?.length || 0) > merged[key].current.length) {
                merged[key].current = localDraft[key].current;
            }
            if (Array.isArray(localDraft[key]?.full)) {
                merged[key].full = [...new Set([...(merged[key].full || []), ...localDraft[key].full])];
            }
            if (Array.isArray(localDraft[key]?.deleted)) {
                merged[key].deleted = [...new Set([...merged[key].deleted, ...localDraft[key].deleted])];
            }
        }
    }

    return merged;
}
