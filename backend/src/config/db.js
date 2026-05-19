const mysql = require('mysql2/promise');
const { db } = require('./env');

const pool = mysql.createPool({
  host:               db.host,
  user:               db.user,
  password:           db.password,
  database:           db.database,
  port:               db.port,
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
});

// Veritabanı bağlantı kontrolü ve hata durumunda durdurma (Görev 7)
pool.getConnection()
  .then(connection => {
    console.log('✅ Veritabanı bağlantısı başarılı.');
    connection.release();
  })
  .catch(err => {
    console.error('❌ Veritabanı bağlantı hatası:', err.message);
    process.exit(1); // Uygulamayı güvenli şekilde durdur
  });

module.exports = pool;