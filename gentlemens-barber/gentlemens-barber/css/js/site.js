// ============================================================
// site.js — index.html için tüm interaktif mantık.
// config.js, icons.js, utils.js, theme.js bu dosyadan ÖNCE yüklenmeli.
// ============================================================

let existingAppointments = [];

document.addEventListener('DOMContentLoaded', function(){
  renderShopInfo();
  renderWorkingHours();
  renderServiceCards();
  renderPriceList();
  populateFormSelects();
  populateDays();
  fetchAppointmentsForSlots();
  setupScrollReveal();

  document.getElementById('f-day').addEventListener('change', updateTimeSlots);
  document.getElementById('f-month').addEventListener('change', () => { populateDays(); fetchAppointmentsForSlots(); });
  document.getElementById('f-year').addEventListener('change', () => { populateDays(); fetchAppointmentsForSlots(); });
  document.getElementById('booking-form').addEventListener('submit', handleBookingSubmit);
});

// ---------- Dükkan bilgilerini (config.js'ten) sayfaya basar ----------
function renderShopInfo(){
  document.querySelectorAll('.js-shop-name').forEach(el => el.textContent = SHOP_NAME);
  document.querySelectorAll('.js-shop-short').forEach(el => el.textContent = SHOP_SHORT);
  document.querySelectorAll('.js-location').forEach(el => el.textContent = LOCATION_NAME);
  document.querySelectorAll('.js-address').forEach(el => el.textContent = ADDRESS);
  document.querySelectorAll('.js-phone').forEach(el => el.textContent = PHONE_DISPLAY);
  document.querySelectorAll('.js-rating').forEach(el => el.textContent = GOOGLE_RATING);
  document.querySelectorAll('.js-rating-count').forEach(el => el.textContent = GOOGLE_RATING_COUNT);
  document.querySelectorAll('.js-service-count').forEach(el => el.textContent = SERVICES.length);

  document.querySelectorAll('.js-logo-icon').forEach(el => el.innerHTML = logoMarkSVG());

  const mapFrame = document.getElementById('map-frame');
  if(mapFrame) mapFrame.src = `https://www.google.com/maps?q=${MAP_LAT},${MAP_LNG}&z=16&output=embed`;

  document.querySelectorAll('.js-whatsapp-link').forEach(el => {
    el.href = `https://wa.me/${WHATSAPP_NUMBER}?text=Merhaba%2C%20randevu%20almak%20istiyorum.`;
  });
  document.querySelectorAll('.js-instagram-link').forEach(el => { el.href = INSTAGRAM_URL; });
  document.querySelectorAll('.js-maps-link').forEach(el => { el.href = MAPS_LINK; });
  document.querySelectorAll('.js-phone-link').forEach(el => { el.href = `tel:+${WHATSAPP_NUMBER}`; });

  // İkonlu butonların içeriği (metin + ikon)
  document.querySelectorAll('.js-whatsapp-icon').forEach(el => el.innerHTML = whatsappIconSVG());
  document.querySelectorAll('.js-instagram-icon').forEach(el => el.innerHTML = instagramIconSVG());
  document.querySelectorAll('.js-pin-icon').forEach(el => el.innerHTML = pinIconSVG());
  document.querySelectorAll('.js-phone-icon').forEach(el => el.innerHTML = phoneIconSVG());
  document.querySelectorAll('.js-clock-icon').forEach(el => el.innerHTML = clockIconSVG());
}

// ---------- Çalışma saatleri tablosu ----------
function renderWorkingHours(){
  const table = document.getElementById('hours-table');
  if(!table) return;
  table.innerHTML = WORKING_HOURS.map(row => `
    <tr><td>${row.day}</td><td>${row.hours}</td></tr>
  `).join('');
}

// ---------- Hizmetler bölümü: kart görünümü ----------
function renderServiceCards(){
  const grid = document.getElementById('services-grid');
  if(!grid) return;
  const serviceIcons = [scissorIconSVG, razorIconSVG, sparkleIconSVG, faceIconSVG, sparkleIconSVG, faceIconSVG, windIconSVG, paletteIconSVG];
  grid.innerHTML = SERVICES.map((s, i) => `
    <div class="service-card">
      <div class="icon">${serviceIcons[i % serviceIcons.length]()}</div>
      <div class="tag">${s.tag}</div>
      <h3>${s.name}</h3>
      <div class="price">${s.price}</div>
      <p>${s.desc}</p>
    </div>
  `).join('');
}

