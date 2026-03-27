// ============================================================
// DEAS RT — api.js
// ============================================================

const API_URL = 'https://script.google.com/macros/s/AKfycbwB3x0ZWMQoq0aDpzs4yM9wg0ZRHQ2S5_9A6gj7U53dzE5wb0FRsUk1OWlWmX03sMvL/exec';

// ── Helpers HTTP ──────────────────────────────────────────
async function apiGet(action, nit = '') {
  const url = `${API_URL}?action=${action}${nit ? '&nit=' + encodeURIComponent(nit) : ''}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error('Error de red: ' + r.status);
  return r.json();
}

async function apiPost(action, data) {
  const r = await fetch(API_URL, {
    method: 'POST',
    body: JSON.stringify({ action, data }),
  });
  if (!r.ok) throw new Error('Error de red: ' + r.status);
  return r.json();
}

// ── Clientes ──────────────────────────────────────────────
async function fetchClientes()      { return apiGet('getClientes'); }
async function fetchCliente(nit)    { return apiGet('getCliente', nit); }
async function saveCliente(data)    { return apiPost('saveCliente', data); }

// ── Contratos ─────────────────────────────────────────────
async function fetchContrato(nit)   { return apiGet('getContrato', nit); }
async function saveContrato(data)   { return apiPost('saveContrato', data); }

// ── Reinversión ───────────────────────────────────────────
async function fetchReinversion(nit){ return apiGet('getReinversion', nit); }
async function saveReinversion(data){ return apiPost('saveReinversion', data); }

// ── Bitácora ──────────────────────────────────────────────
async function fetchBitacora(nit)   { return apiGet('getBitacora', nit); }
async function addBitacora(data)    { return apiPost('addBitacora', data); }

// ── Seguimiento ───────────────────────────────────────────
async function fetchSeguimiento(nit){ return apiGet('getSeguimiento', nit); }
async function addSeguimiento(data) { return apiPost('addSeguimiento', data); }

// ── Vigilantes ────────────────────────────────────────────
async function fetchVigilantes(nit) { return apiGet('getVigilantes', nit); }
async function addVigilante(data)   { return apiPost('addVigilante', data); }

// ── Utilidades ────────────────────────────────────────────
function formatCOP(val) {
  const n = parseFloat(String(val).replace(/[^0-9.-]/g, '')) || 0;
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n);
}

function formatDate(str) {
  if (!str) return '—';
  const s = String(str).trim();
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) return `${m[1].padStart(2,'0')}/${m[2].padStart(2,'0')}/${m[3]}`;
  try { const d = new Date(s); if (!isNaN(d)) return d.toLocaleDateString('es-CO'); } catch(e) {}
  return s;
}

function diasRestantes(fechaFinal) {
  if (!fechaFinal) return null;
  const s = String(fechaFinal).trim();
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  let d;
  if (m) d = new Date(+m[3], +m[2]-1, +m[1]);
  else d = new Date(s);
  if (isNaN(d)) return null;
  return Math.round((d - new Date()) / 86400000);
}

function estadoBadge(dias) {
  if (dias === null) return { label: 'Sin fecha',              cls: 'badge-gray'  };
  if (dias < 0)      return { label: 'Vencido',               cls: 'badge-red'   };
  if (dias <= 30)    return { label: `${dias}d — Urgente`,    cls: 'badge-red'   };
  if (dias <= 60)    return { label: `${dias}d — Próximo`,    cls: 'badge-amber' };
  return               { label: 'Vigente',                    cls: 'badge-green' };
}

function calcAntiguedad(fechaInicio) {
  if (!fechaInicio) return '—';
  const s = String(fechaInicio).trim();
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  let d;
  if (m) d = new Date(+m[3], +m[2]-1, +m[1]);
  else d = new Date(s);
  if (isNaN(d)) return '—';
  return ((new Date() - d) / (365.25 * 86400000)).toFixed(1) + ' años';
}

function initials(name) {
  return (name || '?').split(' ').slice(0,2).map(w => w[0]).join('').toUpperCase();
}

function cacheSet(key, data) {
  try { localStorage.setItem('deas_' + key, JSON.stringify({ ts: Date.now(), data })); } catch(e) {}
}
function cacheGet(key, maxAgeMs = 120000) {
  try {
    const item = JSON.parse(localStorage.getItem('deas_' + key));
    if (item && (Date.now() - item.ts) < maxAgeMs) return item.data;
  } catch(e) {}
  return null;
}

function toast(msg, type = '') {
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `${type==='success'?'✅':type==='error'?'❌':'⚠️'} ${msg}`;
  const container = document.getElementById('toastContainer');
  if (container) container.appendChild(el);
  setTimeout(() => el.remove(), 3200);
}
