async function logError(ErrorLog, route, body, message, visitor = "desconhecido") {
    try {
        await ErrorLog.create({ route, body, message, visitor });
    } catch (err) {
        console.error("Falha ao registrar erro:", err.message);
    }
}

module.exports = { logError };
