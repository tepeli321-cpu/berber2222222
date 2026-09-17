// ============================================================
// admin.js
// admin.html için giriş kontrolü ve randevu listesi mantığı.
// config.js ve utils.js bu dosyadan ÖNCE yüklenmiş olmalı.
// ============================================================

document.addEventListener('DOMContentLoaded', function(){
  document.getElementById('admin-login-form').addEventListener('submit', handleLogin);
  document.getElementById('logout-btn').addEventListener('click', handleLogout);
  document.getElementById('refresh-btn').addEventListener('click', loadAppointments);

  // Sayfa yenilendiğinde oturumu hatırla (sadece bu tarayıcı sekmesi için).
  if(sessionStorage.getItem('adminAuthed') === 'yes'){
    showPanel();
  }
});

function handleLogin(e){
  e.preventDefault();
  const val = document.getElementById('admin-pass').value;
  const msgBox = document.getElementById('admin-login-msg');

  if(val === ADMIN_PASSWORD){
    sessionStorage.setItem('adminAuthed', 'yes');
    showPanel();
  }else{
    msgBox.innerHTML = '<div class="msg err">Şifre hatalı.</div>';
  }
}

function handleLogout(){
  sessionStorage.removeItem('adminAuthed');
  document.getElementById('login-view').style.display = '';
  document.getElementById('panel-view').style.display = 'none';
  document.getElementById('admin-pass').value = '';
}

function showPanel(){
  document.getElementById('login-view').style.display = 'none';
  document.getElementById('panel-view').style.display = '';
  loadAppointments();
}

async function loadAppointments(){
  const listBox = document.getElementById('admin-list');
  listBox.innerHTML = '<div class="loading">Randevular yükleniyor...</div>';

  const list = await fetchAllAppointments();
  list.sort((a,b) => (a.date + normalizeTime(a.time)).localeCompare(b.date + normalizeTime(b.time)));

  if(list.length === 0){
    listBox.innerHTML = '<div class="empty-state">Henüz randevu yok.</div>';
    return;
  }

  let html = '';
  let lastDate = null;
  for(const appt of list){
    if(appt.date !== lastDate){
      const d = new Date(appt.date + 'T00:00:00');
      const label = `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
      html += `<div class="day-divider">${label.toUpperCase()}</div>`;
      lastDate = appt.date;
    }
    html += `
      <div class="appt-item">
        <div class="appt-date">${normalizeTime(appt.time)}</div>
        <div class="appt-details">
          <div class="name">${escapeHtml(appt.name)}</div>
          <div class="meta">${escapeHtml(appt.serviceName)} · ${escapeHtml(appt.phone)}</div>
        </div>
        <button class="del-btn" data-id="${escapeHtml(appt.id)}">Sil</button>
      </div>
    `;
  }
  listBox.innerHTML = html;

  listBox.querySelectorAll('.del-btn').forEach(btn => {
    btn.addEventListener('click', () => deleteAppointment(btn.dataset.id));
  });
}

async function deleteAppointment(id){
  try{
    await fetch(SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'delete', id })
    });
    await loadAppointments();
  }catch(err){
    console.error('Delete error:', err);
  }
}
