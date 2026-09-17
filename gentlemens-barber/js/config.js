// ============================================================
// config.js — Tüm site ayarları tek yerde.
// ============================================================

const SHOP_NAME = "Gentlemen's Barber Kuaför";
const SHOP_SHORT = "Gentlemen's Barber";
const LOCATION_NAME = "Sultanbeyli";

const ADDRESS = "Yavuz Selim, Antalya Cd. No:8c, 34000 Sultanbeyli/İstanbul";
const MAPS_LINK = "https://maps.google.com/maps/place//data=!4m2!3m1!1s0x14cad13dac62c0dd:0xd207affa754a9b48?entry=s&sa=X&ved=2ahUKEwjR5ZP-2ueWAxVn_7sIHUibJiUQ4kB6BAgEEAA&hl=tr";
const MAP_LAT = 40.9523306;
const MAP_LNG = 29.2806539;

const WHATSAPP_NUMBER = "905333207834";
const PHONE_DISPLAY = "0533 320 78 34";
const INSTAGRAM_URL = "https://www.instagram.com/gentlemensbarbershop34?stkn=NWRnZmhzNjY2OWNq";

// Google Haritalar'dan doğrulanmış gerçek veriler (uydurma değil).
const GOOGLE_RATING = "5.0";
const GOOGLE_RATING_COUNT = "448";

// Gerçek çalışma saatleri (Google Haritalar).
const WORKING_HOURS = [
  { day: "Pazartesi – Perşembe", hours: "09:00 – 23:00" },
  { day: "Cuma – Cumartesi",     hours: "09:00 – 00:00" },
  { day: "Pazar",                hours: "Kapalı" },
];

// Online randevu sistemi şu saat aralığında hizmet verir
// (mesai saatlerinden farklı olarak sabit tutuldu).
const BOOKING_START_HOUR = 9;
const BOOKING_END_HOUR = 21;

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxdMhM2G2qx--yyHykC7KRRgCNlCRdsBWHw-MgR7APK-SiZIboEE7PPOdu8YWiXyMk/exec";
const ADMIN_PASSWORD = "175886963";

// Sunulan hizmetler. "features" küçük madde işaretli detaylar için.
const SERVICES = [
  {
    id: 'sac', name: 'Saç Kesimi', tag: 'En Popüler', price: '150₺',
    desc: 'Yüz şeklinize özel makas ve makine teknikleriyle modern ve klasik kesimler.',
    features: ['Saç yıkama dahil', 'Stil danışmanlığı', 'Şekillendirme ürünü']
  },
  {
    id: 'sakal', name: 'Sakal Tıraşı', tag: 'Klasik Ustalık', price: '100₺',
    desc: 'Klasik ustura ile pürüzsüz düz tıraş ve hassas sakal şekillendirme.',
    features: ['Sıcak havlu uygulaması', 'Ustura tıraşı', 'After-shave bakım']
  },
  {
    id: 'sac_sakal', name: 'Saç + Sakal', tag: 'Kombo', price: '220₺',
    desc: 'Saç kesimi ve sakal tıraşı bir arada; tek seansta tam bakım.',
    features: ['Saç yıkama dahil', 'Ustura & şekillendirme', 'Zamandan tasarruf']
  },
  {
    id: 'cocuk', name: 'Çocuk Tıraşı', tag: 'Aile Dostu', price: '120₺',
    desc: 'Çocuklar için sabırlı ve özenli, keyifli bir tıraş deneyimi.',
    features: ['Rahat ve güvenli ortam', 'Sevdiği stile uygun kesim']
  },
  {
    id: 'damat', name: 'Damat Tıraşı', tag: 'Özel Gün', price: '350₺',
    desc: 'Özel gününüz için baştan aşağı özel bakım ve şekillendirme paketi.',
    features: ['Saç + sakal + cilt bakımı', 'Detaylı stil çalışması']
  },
  {
    id: 'cilt', name: 'Yüz / Cilt Bakımı', tag: 'Tazelenme', price: '150₺',
    desc: 'Erkek cildine özel derin temizlik, buhar uygulaması ve nemlendirme.',
    features: ['Derin gözenek temizliği', 'Buhar uygulaması', 'Nemlendirici maske']
  },
  {
    id: 'fon', name: 'Fön & Şekillendirme', tag: 'Hızlı', price: '80₺',
    desc: 'Günlük kullanım veya özel anlar için profesyonel fön ve şekillendirme.',
    features: ['Hızlı uygulama', 'Uzun süre kalıcı stil']
  },
  {
    id: 'boya', name: 'Saç Boyama', tag: 'Yenilenme', price: '250₺',
    desc: 'Doğal görünümlü, kaliteli ürünlerle saç boyama ve ton çalışması.',
    features: ['Profesyonel ürünler', 'Renk danışmanlığı']
  },
];

const MONTHS = [
  'Ocak','Şubat','Mart','Nisan','Mayıs','Haziran',
  'Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'
];

function buildTimeSlots(){
  const slots = [];
  for(let h = BOOKING_START_HOUR; h < BOOKING_END_HOUR; h++){
    const start = String(h).padStart(2,'0') + ':00';
    const end = String(h+1).padStart(2,'0') + ':00';
    slots.push(start + ' - ' + end);
  }
  return slots;
}
const TIME_SLOTS = buildTimeSlots();