// ---------- Fiyat listesi bölümü: detaylı kartlar ----------
function renderPriceList(){
  const list = document.getElementById('price-list');
  if(!list) return;
  list.innerHTML = SERVICES.map(s => `
    <div class="price-item">
      <div class="price-item-top">
        <div>
          <div class="tag">${s.tag}</div>
          <h3>${s.name}</h3>
        </div>
        <div class="price">${s.price}</div>
      </div>
      <p>${s.desc}</p>
      <ul class="feature-list">
        ${s.features.map(f => `<li><span class="check">${checkIconSVG()}</span>${f}</li>`).join('')}
      </ul>
    </div>
  `).join('');
}

// ---------- Form seçim kutularını doldurur ----------
function populateFormSelects(){
  document.getElementById('f-service').innerHTML =
    SERVICES.map(s => `<option value="${s.id}">${s.name} — ${s.price}</option>`).join('');

  document.getElementById('f-month').innerHTML =
    MONTHS.map((m,i) => `<option value="${i+1}">${m}</option>`).join('');

  const currentYear = new Date().getFullYear();
  document.getElementById('f-year').innerHTML =
    [currentYear, currentYear+1].map(y => `<option value="${y}">${y}</option>`).join('');

  document.getElementById('f-time').innerHTML =
    TIME_SLOTS.map(t => `<option value="${t}">${t}</option>`).join('');
}

// ---------- Seçilen ay/yıla göre gün seçeneklerini üretir ----------
function populateDays(){
  const monthSel = document.getElementById('f-month');
  const yearSel = document.getElementById('f-year');
  const daySel = document.getElementById('f-day');

  const now = new Date();
  const todayYear = now.getFullYear();
  const todayMonth = now.getMonth() + 1;
  const todayDay = now.getDate();

  const month = parseInt(monthSel.value || String(todayMonth), 10);
  const year = parseInt(yearSel.value || String(todayYear), 10);
  const count = daysInMonth(month, year);
  const oldValue = parseInt(daySel.value || '0', 10);

  const days = [];
  for(let d = 1; d <= count; d++){
    const isPastDay =
      year < todayYear ||
      (year === todayYear && month < todayMonth) ||
      (year === todayYear && month === todayMonth && d < todayDay);
    if(!isPastDay) days.push(`<option value="${d}">${d}</option>`);
  }
  daySel.innerHTML = days.join('');

  if(oldValue && Array.from(daySel.options).some(o => Number(o.value) === oldValue)){
    daySel.value = String(oldValue);
  }else if(daySel.options.length){
    daySel.selectedIndex = 0;
  }
  updateTimeSlots();
}

async function fetchAppointmentsForSlots(){
  existingAppointments = await fetchAllAppointments();
  updateTimeSlots();
}

function updateTimeSlots(){
  const daySel = document.getElementById('f-day');
  const monthSel = document.getElementById('f-month');
  const yearSel = document.getElementById('f-year');
  const timeSel = document.getElementById('f-time');
  if(!daySel.value) return;

  const day = String(daySel.value).padStart(2,'0');
  const month = String(monthSel.value).padStart(2,'0');
  const year = String(yearSel.value);
  const selectedDateStr = `${year}-${month}-${day}`;

  const bookedTimes = existingAppointments
    .filter(a => String(a.date || '').slice(0,10) === selectedDateStr)
    .map(a => normalizeTime(a.time))
    .filter(Boolean);

  const html = TIME_SLOTS.map(slot => {
    const slotTime = normalizeTime(slot);
    const [hour, minute] = slotTime.split(':').map(Number);
    const slotDate = new Date(Number(year), Number(month)-1, Number(day), hour, minute, 0, 0);
    const isPast = slotDate.getTime() < Date.now();
    const isBooked = bookedTimes.includes(slotTime);

    if(isBooked) return `<option value="${slot}" disabled style="color:#d15965;">${slot} (DOLU)</option>`;
    if(isPast)   return `<option value="${slot}" disabled style="color:#888;">${slot} (GEÇTİ)</option>`;
    return `<option value="${slot}">${slot}</option>`;
  }).join('');

  timeSel.innerHTML = html;
  const firstAvailable = Array.from(timeSel.options).find(o => !o.disabled);
  if(firstAvailable) timeSel.value = firstAvailable.value;
}

