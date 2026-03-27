// ============================================================
// DEAS RT — api.js  (configuración central)
// ============================================================

// ⚠️ REEMPLAZA esta URL con la de tu Web App deployada en Apps Script
const API_URL = 'https://script.google.com/macros/s/AKfycbwB3x0ZWMQoq0aDpzs4yM9wg0ZRHQ2S5_9A6gj7U53dzE5wb0FRsUk1OWlWmX03sMvL/exec';

// ── Helpers HTTP ──────────────────────────────────────────
async function apiGet(action, id = '') {
  const url = `${API_URL}?action=${action}${id ? '&id=' + id : ''}`;
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
async function fetchClientes() {
  return apiGet('getClientes');
}

async function fetchCliente(id) {
  return apiGet('getCliente', id);
}

async function saveCliente(data) {
  return apiPost('saveCliente', data);
}

// ── Contratos ─────────────────────────────────────────────
async function fetchContrato(clienteId) {
  return apiGet('getContrato', clienteId);
}

async function saveContrato(data) {
  return apiPost('saveContrato', data);
}

// ── Reinversión ───────────────────────────────────────────
async function fetchReinversion(clienteId) {
  return apiGet('getReinversion', clienteId);
}

async function saveReinversion(data) {
  return apiPost('saveReinversion', data);
}

// ── Bitácora (gastos) ──────────────────────────────────────
async function fetchBitacora(clienteId) {
  return apiGet('getBitacora', clienteId);
}

async function addBitacora(data) {
  return apiPost('addBitacora', data);
}

// ── Seguimiento ───────────────────────────────────────────
async function fetchSeguimiento(clienteId) {
  return apiGet('getSeguimiento', clienteId);
}

async function addSeguimiento(data) {
  return apiPost('addSeguimiento', data);
}

// ── Vigilantes ────────────────────────────────────────────
async function fetchVigilantes(clienteId) {
  return apiGet('getVigilantes', clienteId);
}

async function addVigilante(data) {
  return apiPost('addVigilante', data);
}

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
  try {
    const d = new Date(s);
    if (!isNaN(d)) return d.toLocaleDateString('es-CO');
  } catch(e) {}
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
  if (dias === null) return { label: 'Sin fecha', cls: 'badge-gray' };
  if (dias < 0)   return { label: 'Vencido',  cls: 'badge-red'  };
  if (dias <= 30) return { label: `${dias}d — Urgente`, cls: 'badge-red'    };
  if (dias <= 60) return { label: `${dias}d — Próximo`, cls: 'badge-amber'  };
  return { label: 'Vigente', cls: 'badge-green' };
}

function calcAntiguedad(fechaInicio) {
  if (!fechaInicio) return '—';
  const s = String(fechaInicio).trim();
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  let d;
  if (m) d = new Date(+m[3], +m[2]-1, +m[1]);
  else d = new Date(s);
  if (isNaN(d)) return '—';
  const años = ((new Date() - d) / (365.25 * 86400000)).toFixed(1);
  return `${años} años`;
}

// Iniciales avatar
function initials(name) {
  return (name || '?').split(' ').slice(0,2).map(w => w[0]).join('').toUpperCase();
}

// ── Storage local (caché offline) ─────────────────────────
function cacheSet(key, data) {
  try { localStorage.setItem('deas_' + key, JSON.stringify({ ts: Date.now(), data })); } catch(e) {}
}
function cacheGet(key, maxAgeMs = 300000) {
  try {
    const item = JSON.parse(localStorage.getItem('deas_' + key));
    if (item && (Date.now() - item.ts) < maxAgeMs) return item.data;
  } catch(e) {}
  return null;
}
