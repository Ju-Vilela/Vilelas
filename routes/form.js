const express = require('express');
const router = express.Router();
const sendFormEmail = require('../public/js/mailer');

router.post('/send', async (req, res) => {
    try {
        const { nome, email, telefone, empresa, mensagem } = req.body;

        // validação mínima
        if (!(nome || empresa) || !(email || telefone)) {
            return res.status(400).send("Preencha pelo menos um campo de identificação e um de contato");
        }

        await sendFormEmail({ nome, email, telefone, empresa, mensagem });

        res.json({ success: true, message: "Formulário enviado com sucesso!" });
    } catch (err) {
        console.error('ERRO:', err);
        res.status(500).send(err.message || 'Erro ao enviar o formulário');
    }
});

module.exports = router;
