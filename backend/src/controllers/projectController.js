const crypto = require('crypto');
const pool   = require('../config/db');

// 1. Proje Oluşturma
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

// 2. Projeleri Listeleme (Sol Menü İçin)
async function listProjects(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT id, name, api_key, created_at FROM projects ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

// 3. Proje Silme (Yeni Eklenen Fonksiyon)
async function deleteProject(req, res, next) {
  try {
    const { id } = req.params;
    
    // Veritabanında ON DELETE CASCADE olduğu için hatalar otomatik silinecektir
    const [result] = await pool.query('DELETE FROM projects WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Proje bulunamadı.' });
    }

    res.json({ message: 'Proje ve bağlı tüm hatalar başarıyla silindi.' });
  } catch (err) {
    next(err); // Hata olursa senin global hata yakalayıcına gönderiyoruz
  }
}

// Hepsini dışarıya aktarıyoruz
module.exports = { createProject, listProjects, deleteProject };