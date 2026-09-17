// ============================================================
// utils.js
// Hem site.js hem admin.js tarafından kullanılan küçük, genel
// amaçlı yardımcı fonksiyonlar.
// ============================================================

// Belirtilen ay/yıl için o ayın kaç gün çektiğini döndürür (artık yıl dahil).
function daysInMonth(month, year){
  return new Date(year, month, 0).getDate();
}

// Google E-Tablosu'ndan gelen saat değerini "HH:MM" formatına indirger.
// "09:00 - 10:00" -> "09:00", "9:00:00" -> "09:00" gibi farklı olası
// biçimleri tek bir standarda çevirir.
function normalizeTime(time){
  if(!time) return '';
  let value = String(time).trim();
  if(value.includes(' - ')) value = value.split(' - ')[0].trim();
  if(/^\d{1,2}:\d{2}:\d{2}$/.test(value)) value = value.slice(0,5);
  const match = value.match(/^(\d{1,2}):(\d{2})$/);
  if(!match) return value;
  return String(parseInt(match[1],10)).padStart(2,'0') + ':' + match[2];
}

// Kullanıcıdan gelen metni HTML olarak basmadan önce güvenli hale getirir
// (ör. isim alanına birisi <script> yazarsa sorun çıkmasın diye).
function escapeHtml(str){
  const div = document.createElement('div');
  div.textContent = str == null ? '' : str;
  return div.innerHTML;
}

// Google Apps Script GET isteklerinin tarayıcı/operatör tarafından
// önbelleğe alınmasını engellemek için URL'ye rastgele bir parametre ekler.
function withCacheBust(url){
  return url + (url.includes('?') ? '&' : '?') + 't=' + Date.now();
}

// Backend'den (Google E-Tablosu) tüm randevuları çeker.
// Hem site.js (müsaitlik kontrolü için) hem admin.js (liste için) kullanır.
async function fetchAllAppointments(){
  try{
    const response = await fetch(withCacheBust(SCRIPT_URL), { method: 'GET', cache: 'no-store' });
    const result = await response.json();
    return Array.isArray(result && result.appointments) ? result.appointments : [];
  }catch(err){
    console.error('Randevular çekilirken hata:', err);
    return [];
  }
}
