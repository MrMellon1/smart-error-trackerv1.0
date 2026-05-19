/**
 * Tarayıcıdan gelen ham hata verisini backend'in beklediği formata çevirir.
 */
function captureError(error, context = {}) {
  return {
    message:   error.message  || String(error),
    stack:     error.stack    || null,
    url:       window.location.href,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
    ...context,
  };
}

module.exports = { captureError };
