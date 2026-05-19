# ⚡ SmartTrack: Yapay Zeka Destekli Gerçek Zamanlı Hata Takip Ekosistemi (Enterprise Error Tracker)

SmartTrack, modern web uygulamalarında (Browser ve Node.js ortamlarında) meydana gelen kritik hataları, istisnaları (uncaught exceptions) ve çözümlenmemiş asenkron reddedilmeleri (unhandled rejections) merkezi bir sunucuda toplayan, anlamlandıran ve **Google Gemini AI** entegrasyonu ile otomatik olarak analiz eden tam teşekküllü bir **kurumsal yazılım ekosistemidir**.

Bu proje; kendi özel SDK yapılarına sahip olması, ilişkisel veritabanı optimizasyonları barındırması, siber güvenlik standartlarına (Rate Limiting, CORS ve Environment İzolasyonu) uygun olarak tasarlanması ve şık bir Vanilla JS Dashboard sunması nedeniyledüzeyde bir portföy çalışmasıdır.

---

## 🏗️ Ekosistem Mimarisi

SmartTrack, birbirinden bağımsız çalışan ama tam uyumla haberleşen 4 ana katmandan oluşur:

1. **SmartTrack Client SDK (Tarayıcı & Node.js):** İstemci veya sunucu tarafında çalışır. Uygulamayı küresel ölçekte dinler, bir hata fırlatıldığı anda hatanın mesajını, stack trace verisini, satır/sütun bilgisini, kullanıcı tarayıcı (User-Agent) verilerini paketleyerek backend API'sine asenkron olarak fırlatır.
2. **SmartTrack Core Backend (Node.js & Express):** SDK'lerden gelen yoğun veri akışını (ingestion) karşılar. Güvenlik katmanlarından geçirir, gelen hataları benzersiz parmak izlerine (fingerprint) göre gruplar ve asenkron kuyruk yapısıyla yapay zeka servisini tetikler.
3. **SmartTrack AI Engine (Google Gemini Entegrasyonu):** Yakalanan karmaşık hata yığınlarını (Stack Trace) analiz eder. Hatanın neden kaynaklandığını, en olası çözüm yöntemini ve kodun tekrar patlamaması için mimari önerileri Türkçe olarak sentezler.
4. **SmartTrack Enterprise Dashboard (Vanilla HTML5 & Tailwind CSS):** Yönetim panelidir. Grafikler (ApexCharts) üzerinden sistem sağlığını anlık izleme, hata detaylarına inme, AI analizlerini okuma ve hataları "Çözüldü" olarak işaretleme imkanı sunar.

---

## 🚀 Öne Çıkan Gelişmiş Özellikler

### 1. Akıllı Parmak İzi (Fingerprint) ve "isNew" Optimizasyonu
Aynı hata (örneğin bir veritabanı kopması veya tanımsız değişken çağrısı) binlerce kez tetiklenebilir. SmartTrack, gelen her hatayı doğrudan kaydetmek yerine hata mesajı ve lokasyonundan dinamik bir **parmak izi (fingerprint)** üretir.
* Hata sisteme **ilk kez** düşüyorsa veritabanında yeni bir grup oluşturulur ve **Gemini AI anında tetiklenerek** analiz hazırlanır.
* Hata daha önce oluşmuşsa, yapay zekaya tekrar istek atıp kotayı tüketmemek için sadece hata tetiklenme sayacı (`occurrence_count`) artırılır ve son görülme tarihi güncellenir.

### 2. Siber Güvenlik ve Defansif Mimari
* **DDoS ve Flood Koruması (Rate Limiting):** `express-rate-limit` entegrasyonu sayesinde, bir uygulamanın döngüye girip (infinite loop) backend'e saniyede binlerce hata göndererek sistemi kilitlemesi engellenir. Hata loglama endpoint'i IP başına sınırlandırılmıştır.
* **Güvenlik Duvarı & CORS:** API kapıları varsayılan olarak korumalıdır. Production aşamasında sadece yetkilendirilmiş domainlerin (whitelist) sisteme veri basmasına izin verecek altyapıya sahiptir.
* **Environment İzolasyonu:** Tüm kritik şifreler, veritabanı kimlik bilgileri, JWT secret anahtarları ve Google AI Studio API anahtarı kodun içinden tamamen arındırılmış, `.env` dosyasında izole edilmiştir.

### 3. İlişkisel Veritabanı ve Performans İndeksleri
Veritabanı şeması (`schema.sql`), yüksek veri trafiği altında bile tıkanmayacak şekilde tasarlanmıştır:
* `projects`, `issues` ve `errors` tabloları arasında `FOREIGN KEY` ilişkileri kurulmuştur.
* `ON DELETE CASCADE` kurgusu sayesinde bir proje silindiğinde ona ait milyonlarca hata logu veritabanında çöp bırakmayacak şekilde otomatik olarak temizlenir.
* **B-Tree İndeksleme:** Sık aranan alanlar (`project_id`, `fingerprint`, `issue_id`) üzerinde özel indeksler (`CREATE INDEX`) tanımlanarak panelin listeleme ve arama hızı mikro saniyeler seviyesine indirilmiştir.

### 4. Şık Markdown Parser ve Esnek Arayüz
Yapay zekanın ürettiği teknik yanıtlar (Markdown formatındaki başlıklar, kalın yazılar, satır içi kod blokları) frontend tarafında özel bir regex parser fonksiyonu yardımıyla dinamik olarak şık HTML bileşenlerine dönüştürülür. Taşma (overflow) sorunları esnek flex yapısı ve modern scroll barları ile çözülmüştür.

---

## 🛠️ Teknoloji Yığını (Tech Stack)

* **Backend:** Node.js, Express.js, @google/generative-ai, dotenv, cors, express-rate-limit, MySQL / PostgreSQL Connector
* **Frontend:** HTML5, Tailwind CSS (Dark Mode Native), Vanilla JavaScript (ES6+), ApexCharts, FontAwesome Esaslı İkon Seti
* **Veritabanı / Veri Yönetimi:** SQL, İlişkisel Şema Tasarımı, Veritabanı İndeksleme Optimizasyonları

---

## ⚙️ Kurulum ve Yapılandırma

### 1. Gereksinimler
* Node.js (v16 veya üzeri)
* Bir SQL Veritabanı (MySQL/MariaDB uyumlu)
* Google AI Studio hesabından alınmış ücretsiz bir **Gemini API Key**

### 2. Projeyi Klonlama ve Paket Kurulumu (deploy etmeden önce bu URL'i değiştirin)
```bash
git clone [https://github.com/seyithamitcakar/smart-error-tracker.git](https://github.com/seyithamitcakar/smart-error-tracker.git)
cd smart-error-tracker/backend
npm install