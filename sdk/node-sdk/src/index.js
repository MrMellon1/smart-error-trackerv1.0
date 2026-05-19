const { createSender } = require('./sender');

const ErrorTracker = {
  init({ apiKey, endpoint = 'http://localhost:3000/api/errors' }) {
    this._send = createSender(apiKey, endpoint);

    // Node.js ortamındaki ölümcül hataları (crash) yakalar
    process.on('uncaughtException', (error) => {
      this.capture(error);
      console.error('[ErrorTracker] Uncaught Exception:', error);
    });

    // Node.js ortamındaki unutulmuş Promise hatalarını yakalar
    process.on('unhandledRejection', (reason) => {
      const error = reason instanceof Error ? reason : new Error(String(reason));
      this.capture(error);
      console.error('[ErrorTracker] Unhandled Rejection:', reason);
    });

    console.log('[ErrorTracker Node SDK] Başlatıldı.');
  },

  capture(error, context = {}) {
    if (!this._send) return;
    
    // Node.js için capture formatı (Tarayıcı olmadığı için userAgent Node.js yapılır)
    const payload = {
      message: error.message || String(error),
      stack: error.stack || null,
      userAgent: `Node.js ${process.version}`,
      timestamp: new Date().toISOString(),
      ...context
    };
    
    this._send(payload);
  }
};

module.exports = ErrorTracker;