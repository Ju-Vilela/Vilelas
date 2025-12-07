const express = require('express');
const router = express.Router();
const { Draft, SentDraft, ErrorLog } = require('../models');
const { logError } = require('../utils');

// Cria draft
router.post('/', async (req, res) => {
    try {
        const { idVisitor, logs, submitted } = req.body;
        if (!idVisitor) return res.status(400).send("idVisitor obrigatório");

        let draft = await Draft.findOne({ idVisitor, submitted: false });
        if (!draft) draft = await Draft.create({ idVisitor, logs, submitted });

        res.json(draft);
    } catch (err) {
        await logError(ErrorLog, "/api/draft", req.body, err.message, req.body.idVisitor);
        res.status(500).send("Erro interno");
    }
});

// Atualiza draft
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { idVisitor, logs, submitted } = req.body;

        const draft = await Draft.findByIdAndUpdate(
            id,
            { idVisitor, logs, submitted },
            { new: true, upsert: true }
        );

        res.json(draft);
    } catch (err) {
        await logError(ErrorLog, "/api/draft/:id", req.body, err.message, req.body.idVisitor);
        res.status(500).send("Erro interno");
    }
});

// Último draft do visitor
router.get('/last/:idVisitor', async (req, res) => {
    try {
        const { idVisitor } = req.params;
        if (!idVisitor) return res.status(400).send("idVisitor obrigatório");

        const draft = await Draft.findOne({ idVisitor, submitted: false }).sort({ createdAt: -1 });
        res.json(draft || {});
    } catch (err) {
        await logError(ErrorLog, "/api/draft/last/:idVisitor", req.params, err.message, req.params.idVisitor);
        res.status(500).send("Erro interno");
    }
});

// Envio final
router.put('/:id/send', async (req, res) => {
    try {
        const { id } = req.params;
        const draft = await Draft.findById(id);
        if (!draft) return res.status(404).send("Draft não encontrado");

        const finalData = {};
        for (const field in draft.logs) {
            finalData[field] = draft.logs[field]?.current || "";
        }

        await SentDraft.create({ idVisitor: draft.idVisitor, ...finalData });
        await Draft.findByIdAndDelete(id);

        res.json({ success: true });
    } catch (err) {
        await logError(ErrorLog, "/api/draft/:id/send", req.body, err.message);
        res.status(500).send("Erro interno");
    }
});

module.exports = router;
