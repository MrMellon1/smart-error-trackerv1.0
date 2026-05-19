const { GoogleGenerativeAI } = require('@google/generative-ai');
const { ai } = require('../config/env');
const pool  = require('../config/db');

async function analyzeError(issueId, errorMessage, stackTrace) {
  console.log(`\n🤖 [AI SERVICE] ${issueId} ID'li yeni hata yakalandı. Analiz başlıyor...`);

  if (!ai.apiKey) {
    console.log('❌ [AI SERVICE] DURDURULDU: .env dosyasından AI_API_KEY okunamadı!');
    return;
  }

  console.log('✅ [AI SERVICE] API Key bulundu. Gemini modeline bağlanılıyor...');

  const safeErrorMessage = `[HATA MESAJI BAŞLANGICI]\n${errorMessage}\n[HATA MESAJI BİTİŞİ]`;
  const safeStackTrace = `[STACK TRACE BAŞLANGICI]\n${stackTrace || 'Mevcut değil'}\n[STACK TRACE BİTİŞİ]`;

  const prompt = `Aşağıdaki JavaScript hatasını analiz et ve Türkçe açıkla.
${safeErrorMessage}
${safeStackTrace}
Şu başlıkları kısaca yanıtla:
1. Hatanın muhtemel nedeni
2. En olası çözüm yöntemi
3. Tekrar oluşmaması için öneri`;

  try {
    const genAI = new GoogleGenerativeAI(ai.apiKey.trim());
    const modelName = ai.model ? ai.model.trim() : 'gemini-2.0-flash'; // 1.5 flash daha stabildir
    console.log(`🚀 [AI SERVICE] Kullanılan Model: ${modelName}. Cevap bekleniyor...`);

    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent(prompt);
    const explanation = result.response.text();

    console.log(`✅ [AI SERVICE] Gemini'den cevap başarıyla geldi! Veritabanına yazılıyor...`);

    await pool.query(
      'UPDATE issues SET ai_explanation = ? WHERE id = ?',
      [explanation, issueId]
    );

    console.log(`🎉 [AI SERVICE] İşlem tamamlandı. Panelden kontrol edebilirsiniz.\n`);
    return explanation;

  } catch (err) {
    console.error('❌ [AI SERVICE KRİTİK HATA]:', err.message);
  }
}

module.exports = { analyzeError };