require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // true se usar 465
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

async function sendFormEmail({ nome, email, telefone, empresa, mensagem }) {
    const mensagemHtml = converterTEXT_HTML(mensagem || "");

    await transporter.sendMail({
        from: `"V@E Website" <${process.env.SMTP_USER}>`,
        to: process.env.EMAIL_TO,
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
                    <img style="width: 70%;" src="cid:assinatura" />
                </div>
            </div>
        `,
        attachments: [
            {
                filename: 'assinatura.png',
                path: './public/Imagens/assinatura.png',
                cid: 'assinatura'
            }
        ]
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
