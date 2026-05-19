const https = require('https');
const http  = require('http');
const url   = require('url');

function createSender(apiKey, endpoint) {
  return function send(payload) {
    const parsed  = url.parse(endpoint);
    const body    = JSON.stringify(payload);
    const options = {
      hostname: parsed.hostname,
      port:     parsed.port,
      path:     parsed.path,
      method:   'POST',
      headers: {
        'Content-Type':   'application/json',
        'Content-Length': Buffer.byteLength(body),
        'Authorization':  `Bearer ${apiKey}`,
      },
    };

    const lib = parsed.protocol === 'https:' ? https : http;
    const req = lib.request(options);
    req.on('error', () => {}); // sessizce geç
    req.write(body);
    req.end();
  };
}

module.exports = { createSender };
