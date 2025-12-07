const express = require('express');
const router = express.Router();
const geoip = require('geoip-lite');
const UAParser = require('ua-parser-js');
const { Visit, ErrorLog } = require('../models');
const { logError } = require('../utils');

router.post('/', async (req, res) => {
    try {
        const { idVisitor, page } = req.body;
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const geo = geoip.lookup(ip) || {};
        const ua = new UAParser(req.headers['user-agent']).getResult();

        const update = {
            $set: { updatedAt: new Date() },
            $push: {
                ips: ip,
                pages: { path: page, date: new Date() },
                locations: {
                    country: geo.country || '',
                    region: geo.region || '',
                    city: geo.city || '',
                    ll: geo.ll || [],
                    date: new Date()
                },
                devices: {
                    type: ua.device.type || 'desktop',
                    vendor: ua.device.vendor || '',
                    model: ua.device.model || '',
                    os: ua.os.name || '',
                    browser: ua.browser.name || '',
                    date: new Date()
                }
            }
        };

        await Visit.findOneAndUpdate( { idVisitor }, update, { upsert: true, new: true } );
        res.json({ success: true });
    } 
    catch (err) {
        console.error("ERRO VISIT:", err);
        await logError(ErrorLog, "/api/visit", req.body, err.message, req.body.idVisitor);
        res.status(500).send("Erro interno");
    }
});

module.exports = router;
