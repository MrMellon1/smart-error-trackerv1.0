const crypto = require('crypto');

/**
 * Stack trace'i normalize edip tekrarlanabilir bir fingerprint üretir.
 * Satır/sütun numaralarını kaldırır → aynı hata her seferinde aynı hash'i verir.
 */
function generateFingerprint(errorMessage, stackTrace) {
  const cleanStack = (stackTrace || '')
    .split('\n')
    .slice(0, 5)                          // ilk 5 frame yeterli
    .map(line => line
      .replace(/:\d+:\d+/g, '')          // :satır:sütun kaldır
      .replace(/\?.*$/,     '')          // query string kaldır
      .trim()
    )
    .join('|');

  const raw = `${errorMessage}::${cleanStack}`;
 return crypto.createHash('sha256').update(raw).digest('hex');
}

module.exports = { generateFingerprint };
