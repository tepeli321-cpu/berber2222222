const APP_PASSWORD = '175886963';
const SHEET_NAME = 'Appointments';
const APP_TOKEN_PREFIX = 'admin-token-';
const TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

function ensureSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }

  const headers = [
    'id',
    'name',
    'phone',
    'serviceId',
    'serviceName',
    'barberId',
    'barberName',
    'date',
    'time',
    'createdAt'
  ];

  const existing = sheet.getDataRange().getValues();
  if (!existing.length) {
    sheet.appendRow(headers);
  } else {
    const firstRow = existing[0];
    let needsUpdate = false;
    headers.forEach((header, index) => {
      if ((firstRow[index] || '').toString().trim() !== header) {
        needsUpdate = true;
      }
    });

    if (needsUpdate) {
      sheet.insertRowBefore(1);
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
  }

  return sheet;
}

function normalizeAppointment(row) {
  if (!row || !row.length) return null;
  const [id, name, phone, serviceId, serviceName, barberId, barberName, date, time, createdAt] = row;
  return {
    id: id || '',
    name: name || '',
    phone: phone || '',
    serviceId: serviceId || '',
    serviceName: serviceName || '',
    barberId: barberId || '',
    barberName: barberName || '',
    date: date || '',
    time: time || '',
    createdAt: createdAt || new Date().toISOString()
  };
}

function readAppointments() {
  const sheet = ensureSheet();
  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return [];

  return rows.slice(1)
    .map(normalizeAppointment)
    .filter(Boolean)
    .filter(item => item.id && item.name && item.phone);
}

function writeAppointments(list) {
  const sheet = ensureSheet();
  const values = [
    ['id', 'name', 'phone', 'serviceId', 'serviceName', 'barberId', 'barberName', 'date', 'time', 'createdAt']
  ];

  list.forEach(item => {
    values.push([
      item.id || '',
      item.name || '',
      item.phone || '',
      item.serviceId || '',
      item.serviceName || '',
      item.barberId || '',
      item.barberName || '',
      item.date || '',
      item.time || '',
      item.createdAt || new Date().toISOString()
    ]);
  });

  const lastRow = sheet.getLastRow();
  if (lastRow > 0) {
    sheet.getRange(1, 1, lastRow, 10).clearContent();
  }
  sheet.getRange(1, 1, values.length, values[0].length).setValues(values);
}

function createToken() {
  const token = Utilities.getUuid();
  PropertiesService.getScriptProperties().setProperty(APP_TOKEN_PREFIX + token, String(Date.now()));
  return token;
}

function isValidToken(token) {
  if (!token) return false;
  const value = PropertiesService.getScriptProperties().getProperty(APP_TOKEN_PREFIX + token);
  if (!value) return false;

  const createdAt = Number(value);
  if (!createdAt || Number.isNaN(createdAt)) return false;

  const ttl = Date.now() - createdAt;
  if (ttl > TOKEN_TTL_MS) {
    PropertiesService.getScriptProperties().deleteProperty(APP_TOKEN_PREFIX + token);
    return false;
  }

  return true;
}

function deleteToken(token) {
  if (token) {
    PropertiesService.getScriptProperties().deleteProperty(APP_TOKEN_PREFIX + token);
  }
}

function jsonResponse(obj, statusCode = 200) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function doGet(e) {
  try {
    const token = e && e.parameter ? e.parameter.token : '';
    if (token && !isValidToken(token)) {
      return jsonResponse({ success: false, error: 'unauthorized' }, 401);
    }

    return jsonResponse({
      success: true,
      appointments: readAppointments()
    });
  } catch (err) {
    return jsonResponse({ success: false, error: err && err.message ? err.message : 'Unknown error' }, 500);
  }
}

function doPost(e) {
  try {
    const payload = e && e.postData && e.postData.contents ? JSON.parse(e.postData.contents) : {};
    const action = payload.action || 'list';

    if (action === 'login') {
      const password = String(payload.password || '');
      if (password !== APP_PASSWORD) {
        return jsonResponse({ success: false, error: 'invalid password' }, 401);
      }

      const token = createToken();
      return jsonResponse({ success: true, token });
    }

    if (action === 'add') {
      const appointment = payload.appointment || {};
      const required = ['id', 'name', 'phone', 'date', 'time'];
      const missing = required.filter(field => !appointment[field]);

      if (missing.length) {
        return jsonResponse({ success: false, error: 'missing required fields: ' + missing.join(', ') }, 400);
      }

      const current = readAppointments();
      const exists = current.some(item =>
        item.date === appointment.date &&
        item.time === appointment.time &&
        item.barberId === appointment.barberId
      );

      if (exists) {
        return jsonResponse({ success: false, error: 'already booked' }, 409);
      }

      const next = [...current, {
        id: appointment.id,
        name: appointment.name,
        phone: appointment.phone,
        serviceId: appointment.serviceId || '',
        serviceName: appointment.serviceName || '',
        barberId: appointment.barberId || '',
        barberName: appointment.barberName || '',
        date: appointment.date,
        time: appointment.time,
        createdAt: appointment.createdAt || new Date().toISOString()
      }];

      writeAppointments(next);
      return jsonResponse({ success: true, appointment: next[next.length - 1] });
    }

    if (action === 'delete') {
      const id = payload.id || '';
      const token = payload.token || '';

      if (!isValidToken(token)) {
        return jsonResponse({ success: false, error: 'unauthorized' }, 401);
      }

      const next = readAppointments().filter(item => item.id !== id);
      writeAppointments(next);
      return jsonResponse({ success: true, deleted: id });
    }

    if (action === 'list') {
      return jsonResponse({ success: true, appointments: readAppointments() });
    }

    return jsonResponse({ success: false, error: 'unknown action' }, 400);
  } catch (err) {
    return jsonResponse({ success: false, error: err && err.message ? err.message : 'Unknown error' }, 500);
  }
}

function setupScript() {
  ensureSheet();
  return 'ok';
}
