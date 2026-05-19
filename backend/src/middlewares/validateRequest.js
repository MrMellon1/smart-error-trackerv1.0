/**
 * POST /api/errors için gelen body'yi doğrular.
 * message zorunlu, geri kalanlar opsiyonel.
 */
function validateErrorPayload(req, res, next) {
  const { message } = req.body;

  if (!message || typeof message !== 'string' || message.trim() === '') {
    return res.status(400).json({ error: '"message" alanı zorunlu.' });
  }

  next();
}

module.exports = { validateErrorPayload };
