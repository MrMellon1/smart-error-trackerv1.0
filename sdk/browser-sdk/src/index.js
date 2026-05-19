const { captureError } = require('./capture');
const { createSender } = require('./sender');

const ErrorTracker = {
  init({ apiKey, endpoint = 'http://localhost:3000/api/errors' }) {
    // DÜZELTME: send fonksiyonunu class'ın (objenin) içine kaydediyoruz
    this._send = createSender(apiKey, endpoint); 

    window.onerror = (message, source, lineno, colno, error) => {
      this._send(captureError(error || new Error(message)));
    };

    window.onunhandledrejection = (event) => {
      const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
      this._send(captureError(error));
    };

    console.log('[ErrorTracker Browser SDK] Başlatıldı.');
  },

  capture(error, context) {
    if (this._send) this._send(captureError(error, context));
  },
};

module.exports = ErrorTracker;