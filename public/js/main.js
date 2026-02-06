import { getOrCreateVisitorId } from './cookies.js';
import { registerVisit } from './visit.js';
import { loadLocalDraft, mergeDrafts } from './draftLocal.js';
import { loadDraftFromServer, saveDraftToServer } from './draftServer.js';
import { showAlert } from './formHandler.js';

document.addEventListener("DOMContentLoaded", async () => {
    const form = document.getElementById("formContato");
    const storageKey = "draftForm";
    let draftId = null;
    let submitted = false;
    let draft = {};
    const timeoutFields = {};
    const lastTyped = {};

    // ----- Registrar visita -----
    registerVisit();

    // ----- Carrega draft local e servidor -----
    const localDraft = loadLocalDraft(form, storageKey);
    let serverData = await loadDraftFromServer();
    let draftFromServer = serverData?.logs || {};
    let draftIdFromServer = serverData?._id || null;

    // Prioriza localStorage
    if (Object.keys(localDraft).length > 0) {
        draft = localDraft;
        draftId = localDraft._id || draftIdFromServer; // só usa _id do local se existir, senão pega do server
    } else if (draftIdFromServer) {
        draft = draftFromServer;
        draftId = draftIdFromServer;
    } else {
        draft = {}; // nenhum rascunho
        draftId = null;
    }

    // ----- Salvar ao abrir página se tiver dados suficientes -----
    await saveDraftConditionally();

    // ----- Atualiza localDraft e localStorage (debounce por campo) -----
    function updateLocalDraft(field, value) {
        if (!draft[field]) draft[field] = { full: [], current: "", deleted: [] };
        const prevValue = draft[field].current;
        draft[field].current = value;

        if (!lastTyped[field] || value.length >= prevValue.length) lastTyped[field] = prevValue;
        if (timeoutFields[field]) clearTimeout(timeoutFields[field]);

        timeoutFields[field] = setTimeout(async () => {
            const valTrim = value.trim();
            const prevTrim = lastTyped[field]?.trim();

            // --- deleted ---
            if (prevTrim && prevTrim.length > valTrim.length) {
                if (!draft[field].deleted.some(v => v.toLowerCase() === prevTrim.toLowerCase()) && prevTrim.length > 2) {
                    draft[field].deleted.push(prevTrim);
                    if (draft[field].deleted.length > 10) draft[field].deleted.shift();
                }
            }

            // --- full ---
            if (valTrim && !draft[field].full.some(v => v.toLowerCase() === valTrim.toLowerCase())) {
                draft[field].full.push(valTrim);
                if (draft[field].full.length > 10) draft[field].full.shift();
            }

            lastTyped[field] = valTrim;
            localStorage.setItem(storageKey, JSON.stringify(draft));

            // ----- Tenta salvar no servidor se condição for atendida -----
            await saveDraftConditionally();
        }, 1000);
    }

    // ----- Salvar draft no servidor com regras -----
    async function saveDraftConditionally() {
        if (!draft) return;

        const nomeVal = draft.nome?.current?.trim() || "";
        const empresaVal = draft.empresa?.current?.trim() || "";
        const emailVal = draft.email?.current?.trim() || "";
        const telefoneRaw = draft.telefone?.current || "";

        const hasIdentifier = nomeVal || empresaVal;
        const hasValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal);
        const telefoneNumeros = onlyNumbers(telefoneRaw);
        const hasPhone = telefoneNumeros.length >= 10;

        if (hasIdentifier && (hasPhone || hasValidEmail)) {
            draftId = await saveDraftToServer(draft, draftId, false);
        }
    }

    // ----- Input event listener -----
    form.addEventListener("input", (e) => {
        if (!e.target.name) return;
        updateLocalDraft(e.target.name, e.target.value);
    });

    // ----- Inicializa inputs com draft -----
    for (let el of form.elements) {
        if (el.name && draft[el.name]?.current) el.value = draft[el.name].current;
    }

    // ----- Submit do formulário -----
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (submitted || !draftId) return;
        setLoading(true);

        const nome = document.getElementById('inputNome');
        const empresa = document.getElementById('inputEmpresa');
        const email = document.getElementById('inputEmail');
        const telefone = document.getElementById('inputTelefone');

        [nome, empresa, email, telefone].forEach(c => {
            c.style.border = '';
            c.placeholder = c.getAttribute('data-placeholder') || c.placeholder;
        });

        const nomeVal = nome.value.trim();
        const empresaVal = empresa.value.trim();
        const emailVal = email.value.trim(); 
        const telefoneVal = onlyNumbers(telefone.value);

        const validoNomeEmpresa = nomeVal || empresaVal;
        const validoContato = emailVal || telefoneVal;

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailVal && !emailPattern.test(emailVal)) {
            showAlert('<i class="bi bi-exclamation-diamond-fill"></i> E-mail inválido.');
            email.style.border = '2px solid red';
            return;
        }

        if (validoNomeEmpresa && validoContato) {
            try {
                await enviarFormulario()
                const res = await fetch(`/api/draft/${draftId}/send`, { method: "PUT" });
                if (res.ok) {
                    submitted = true;
                    draft = {};
                    draftId = null;
                    form.reset();
                    localStorage.removeItem(storageKey);
                    showAlert("<i class='bi bi-send-check-fill'></i> Formulário enviado com sucesso!", "success");
                } else {
                    showAlert("<i class='bi bi-send-exclamation-fill'></i> Erro ao enviar o formulário.", "danger");
                }
            } catch (err) {
                console.error("Erro ao enviar draft:", err);
                showAlert("<i class='bi bi-bug-fill'></i> Erro inesperado.", "warning");
            } finally {
                setLoading(false);
            }
        } else {
            if (!validoNomeEmpresa) [nome, empresa].forEach(c => c.style.border = '2px solid red');
            if (!validoContato) [email, telefone].forEach(c => c.style.border = '2px solid red');
            showAlert('<i class="bi bi-exclamation-triangle-fill"></i> Preencha pelo menos um campo de identificação e um de contato.');
        }
    });

    async function enviarFormulario() {
        const data = {
            nome: document.getElementById('inputNome').value,
            email: document.getElementById('inputEmail').value,
            telefone: document.getElementById('inputTelefone').value,
            empresa: document.getElementById('inputEmpresa').value,
            mensagem: document.getElementById('inputMensagem').value
        };

        const res = await fetch('/api/form/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(text);
        }

        const json = await res.json();
    }

    
    // ----- Ao fechar/recarregar -----
    window.addEventListener("beforeunload", () => {
        localStorage.setItem(storageKey, JSON.stringify(draft));

        const nomeVal = draft.nome?.current?.trim() || "";
        const empresaVal = draft.empresa?.current?.trim() || "";
        const emailVal = draft.email?.current?.trim() || "";
        const telefoneVal = draft.telefone?.current?.trim() || "";

        if ((nomeVal || empresaVal) && (emailVal || telefoneVal)) {
            const payload = new Blob(
                [JSON.stringify({ idVisitor: getOrCreateVisitorId(), logs: draft, submitted: false })],
                { type: "application/json" }
            );
            navigator.sendBeacon("/api/draft", payload);
        }
    });

    // ----- Limpa borda ao digitar -----
    document.querySelectorAll('#inputNome, #inputEmpresa, #inputEmail, #inputTelefone')
        .forEach(c => c.addEventListener('input', () => c.style.border = ''));

    // ----- Máscaras -----
    $(document).ready(function () {
        $("#inputTelefone").inputmask({ mask: ["(99) 9999-9999", "(99) 9 9999-9999"], keepStatic: true });
        $("#inputEmail").inputmask({
            mask: "*{1,20}[.*{1,20}]@*{1,20}[.*{2,6}][.*{1,2}]",
            greedy: false,
            onBeforePaste: (pastedValue) => pastedValue.toLowerCase().replace("mailto:", ""),
            definitions: { "*": { validator: "[0-9A-Za-z!#$%&'*+/=?^_`{|}~\\-]", casing: "lower" } }
        });
    });
});

function onlyNumbers(value) {
    return value.replace(/\D/g, '');
}
