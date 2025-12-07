// ----- COOKIES -----
export function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export function getCookie(name) {
    const match = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
    return match ? match.pop() : null;
}

export function setCookie(name, value, days = 365) {
    const d = new Date();
    d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};path=/;expires=${d.toUTCString()};SameSite=Lax`;
}

export function getOrCreateVisitorId() {
    let id = getCookie("idVisitor");
    if (!id) {
        id = uuidv4();
        setCookie("idVisitor", id, 3650);
    }
    return id;
}
