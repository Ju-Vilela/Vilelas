const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema({
    idVisitor: String,
    ips: [String],              // ips
    locations: [{
        country: String,        // país
        region: String,         // região
        city: String,           // cidade
        ll: [Number],           // latitude - longitude
        date: { type: Date, default: Date.now }
    }],
    devices: [{
        type: { type: String }, // celular/desktop
        vendor: String,         // fabricante
        model: String,          // modelo
        os: String,             // sistema operacional
        browser: String,        // navegador
        date: { type: Date, default: Date.now }
    }],
    pages: [{
        path: String,
        date: { type: Date, default: Date.now }
    }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});


const draftSchema = new mongoose.Schema({
        idVisitor: String,
        logs: {
            nome: { current: String, full: [String], deleted: [String] },
            email: { current: String, full: [String], deleted: [String] },
            telefone: { current: String, full: [String], deleted: [String] },
            empresa: { current: String, full: [String], deleted: [String] },
            mensagem: { current: String, full: [String], deleted: [String] }
        },
        submitted: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now }
    },
    { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
);

const sentDraftSchema = new mongoose.Schema({
    idVisitor: String,
    nome: String,
    email: String,
    telefone: String,
    empresa: String,
    mensagem: String,
    sentAt: { type: Date, default: Date.now }
});

const errorSchema = new mongoose.Schema({
    route: String,
    body: mongoose.Schema.Types.Mixed,
    message: String,
    visitor: String,
    date: { type: Date, default: Date.now }
});

module.exports = {
    Visit: mongoose.model("Visit", visitSchema),
    Draft: mongoose.model("Draft", draftSchema),
    SentDraft: mongoose.model("SentDraft", sentDraftSchema),
    ErrorLog: mongoose.model("ErrorLog", errorSchema)
};
