
# Bu proje, örnek bir ekosistem olarak aktif olarak geliştirilmektedir. Katkılarınız ve geri bildirimleriniz memnuniyetle karşılanacaktır!



# ⚡ SmartTrack: Yapay Zeka Destekli Gerçek Zamanlı Hata Takip Ekosistemi (Enterprise Error Tracker)

SmartTrack, modern web uygulamalarında (Browser ve Node.js ortamlarında) meydana gelen kritik hataları, istisnaları (uncaught exceptions) ve çözümlenmemiş asenkron reddedilmeleri (unhandled rejections) merkezi bir sunucuda toplayan, anlamlandıran ve **Google Gemini AI** entegrasyonu ile otomatik olarak analiz eden tam teşekküllü bir **kurumsal yazılım ekosistemidir**.

Bu proje; Temel seviyede kendi özel SDK yapılarına sahip olması, ilişkisel veritabanı optimizasyonları barındırması, siber güvenlik standartlarına (Rate Limiting, CORS ve Environment İzolasyonu) uygun olarak tasarlanması ve şık bir Vanilla JS Dashboard sunması nedeniyle geliştirme aşamasında olan bir portföy çalışmasıdır.

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

### 2. Siber Güvenlik ve Defansif Mimari

### 3. İlişkisel Veritabanı ve Performans İndeksleri

### 4. Şık Markdown Parser ve Esnek Arayüz

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
git clone [https://github.com/MrMellon1/smart-error-trackerv1.0.git](https://github.com/MrMellon1/smart-error-trackerv1.0.git)
cd smart-error-trackerv1/backend
npm install