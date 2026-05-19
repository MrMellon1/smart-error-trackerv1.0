const crypto = require('crypto');
const pool   = require('../config/db');

async function createProject(req, res, next) {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Proje adı zorunlu.' });

    const apiKey = crypto.randomBytes(32).toString('hex');
    const [result] = await pool.query(
      'INSERT INTO projects (name, api_key) VALUES (?, ?)',
      [name, apiKey]
    );

    res.status(201).json({ id: result.insertId, name, apiKey });
  } catch (err) {
    next(err);
  }
}

async function listProjects(req, res, next) {
  try {
    // Sadece id ve name değil, api_key'i de çekiyoruz
    const [rows] = await pool.query('SELECT id, name, api_key, created_at FROM projects ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

module.exports = { createProject, listProjects };
