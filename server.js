require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const visitRoutes = require('./routes/visit');
const draftRoutes = require('./routes/draft');

const app = express();

// Middlewares
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Rotas
app.use('/api/visit', visitRoutes);
app.use('/api/draft', draftRoutes);

// Inicialização do Mongo e servidor
async function startServer() {
    try {
        await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('MongoDB conectado');

        app.listen(3000, () => console.log("Servidor rodando na porta 3000"));
    } catch (err) {
        console.error("Falha ao iniciar servidor:", err);
        process.exit(1);
    }
}

startServer();
