import { getOrCreateVisitorId } from './cookies.js';

export function registerVisit() {
    const idVisitor = getOrCreateVisitorId();
    fetch("/api/visit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idVisitor, page: location.pathname })
    });
}
