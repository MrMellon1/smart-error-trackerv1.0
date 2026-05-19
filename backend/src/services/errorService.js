const pool = require('../config/db');
const { generateFingerprint } = require('../utils/hashHelper');

/**
 * Gelen hatayı kaydeder ve gruplama yapar.
 * Aynı fingerprint varsa → issue'nun count'unu artır.
 * Yoksa → yeni issue ve error kaydı oluştur.
 */
async function saveError({ projectId, message, stackTrace, url, userAgent }) {
  const fingerprint = generateFingerprint(message, stackTrace);

  // Mevcut issue var mı?
  const [existing] = await pool.query(
    'SELECT id FROM issues WHERE project_id = ? AND fingerprint = ? LIMIT 1',
    [projectId, fingerprint]
  );

  let issueId;

  if (existing.length > 0) {
    issueId = existing[0].id;
    await pool.query(
      'UPDATE issues SET occurrence_count = occurrence_count + 1, last_seen = NOW() WHERE id = ?',
      [issueId]
    );
  } else {
    const [result] = await pool.query(
      `INSERT INTO issues (project_id, fingerprint, title, occurrence_count, status, first_seen, last_seen)
       VALUES (?, ?, ?, 1, 'open', NOW(), NOW())`,
      [projectId, fingerprint, message.substring(0, 255)]
    );
    issueId = result.insertId;
  }

  // Ham hata kaydını her zaman ekle
  await pool.query(
    `INSERT INTO errors (project_id, issue_id, message, stack_trace, url, user_agent)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [projectId, issueId, message, stackTrace || null, url || null, userAgent || null]
  );

  return { issueId, fingerprint, isNew: existing.length === 0 };
}

async function getIssues(projectId, status) {
  const query = status
    ? 'SELECT * FROM issues WHERE project_id = ? AND status = ? ORDER BY last_seen DESC'
    : 'SELECT * FROM issues WHERE project_id = ? ORDER BY last_seen DESC';
  const params = status ? [projectId, status] : [projectId];
  const [rows] = await pool.query(query, params);
  return rows;
}

async function getIssueById(issueId) {
  const [issues] = await pool.query('SELECT * FROM issues WHERE id = ? LIMIT 1', [issueId]);
  const [errors] = await pool.query(
    'SELECT * FROM errors WHERE issue_id = ? ORDER BY created_at DESC LIMIT 20',
    [issueId]
  );
  return { issue: issues[0], errors };
}

async function updateIssueStatus(issueId, status) {
  await pool.query('UPDATE issues SET status = ? WHERE id = ?', [status, issueId]);
}

module.exports = { saveError, getIssues, getIssueById, updateIssueStatus };
