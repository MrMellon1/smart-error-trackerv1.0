/**
 * Formatlanan hatayı backend API'ye gönderir.
 */
function createSender(apiKey, endpoint) {
  return async function send(payload) {
    try {
      await fetch(endpoint, {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload),
      });
    } catch (e) {
      // SDK hiçbir zaman uygulamayı patlatmamalı
      console.warn('[ErrorTracker] Gönderilemedi:', e.message);
    }
  };
}

module.exports = { createSender };
