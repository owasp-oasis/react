#!/usr/bin/env node

const finalhandler = require('finalhandler');
const https = require('https');
const fs = require('fs');
const serveStatic = require('serve-static');

// Serve fixtures folder
const serve = serveStatic(__dirname, {index: 'index.html'});

// Create server
const tlsOptions = {
  key: fs.readFileSync(process.env.SSL_KEY_FILE || 'server.key'),
  cert: fs.readFileSync(process.env.SSL_CERT_FILE || 'server.cert'),
};
const server = https.createServer(tlsOptions, function onRequest(req, res) {
  serve(req, res, finalhandler(req, res));
});

// Listen
server.listen(3000);
