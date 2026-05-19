const pool = require('../config/db');

/**
 * Her istekte Authorization header'ındaki API key'i doğrular.
 * Header formatı: Authorization: Bearer <api_key>
 */
async function authMiddleware(req, res, next) {
  const header = req.headers['authorization'] || '';
  const apiKey = header.replace('Bearer ', '').trim();

  if (!apiKey) {
    return res.status(401).json({ error: 'API key eksik.' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT id, name FROM projects WHERE api_key = ? LIMIT 1',
      [apiKey]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Geçersiz API key.' });
    }

    req.project = rows[0]; // sonraki katmanlara proje bilgisini taşı
    next();
  } catch (err) {
    next(err);
  }
}

// Admin secret kontrolü — proje oluşturma için
async function adminMiddleware(req, res, next) {
  const secret = req.headers['x-admin-secret'] || '';
  if (secret !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ error: 'Yetkisiz erişim.' });
  }
  next();
}

module.exports = { authMiddleware, adminMiddleware };

