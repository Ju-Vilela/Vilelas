const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);
const BASE_URL = process.env.APP_URL;

async function sendFormEmail({ nome, email, telefone, empresa, mensagem }) {
    const mensagemHtml = converterTEXT_HTML(mensagem || "");

    await resend.emails.send({
        from: `VAE Website <${[process.env.EMAIL_FROM]}>`,
        to: [process.env.EMAIL_TO],
        subject: `V@E: Solicitação de serviço – ${nome || empresa || "Cliente potencial"}`,
        html: `
            <div style="font-family: 'IBM Plex Serif', serif; line-height: 1.6">
                <h2>Solicitação de serviço.</h2>

                <p>
                    <b>Nome:</b> ${nome || "——"}<br />
                    <b>Email:</b> ${email || "——"}<br />
                    <b>Telefone:</b> ${telefone || "——"}<br />
                    <b>Empresa:</b> ${empresa || "——"}
                </p>

                <p><b>Mensagem:</b></p>
                <p>${mensagemHtml}</p>

                <hr>
                <div>
                    <small style="font-style: italic;">Enviado automaticamente pelo sistema</small>
                    <br>
                    <img src="${BASE_URL}/imagens/assinatura.png" alt="Assinatura" style="width:70%; max-width:400px;" />
                </div>
            </div>
        `
    });
}


function converterTEXT_HTML(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\n/g, "<br>");
}

module.exports = sendFormEmail;
