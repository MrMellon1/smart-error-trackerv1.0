const express       = require('express');
const cors         = require('cors');
const rateLimit    = require('express-rate-limit'); // Görev 9: Eklendi
const { port }     = require('./config/env');
const errorRoutes  = require('./routes/errorRoutes');
const projectRoutes = require('./routes/projectRoutes');

const app = express();

// Görev 10: CORS'u Kısıtla
// Sadece güvendiğin domainlerin bu API'ye istek atmasına izin ver.
/* const corsOptions = {
  origin: ['https://senin-siten.com', 'http://localhost:5173', 'http://127.0.0.1:5500'],
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
*/
// Geliştirme aşamasında tüm originlere izin veriyoruz, production'da yukarıdaki gibi kısıtlayabilirsin.
app.use(cors());


app.use(express.json()); 

// Görev 9: Rate Limiting
// Özellikle hata loglama endpoint'ine flood (saldırı) yapılmasını engeller.
const errorLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 100, // Her IP için 15 dakikada en fazla 100 istek
  message: { error: 'Çok fazla istek gönderildi. Lütfen daha sonra tekrar deneyin.' }
});
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { error: 'Çok fazla istek gönderildi.' }
});

app.use('/api/projects', generalLimiter, projectRoutes);

// Rotalar
// Sadece errors rotasına limiter ekliyoruz
app.use('/api/errors', errorLimiter, errorRoutes); 

// Sağlık kontrolü
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Global hata yakalayıcı
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Sunucu hatası.' });
});

app.listen(port, () => {
  console.log(`Backend çalışıyor → http://localhost:${port}`);
});

module.exports = app;