function isAppointmentAlreadyBooked(dateStr, time){
  const wanted = normalizeTime(time);
  return existingAppointments.some(a =>
    String(a.date || '').slice(0,10) === dateStr && normalizeTime(a.time) === wanted
  );
}

async function handleBookingSubmit(e){
  e.preventDefault();
  const msgBox = document.getElementById('form-msg');
  msgBox.innerHTML = '';

  const name = document.getElementById('f-name').value.trim();
  const phone = document.getElementById('f-phone').value.trim();
  const serviceId = document.getElementById('f-service').value;
  const day = parseInt(document.getElementById('f-day').value, 10);
  const month = parseInt(document.getElementById('f-month').value, 10);
  const year = parseInt(document.getElementById('f-year').value, 10);
  const time = document.getElementById('f-time').value;

  if(!name || !phone){
    msgBox.innerHTML = '<div class="msg err">Lütfen ad soyad ve telefon bilgisi girin.</div>';
    return;
  }
  if(!time){
    msgBox.innerHTML = '<div class="msg err">Lütfen boş bir saat seçin.</div>';
    return;
  }

  const service = SERVICES.find(s => s.id === serviceId);
  const dateStr = `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
  const startTime = normalizeTime(time);
  const chosen = new Date(`${dateStr}T${startTime}:00`);

  if(chosen.getTime() < Date.now()){
    msgBox.innerHTML = '<div class="msg err">Geçmiş bir tarih/saat için randevu alınamaz.</div>';
    return;
  }
  if(isAppointmentAlreadyBooked(dateStr, startTime)){
    updateTimeSlots();
    msgBox.innerHTML = '<div class="msg err">Bu tarih ve saat zaten dolu. Lütfen başka bir saat seçin.</div>';
    return;
  }

  const submitBtn = e.target.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Kontrol Ediliyor...';

  existingAppointments = await fetchAllAppointments();
  if(isAppointmentAlreadyBooked(dateStr, startTime)){
    updateTimeSlots();
    msgBox.innerHTML = '<div class="msg err">Bu tarih ve saat az önce başkası tarafından alındı. Lütfen başka bir saat seçin.</div>';
    submitBtn.disabled = false;
    submitBtn.textContent = 'Randevuyu Onayla';
    return;
  }

  const appointment = {
    id: 'appt_' + Date.now() + '_' + Math.random().toString(36).slice(2,8),
    name, phone,
    serviceId, serviceName: service ? service.name : serviceId,
    date: dateStr,
    time: startTime,
    createdAt: new Date().toISOString()
  };

  submitBtn.textContent = 'Kaydediliyor...';

  try{
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'add', appointment })
    });
    const result = await response.json();
    if(!result || !result.success) throw new Error('Kayıt başarısız');

    existingAppointments.push(appointment);
    msgBox.innerHTML = `<div class="msg ok">Randevunuz alındı! ${day} ${MONTHS[month-1]} ${year}, saat ${startTime} — sizi bekliyoruz.</div>`;
    e.target.reset();
    populateFormSelects();
    populateDays();
    await fetchAppointmentsForSlots();
  }catch(err){
    console.error('Booking error:', err);
    msgBox.innerHTML = '<div class="msg err">Bir sorun oluştu, lütfen tekrar deneyin.</div>';
  }finally{
    submitBtn.disabled = false;
    submitBtn.textContent = 'Randevuyu Onayla';
  }
}

function setupScrollReveal(){
  const items = document.querySelectorAll('.reveal');
  if(!('IntersectionObserver' in window)){
    items.forEach(el => el.classList.add('in-view'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  items.forEach(el => observer.observe(el));
}
