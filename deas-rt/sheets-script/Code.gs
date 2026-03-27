// ============================================================
// DEAS RT — Google Apps Script Backend v1.1 (CORREGIDO)
// Bugs corregidos:
//   - setHeader() no existe en TextOutput -> eliminado
//   - const SHEET_ID global -> movido a funcion getSS()
//   - spread operator {...r} -> copyObj()
//   - Todos const/let -> var (compatibilidad V8 Apps Script)
// ============================================================

var SHEETS = {
  CLIENTES:    'CLIENTES',
  CONTRATOS:   'CONTRATOS',
  REINVERSION: 'REINVERSION',
  SEGUIMIENTO: 'SEGUIMIENTO',
  BITACORA:    'BITACORA',
  VIGILANTES:  'VIGILANTES'
};

// Respuesta JSON (setHeader no existe en TextOutput de Apps Script)
function makeResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── GET ────────────────────────────────────────────────────
function doGet(e) {
  try {
    var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : '';
    var id     = (e && e.parameter && e.parameter.id)     ? e.parameter.id     : '';
    var result;

    if      (action === 'getClientes')    { result = getClientes(); }
    else if (action === 'getCliente')     { result = getCliente(id); }
    else if (action === 'getContrato')    { result = getContrato(id); }
    else if (action === 'getReinversion') { result = getReinversion(id); }
    else if (action === 'getSeguimiento') { result = getSeguimiento(id); }
    else if (action === 'getBitacora')    { result = getBitacora(id); }
    else if (action === 'getVigilantes')  { result = getVigilantes(id); }
    else                                  { result = { ok: true, msg: 'DEAS RT API v1.1' }; }

    return makeResponse(result);
  } catch(err) {
    return makeResponse({ error: err.message });
  }
}

// ── POST ───────────────────────────────────────────────────
function doPost(e) {
  try {
    var body   = JSON.parse(e.postData.contents);
    var action = body.action || '';
    var result;

    if      (action === 'saveCliente')     { result = saveCliente(body.data); }
    else if (action === 'saveContrato')    { result = saveContrato(body.data); }
    else if (action === 'saveReinversion') { result = saveReinversion(body.data); }
    else if (action === 'addBitacora')     { result = addBitacora(body.data); }
    else if (action === 'addSeguimiento')  { result = addSeguimiento(body.data); }
    else if (action === 'addVigilante')    { result = addVigilante(body.data); }
    else if (action === 'deleteRow')       { result = deleteRow(body.sheet, body.rowId); }
    else                                   { result = { error: 'Accion no reconocida' }; }

    return makeResponse(result);
  } catch(err) {
    return makeResponse({ error: err.message });
  }
}

// ── Spreadsheet activo ─────────────────────────────────────
function getSS() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

// ── Obtener hoja (la crea con cabeceras si no existe) ──────
function getSheet(name) {
  var ss = getSS();
  var sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    initSheet(sh, name);
  }
  return sh;
}

// ── Hoja a array de objetos ────────────────────────────────
function sheetToObjects(sh) {
  var data = sh.getDataRange().getValues();
  if (data.length < 2) return [];
  var headers = [];
  var i, c, r;
  for (i = 0; i < data[0].length; i++) {
    headers.push(String(data[0][i]).trim());
  }
  var result = [];
  for (r = 1; r < data.length; r++) {
    var obj = {};
    for (c = 0; c < headers.length; c++) {
      obj[headers[c]] = data[r][c];
    }
    result.push(obj);
  }
  return result;
}

// ── Inicializar hoja con cabeceras ─────────────────────────
function initSheet(sh, name) {
  var HEADERS = {
    CLIENTES:    ['cliente_id','nit','nombre','direccion','rep_legal','administrador','contacto_tel','contacto_email','no_contrato','fecha_inicio','ultimo_otrosi','fecha_final','tiempo_restante'],
    CONTRATOS:   ['contrato_id','cliente_id','fecha_inicio','fecha_termino','tiempo_pactado_meses','servicio_horas','modalidad','cant_vigilantes','observaciones'],
    REINVERSION: ['reinv_id','cliente_id','valor_reinversion','tiempo_pactado','valor_gastado','fecha_registro','descripcion'],
    SEGUIMIENTO: ['seg_id','cliente_id','tipo','fecha','descripcion','creado_por'],
    BITACORA:    ['bit_id','cliente_id','tipo','monto','fecha','descripcion','creado_por'],
    VIGILANTES:  ['vig_id','cliente_id','nombre','cedula','cargo','telefono','activo']
  };
  var h = HEADERS[name] || ['id','valor'];
  sh.appendRow(h);
  sh.getRange(1, 1, 1, h.length)
    .setFontWeight('bold')
    .setBackground('#1B2F8A')
    .setFontColor('#FFFFFF');
}

// ── CLIENTES ──────────────────────────────────────────────
function getClientes() {
  var rows = sheetToObjects(getSheet(SHEETS.CLIENTES));
  var hoy  = new Date();
  var out  = [];
  for (var i = 0; i < rows.length; i++) {
    var r    = rows[i];
    var fin  = parseDate(r.fecha_final);
    var dias = fin ? Math.round((fin - hoy) / 86400000) : null;
    var obj  = copyObj(r);
    obj.dias_restantes = dias;
    obj.estado = estadoContrato(dias);
    out.push(obj);
  }
  return out;
}

function getCliente(id) {
  var list = getClientes();
  for (var i = 0; i < list.length; i++) {
    if (String(list[i].cliente_id) === String(id)) return list[i];
  }
  return null;
}

function saveCliente(data) {
  var sh      = getSheet(SHEETS.CLIENTES);
  var rows    = sheetToObjects(sh);
  var headers = sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0];
  var row     = buildRow(headers, data);
  var idx     = findIdx(rows, 'cliente_id', data.cliente_id);
  if (idx >= 0) {
    sh.getRange(idx + 2, 1, 1, row.length).setValues([row]);
    return { ok: true, msg: 'Actualizado' };
  } else {
    if (!data.cliente_id) data.cliente_id = 'C-' + Date.now();
    row[0] = data.cliente_id;
    sh.appendRow(row);
    return { ok: true, msg: 'Creado', id: data.cliente_id };
  }
}

// ── CONTRATOS ─────────────────────────────────────────────
function getContrato(clienteId) {
  return filterBy(sheetToObjects(getSheet(SHEETS.CONTRATOS)), 'cliente_id', clienteId);
}

function saveContrato(data) {
  var sh      = getSheet(SHEETS.CONTRATOS);
  var rows    = sheetToObjects(sh);
  var headers = sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0];
  var row     = buildRow(headers, data);
  var idx     = findIdx(rows, 'contrato_id', data.contrato_id);
  if (idx >= 0) {
    sh.getRange(idx + 2, 1, 1, row.length).setValues([row]);
  } else {
    if (!data.contrato_id) data.contrato_id = 'CT-' + Date.now();
    row[0] = data.contrato_id;
    sh.appendRow(row);
  }
  return { ok: true };
}

// ── REINVERSION ───────────────────────────────────────────
function getReinversion(clienteId) {
  return filterBy(sheetToObjects(getSheet(SHEETS.REINVERSION)), 'cliente_id', clienteId);
}

function saveReinversion(data) {
  var sh      = getSheet(SHEETS.REINVERSION);
  var rows    = sheetToObjects(sh);
  var headers = sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0];
  var row     = buildRow(headers, data);
  var idx     = findIdx(rows, 'reinv_id', data.reinv_id);
  if (idx >= 0) {
    sh.getRange(idx + 2, 1, 1, row.length).setValues([row]);
  } else {
    if (!data.reinv_id) data.reinv_id = 'RI-' + Date.now();
    row[0] = data.reinv_id;
    sh.appendRow(row);
  }
  return { ok: true };
}

// ── BITACORA ──────────────────────────────────────────────
function getBitacora(clienteId) {
  return filterBy(sheetToObjects(getSheet(SHEETS.BITACORA)), 'cliente_id', clienteId);
}

function addBitacora(data) {
  var sh      = getSheet(SHEETS.BITACORA);
  var headers = sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0];
  if (!data.bit_id) data.bit_id = 'BIT-' + Date.now();
  sh.appendRow(buildRow(headers, data));
  return { ok: true, id: data.bit_id };
}

// ── SEGUIMIENTO ───────────────────────────────────────────
function getSeguimiento(clienteId) {
  return filterBy(sheetToObjects(getSheet(SHEETS.SEGUIMIENTO)), 'cliente_id', clienteId);
}

function addSeguimiento(data) {
  var sh      = getSheet(SHEETS.SEGUIMIENTO);
  var headers = sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0];
  if (!data.seg_id) data.seg_id = 'SEG-' + Date.now();
  sh.appendRow(buildRow(headers, data));
  return { ok: true, id: data.seg_id };
}

// ── VIGILANTES ────────────────────────────────────────────
function getVigilantes(clienteId) {
  return filterBy(sheetToObjects(getSheet(SHEETS.VIGILANTES)), 'cliente_id', clienteId);
}

function addVigilante(data) {
  var sh      = getSheet(SHEETS.VIGILANTES);
  var headers = sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0];
  if (!data.vig_id) data.vig_id = 'VIG-' + Date.now();
  sh.appendRow(buildRow(headers, data));
  return { ok: true };
}

// ── DELETE generico ────────────────────────────────────────
function deleteRow(sheetName, rowId) {
  var sh   = getSheet(SHEETS[sheetName] || sheetName);
  var rows = sheetToObjects(sh);
  if (!rows.length) return { ok: false };
  var idKey = Object.keys(rows[0])[0];
  var idx   = findIdx(rows, idKey, rowId);
  if (idx >= 0) sh.deleteRow(idx + 2);
  return { ok: true };
}

// ── UTILS ─────────────────────────────────────────────────
function parseDate(str) {
  if (!str) return null;
  var s = String(str).trim();
  var m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) return new Date(parseInt(m[3]), parseInt(m[2]) - 1, parseInt(m[1]));
  var d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

function estadoContrato(dias) {
  if (dias === null) return 'sin_fecha';
  if (dias < 0)     return 'vencido';
  if (dias <= 60)   return 'proximo';
  return 'vigente';
}

function filterBy(arr, key, val) {
  var out = [];
  for (var i = 0; i < arr.length; i++) {
    if (String(arr[i][key]) === String(val)) out.push(arr[i]);
  }
  return out;
}

function findIdx(arr, key, val) {
  for (var i = 0; i < arr.length; i++) {
    if (String(arr[i][key]) === String(val)) return i;
  }
  return -1;
}

function buildRow(headers, data) {
  var row = [];
  for (var i = 0; i < headers.length; i++) {
    var h = String(headers[i]).trim();
    row.push((data[h] !== undefined && data[h] !== null) ? data[h] : '');
  }
  return row;
}

function copyObj(obj) {
  var out  = {};
  var keys = Object.keys(obj);
  for (var i = 0; i < keys.length; i++) {
    out[keys[i]] = obj[keys[i]];
  }
  return out;
}

// ── MIGRACION INICIAL (ejecutar UNA sola vez) ──────────────
function migrarDatosIniciales() {
  var clientes = [
    {cliente_id:'1',nit:'800176822',nombre:'CR.CONTRY PLAZA',direccion:'',rep_legal:'',administrador:'MARCELA ALARCON',contacto_tel:'',contacto_email:'',no_contrato:'',fecha_inicio:'31/08/2013',ultimo_otrosi:'31/10/2025',fecha_final:'30/08/2026',tiempo_restante:'157'},
    {cliente_id:'2',nit:'830143270',nombre:'CONJUNTO RESIDENCIAL LA RABIDA',direccion:'',rep_legal:'',administrador:'LILIANA JIMENEZ',contacto_tel:'',contacto_email:'',no_contrato:'',fecha_inicio:'1/03/2012',ultimo_otrosi:'1/03/2024',fecha_final:'28/02/2027',tiempo_restante:'338'},
    {cliente_id:'3',nit:'830071090',nombre:'EDIFICIO PARQUE DE BOLONIA 108',direccion:'',rep_legal:'',administrador:'ADMIPOSADA & CIA',contacto_tel:'',contacto_email:'',no_contrato:'',fecha_inicio:'2/09/2002',ultimo_otrosi:'31/07/2025',fecha_final:'30/07/2026',tiempo_restante:'126'},
    {cliente_id:'4',nit:'830060320',nombre:'CONJUNTO RESIDENCIAL SAN PATRICIO',direccion:'',rep_legal:'',administrador:'FRANCISCO ANGEL',contacto_tel:'',contacto_email:'',no_contrato:'',fecha_inicio:'30/04/2012',ultimo_otrosi:'30/04/2025',fecha_final:'29/04/2026',tiempo_restante:'34'},
    {cliente_id:'5',nit:'800056641',nombre:'EDIFICIO SAN FELIPE DE ALGECIRAS',direccion:'',rep_legal:'',administrador:'EDGAR FACUNDO CHACVARRO',contacto_tel:'',contacto_email:'',no_contrato:'',fecha_inicio:'31/03/2014',ultimo_otrosi:'31/03/2025',fecha_final:'30/03/2026',tiempo_restante:'4'},
    {cliente_id:'6',nit:'830030823',nombre:'EDIFICIO JAGAI',direccion:'',rep_legal:'',administrador:'BIBIANA CASADIEGO',contacto_tel:'',contacto_email:'',no_contrato:'',fecha_inicio:'15/07/2002',ultimo_otrosi:'31/07/2025',fecha_final:'30/07/2026',tiempo_restante:'126'},
    {cliente_id:'7',nit:'800199655',nombre:'EDIFICIO CENTRAL PARK 43 P.H.',direccion:'',rep_legal:'',administrador:'DESIREE MUNOZ',contacto_tel:'',contacto_email:'',no_contrato:'',fecha_inicio:'1/04/2000',ultimo_otrosi:'30/09/2022',fecha_final:'29/09/2025',tiempo_restante:'-178'},
    {cliente_id:'8',nit:'800214001',nombre:'EDIFICIO FITCH RATINGS',direccion:'',rep_legal:'',administrador:'Sandra Liliana Canon Gonzalez',contacto_tel:'',contacto_email:'',no_contrato:'',fecha_inicio:'31/10/2012',ultimo_otrosi:'1/11/2005',fecha_final:'30/10/2026',tiempo_restante:'218'},
    {cliente_id:'9',nit:'830059659',nombre:'EDIFICIO TENERIFE P.H.',direccion:'',rep_legal:'',administrador:'FRANCISCO ANGEL',contacto_tel:'',contacto_email:'',no_contrato:'',fecha_inicio:'31/03/2012',ultimo_otrosi:'31/03/2023',fecha_final:'29/03/2028',tiempo_restante:'734'},
    {cliente_id:'10',nit:'900747744',nombre:'EDIFICIO PARKWAY 92',direccion:'',rep_legal:'',administrador:'IWANA - DEISY BOHORQUEZ',contacto_tel:'',contacto_email:'',no_contrato:'',fecha_inicio:'30/04/2014',ultimo_otrosi:'30/04/2022',fecha_final:'29/04/2025',tiempo_restante:'-331'},
    {cliente_id:'11',nit:'830005360',nombre:'EDIFICIO CARRERA PRIMERA ESTE',direccion:'',rep_legal:'',administrador:'MARIA ELENA VILLOTA',contacto_tel:'',contacto_email:'',no_contrato:'',fecha_inicio:'31/08/2007',ultimo_otrosi:'31/08/2024',fecha_final:'30/08/2027',tiempo_restante:'522'},
    {cliente_id:'12',nit:'830054293',nombre:'EDIFICIO LOS ALGARROBOS P.H.',direccion:'',rep_legal:'',administrador:'FRANCISCO ANGEL',contacto_tel:'',contacto_email:'',no_contrato:'',fecha_inicio:'2/10/2023',ultimo_otrosi:'2/10/2025',fecha_final:'1/10/2026',tiempo_restante:'189'},
    {cliente_id:'13',nit:'800197278',nombre:'EDIFICIO QUINTA CAMACHO',direccion:'',rep_legal:'',administrador:'RAFAEL ZAMORA',contacto_tel:'',contacto_email:'',no_contrato:'',fecha_inicio:'30/09/2008',ultimo_otrosi:'30/09/2024',fecha_final:'29/09/2026',tiempo_restante:'187'},
    {cliente_id:'14',nit:'900235609',nombre:'EDIFICIO SANTA PAULA 105',direccion:'',rep_legal:'',administrador:'MARITZA CASTRO',contacto_tel:'',contacto_email:'',no_contrato:'',fecha_inicio:'15/11/2008',ultimo_otrosi:'1/02/2024',fecha_final:'31/01/2025',tiempo_restante:'-420'},
    {cliente_id:'15',nit:'900556139',nombre:'EDIFICIO GEO TRES',direccion:'',rep_legal:'',administrador:'MARTHA MARQUEZ',contacto_tel:'',contacto_email:'',no_contrato:'',fecha_inicio:'12/07/2012',ultimo_otrosi:'29/06/2022',fecha_final:'28/06/2025',tiempo_restante:'-271'},
    {cliente_id:'16',nit:'900230364',nombre:'EDIFICIO CANELO',direccion:'',rep_legal:'',administrador:'ESPERANZA LOZANO',contacto_tel:'',contacto_email:'',no_contrato:'',fecha_inicio:'5/11/2008',ultimo_otrosi:'',fecha_final:'',tiempo_restante:''},
    {cliente_id:'17',nit:'830038981',nombre:'EDIFICIO MENDEBAL P.H.',direccion:'',rep_legal:'',administrador:'FRANCISCO ANGEL',contacto_tel:'',contacto_email:'',no_contrato:'',fecha_inicio:'30/04/2016',ultimo_otrosi:'30/04/2025',fecha_final:'29/04/2026',tiempo_restante:'34'},
    {cliente_id:'18',nit:'900031181',nombre:'EDIFICIO PARQUE DE LA 90 P.H. T.R. B',direccion:'',rep_legal:'',administrador:'FRANCISCO ANGEL',contacto_tel:'',contacto_email:'',no_contrato:'',fecha_inicio:'1/03/2010',ultimo_otrosi:'1/03/2025',fecha_final:'20/06/2026',tiempo_restante:'86'},
    {cliente_id:'19',nit:'900747774',nombre:'EDIFICIO HANCOCK',direccion:'',rep_legal:'',administrador:'ANDREA SABALETA',contacto_tel:'',contacto_email:'',no_contrato:'',fecha_inicio:'1/03/2014',ultimo_otrosi:'1/03/2023',fecha_final:'28/02/2026',tiempo_restante:'-27'},
    {cliente_id:'20',nit:'900192493',nombre:'EDIFICIO RESERVA DEL PARQUE',direccion:'',rep_legal:'',administrador:'DAYANA PEREZ',contacto_tel:'',contacto_email:'',no_contrato:'',fecha_inicio:'31/07/2009',ultimo_otrosi:'',fecha_final:'',tiempo_restante:''},
    {cliente_id:'21',nit:'830063214',nombre:'EDIFICIO RODAMONTE DEL CHICO',direccion:'',rep_legal:'',administrador:'NELSY PENA',contacto_tel:'',contacto_email:'',no_contrato:'',fecha_inicio:'31/03/2014',ultimo_otrosi:'31/03/2025',fecha_final:'30/03/2026',tiempo_restante:'4'},
    {cliente_id:'22',nit:'900352987',nombre:'EDIFICIO TERRAZAS DE EMAUS P.H.',direccion:'',rep_legal:'',administrador:'CLAUDIA MARCELA ORTIZ',contacto_tel:'',contacto_email:'',no_contrato:'',fecha_inicio:'8/04/2012',ultimo_otrosi:'1/01/2022',fecha_final:'26/08/2026',tiempo_restante:'153'},
    {cliente_id:'23',nit:'900599648',nombre:'EDIFICIO ALTANA',direccion:'',rep_legal:'',administrador:'MARIA ELENA VILLOTA',contacto_tel:'',contacto_email:'',no_contrato:'',fecha_inicio:'1/09/2007',ultimo_otrosi:'19/06/2024',fecha_final:'18/06/2026',tiempo_restante:'84'},
    {cliente_id:'24',nit:'830006417',nombre:'EDIFICIO PARQUE DE CORCEGA',direccion:'',rep_legal:'',administrador:'GLORIA MATILDE GOMEZ',contacto_tel:'',contacto_email:'',no_contrato:'',fecha_inicio:'1/02/2005',ultimo_otrosi:'',fecha_final:'',tiempo_restante:''},
    {cliente_id:'25',nit:'860014047',nombre:'O.F. A.C.A.C.C.',direccion:'',rep_legal:'',administrador:'GLORIA AREVALO',contacto_tel:'',contacto_email:'',no_contrato:'',fecha_inicio:'1/04/2003',ultimo_otrosi:'1/04/2025',fecha_final:'29/03/2026',tiempo_restante:'84'},
    {cliente_id:'26',nit:'900012420',nombre:'EDIFICIO CAMINO DE INDIGENAS P.H.',direccion:'',rep_legal:'',administrador:'ANGELA CONCHA',contacto_tel:'',contacto_email:'',no_contrato:'',fecha_inicio:'25/11/2005',ultimo_otrosi:'1/12/2025',fecha_final:'30/11/2027',tiempo_restante:'613'},
    {cliente_id:'27',nit:'830132477',nombre:'EDIFICIO LA PRADERA',direccion:'',rep_legal:'',administrador:'NANCY MARTINEZ',contacto_tel:'',contacto_email:'',no_contrato:'',fecha_inicio:'30/06/2016',ultimo_otrosi:'22/07/2024',fecha_final:'28/02/2027',tiempo_restante:'338'},
    {cliente_id:'28',nit:'900118546',nombre:'EDIFICIO ALTOS DEL CASTILLO P.H.',direccion:'',rep_legal:'',administrador:'IWANA (ADRIANA CORTES)',contacto_tel:'',contacto_email:'',no_contrato:'',fecha_inicio:'31/08/2015',ultimo_otrosi:'1/01/2023',fecha_final:'31/12/2026',tiempo_restante:'279'},
    {cliente_id:'29',nit:'830038935',nombre:'EDIFICIO QUEBRADAHONDA P.H.',direccion:'',rep_legal:'',administrador:'MARIA OVALLE DE CALERO',contacto_tel:'',contacto_email:'',no_contrato:'',fecha_inicio:'1/02/2013',ultimo_otrosi:'',fecha_final:'',tiempo_restante:''},
    {cliente_id:'30',nit:'800242890',nombre:'EDIFICIO ALAMEDA P.H.',direccion:'',rep_legal:'',administrador:'MARIA INES ROJAS',contacto_tel:'',contacto_email:'',no_contrato:'',fecha_inicio:'30/09/2011',ultimo_otrosi:'1/10/2021',fecha_final:'29/09/2024',tiempo_restante:'-543'},
    {cliente_id:'31',nit:'830069284',nombre:'EDIFICIO DELUCA',direccion:'',rep_legal:'',administrador:'CARLOS BERNAL',contacto_tel:'',contacto_email:'',no_contrato:'',fecha_inicio:'1/02/2009',ultimo_otrosi:'1/02/2023',fecha_final:'31/01/2026',tiempo_restante:'-55'},
    {cliente_id:'32',nit:'900438538',nombre:'EDIFICIO 1087',direccion:'',rep_legal:'',administrador:'EMMA JOHANA LOZANO INCOLPRO',contacto_tel:'',contacto_email:'',no_contrato:'',fecha_inicio:'24/01/2009',ultimo_otrosi:'24/01/2023',fecha_final:'23/01/2025',tiempo_restante:'-428'},
    {cliente_id:'33',nit:'900303451',nombre:'EDIFICIO CASA DEL ARBOL P.H.',direccion:'',rep_legal:'',administrador:'ONE SERVICE',contacto_tel:'',contacto_email:'',no_contrato:'',fecha_inicio:'14/05/2015',ultimo_otrosi:'30/04/2025',fecha_final:'29/04/2026',tiempo_restante:'34'},
    {cliente_id:'34',nit:'830000319',nombre:'EDIFICIO NIPON CENTER II P.H.',direccion:'',rep_legal:'',administrador:'BLANCA NIEVES MARTINEZ',contacto_tel:'',contacto_email:'',no_contrato:'',fecha_inicio:'30/04/2014',ultimo_otrosi:'31/10/2022',fecha_final:'30/10/2024',tiempo_restante:'-512'},
    {cliente_id:'35',nit:'830045676',nombre:'EDIFICIO ALPADI 4',direccion:'',rep_legal:'',administrador:'AMPARO SEGURA',contacto_tel:'',contacto_email:'',no_contrato:'',fecha_inicio:'30/09/2009',ultimo_otrosi:'',fecha_final:'',tiempo_restante:''},
    {cliente_id:'36',nit:'900776558',nombre:'EDIFICIO COUNTRY PARK CONSULTORIOS P.H.',direccion:'',rep_legal:'',administrador:'IWANA (ADRIANA CORTES)',contacto_tel:'',contacto_email:'',no_contrato:'',fecha_inicio:'30/09/2018',ultimo_otrosi:'1/01/2023',fecha_final:'31/12/2025',tiempo_restante:'-86'},
    {cliente_id:'37',nit:'900725403',nombre:'EDIFICIO ALARKOS P.H.',direccion:'',rep_legal:'',administrador:'DIANA SALAZAR',contacto_tel:'',contacto_email:'',no_contrato:'',fecha_inicio:'14/03/2017',ultimo_otrosi:'',fecha_final:'',tiempo_restante:''},
    {cliente_id:'38',nit:'830027675',nombre:'EDIFICIO MIRADOR DE LA SABANA',direccion:'',rep_legal:'',administrador:'DOUGLAS CASTRO',contacto_tel:'',contacto_email:'',no_contrato:'',fecha_inicio:'30/04/2015',ultimo_otrosi:'1/01/2023',fecha_final:'31/12/2025',tiempo_restante:'-86'},
    {cliente_id:'39',nit:'830044288',nombre:'EDIFICIO MIRADOR DE SANTA ANA',direccion:'',rep_legal:'',administrador:'CESAR GONZALEZ',contacto_tel:'',contacto_email:'',no_contrato:'',fecha_inicio:'1/03/2010',ultimo_otrosi:'30/06/2023',fecha_final:'30/05/2026',tiempo_restante:'65'},
    {cliente_id:'40',nit:'830032214',nombre:'EDIFICIO PLAZUELA DE ROSALES',direccion:'',rep_legal:'',administrador:'NICOLUZ LTDA - MARIA CLARA SANDOVAL',contacto_tel:'',contacto_email:'',no_contrato:'',fecha_inicio:'1/02/2009',ultimo_otrosi:'31/08/2024',fecha_final:'29/08/2026',tiempo_restante:'156'},
    {cliente_id:'41',nit:'800069007',nombre:'P.H. PASADENA PLAZA',direccion:'',rep_legal:'',administrador:'JOSE ORLANDO OSSA',contacto_tel:'',contacto_email:'',no_contrato:'',fecha_inicio:'31/08/2019',ultimo_otrosi:'31/08/2024',fecha_final:'27/04/2026',tiempo_restante:'32'},
    {cliente_id:'42',nit:'830010844',nombre:'C.D. ALDEA DEL BOSQUE',direccion:'',rep_legal:'',administrador:'FRANCISCO ANGEL',contacto_tel:'',contacto_email:'',no_contrato:'',fecha_inicio:'30/04/2012',ultimo_otrosi:'1/05/2025',fecha_final:'29/04/2026',tiempo_restante:'34'},
    {cliente_id:'43',nit:'830072044',nombre:'EDIFICIO APARTAMENTOS EL RETIRO',direccion:'',rep_legal:'',administrador:'MARIA ELENA RODRIGUEZ',contacto_tel:'',contacto_email:'',no_contrato:'',fecha_inicio:'30/06/2013',ultimo_otrosi:'31/07/2024',fecha_final:'30/07/2027',tiempo_restante:'491'},
    {cliente_id:'44',nit:'900624128',nombre:'EDIFICIO TERRA',direccion:'',rep_legal:'',administrador:'ANA HERMOSO - CINDY RODRIGUEZ',contacto_tel:'',contacto_email:'',no_contrato:'',fecha_inicio:'15/03/2013',ultimo_otrosi:'26/08/2024',fecha_final:'25/08/2026',tiempo_restante:'152'},
    {cliente_id:'45',nit:'901551362',nombre:'EDIFICIO HIGH PARK',direccion:'',rep_legal:'',administrador:'ANDREA AMEZQUITA',contacto_tel:'',contacto_email:'',no_contrato:'',fecha_inicio:'26/06/2022',ultimo_otrosi:'26/06/2024',fecha_final:'26/10/2027',tiempo_restante:'579'},
    {cliente_id:'46',nit:'830037048',nombre:'EDIFICIO ALTOS DEL BOSQUE',direccion:'',rep_legal:'',administrador:'MARCELA ALARCON',contacto_tel:'',contacto_email:'',no_contrato:'',fecha_inicio:'31/08/2022',ultimo_otrosi:'31/08/2023',fecha_final:'30/08/2026',tiempo_restante:'157'},
    {cliente_id:'47',nit:'901214863',nombre:'EDIFICIO ZAPPAN 127',direccion:'',rep_legal:'',administrador:'ALFONSO LEON JIMENEZ',contacto_tel:'',contacto_email:'',no_contrato:'',fecha_inicio:'30/08/2018',ultimo_otrosi:'31/08/2025',fecha_final:'30/08/2026',tiempo_restante:'157'},
    {cliente_id:'48',nit:'830017854',nombre:'EDIFICIO CRISTAL P.H.',direccion:'',rep_legal:'',administrador:'CINDY LOPEZ',contacto_tel:'',contacto_email:'',no_contrato:'',fecha_inicio:'1/02/2023',ultimo_otrosi:'1/02/2023',fecha_final:'31/01/2026',tiempo_restante:'-55'},
    {cliente_id:'49',nit:'900769934',nombre:'EDIFICIO PARQUE MOLINOS',direccion:'',rep_legal:'',administrador:'PAOLA ANDREA',contacto_tel:'',contacto_email:'',no_contrato:'',fecha_inicio:'31/08/2022',ultimo_otrosi:'31/08/2024',fecha_final:'30/08/2025',tiempo_restante:'-208'},
    {cliente_id:'50',nit:'830142114',nombre:'EDIFICIO CHICO ROYAL P.H.',direccion:'',rep_legal:'',administrador:'JULIETH CORZO',contacto_tel:'',contacto_email:'',no_contrato:'',fecha_inicio:'1/03/1999',ultimo_otrosi:'1/03/2025',fecha_final:'29/03/2026',tiempo_restante:'3'},
    {cliente_id:'51',nit:'900104697',nombre:'EDIFICIO BELAIR PLAZA P.H',direccion:'',rep_legal:'',administrador:'DUVAN LENIS',contacto_tel:'',contacto_email:'',no_contrato:'',fecha_inicio:'30/04/2023',ultimo_otrosi:'30/04/2023',fecha_final:'29/04/2026',tiempo_restante:'34'},
    {cliente_id:'52',nit:'8300583851',nombre:'EDIFICIO MANHATAN CENTER',direccion:'',rep_legal:'',administrador:'ADMINISTRACION JOCLA SAS JORGE MENDEZ',contacto_tel:'',contacto_email:'',no_contrato:'',fecha_inicio:'31/10/2023',ultimo_otrosi:'31/10/2023',fecha_final:'29/10/2024',tiempo_restante:'-513'},
    {cliente_id:'53',nit:'830044632',nombre:'EDIFICIO MIRADOR DE LA CANADA',direccion:'',rep_legal:'',administrador:'CARLOS BERNAL',contacto_tel:'',contacto_email:'',no_contrato:'',fecha_inicio:'11/12/2010',ultimo_otrosi:'10/12/2023',fecha_final:'10/12/2026',tiempo_restante:'258'},
    {cliente_id:'54',nit:'901483953',nombre:'O.F. TURKISH MAARIF FOUNDATION',direccion:'',rep_legal:'',administrador:'JESSICA CALDERON',contacto_tel:'',contacto_email:'',no_contrato:'',fecha_inicio:'7/08/2023',ultimo_otrosi:'8/08/2025',fecha_final:'7/08/2026',tiempo_restante:'134'},
    {cliente_id:'55',nit:'800177432',nombre:'EDIFICIO M.F. CAROLINA COUNTRY P.H.',direccion:'',rep_legal:'',administrador:'BLANCA NIEVES MARTINEZ',contacto_tel:'',contacto_email:'',no_contrato:'',fecha_inicio:'31/07/2015',ultimo_otrosi:'31/07/2022',fecha_final:'30/07/2024',tiempo_restante:''},
    {cliente_id:'56',nit:'900034143',nombre:'EDIFICIO EL PARQUE',direccion:'',rep_legal:'',administrador:'PATRICIA NINO',contacto_tel:'',contacto_email:'',no_contrato:'',fecha_inicio:'30/04/2011',ultimo_otrosi:'',fecha_final:'',tiempo_restante:''},
    {cliente_id:'57',nit:'800071276',nombre:'EDIFICIO UCE',direccion:'',rep_legal:'',administrador:'PATRICIA NINO',contacto_tel:'',contacto_email:'',no_contrato:'',fecha_inicio:'31/03/2008',ultimo_otrosi:'30/09/2023',fecha_final:'29/09/2025',tiempo_restante:'-178'},
    {cliente_id:'58',nit:'900032117',nombre:'CONJUNTO RESIDENCIAL CASAS PARQUE 95 P.H.',direccion:'',rep_legal:'',administrador:'IWANA - DEYSI BOHOQUEZ',contacto_tel:'',contacto_email:'',no_contrato:'',fecha_inicio:'2/06/2009',ultimo_otrosi:'14/04/2024',fecha_final:'13/04/2026',tiempo_restante:'18'},
    {cliente_id:'59',nit:'830092018',nombre:'EDIFICIO NOGAL 77',direccion:'',rep_legal:'',administrador:'',contacto_tel:'',contacto_email:'',no_contrato:'',fecha_inicio:'31/08/2009',ultimo_otrosi:'31/08/2024',fecha_final:'30/08/2027',tiempo_restante:'522'},
    {cliente_id:'60',nit:'9017156845',nombre:'CONJUNTO RESIDENCIAL PARQUE CENTRAL FONTIBON 2',direccion:'',rep_legal:'',administrador:'MEC SAS',contacto_tel:'',contacto_email:'',no_contrato:'',fecha_inicio:'29/06/2024',ultimo_otrosi:'30/06/2024',fecha_final:'29/06/2025',tiempo_restante:'-270'},
    {cliente_id:'61',nit:'830085411',nombre:'ED. IMOVAL IV',direccion:'',rep_legal:'',administrador:'MARIA CLARA SANDOVAL',contacto_tel:'',contacto_email:'',no_contrato:'',fecha_inicio:'30/04/2025',ultimo_otrosi:'30/04/2025',fecha_final:'29/04/2026',tiempo_restante:'34'},
    {cliente_id:'62',nit:'8300163615',nombre:'EDIFICIO MIRADOR ANDINO',direccion:'',rep_legal:'',administrador:'NATALIA PINILLA',contacto_tel:'',contacto_email:'',no_contrato:'',fecha_inicio:'6/09/2018',ultimo_otrosi:'30/04/2025',fecha_final:'29/04/2026',tiempo_restante:'34'},
    {cliente_id:'63',nit:'900896001',nombre:'E.D ALTAVISTA RESERVADO DEL COUNTRY',direccion:'',rep_legal:'',administrador:'JOSE MARIA REMOLINA',contacto_tel:'',contacto_email:'',no_contrato:'',fecha_inicio:'1/12/2019',ultimo_otrosi:'1/12/2022',fecha_final:'31/08/2026',tiempo_restante:'158'},
    {cliente_id:'64',nit:'900410127',nombre:'CONJUNTO RESIDENCIAL KANDINSKY',direccion:'',rep_legal:'',administrador:'ANGELICA',contacto_tel:'',contacto_email:'',no_contrato:'',fecha_inicio:'31/05/2025',ultimo_otrosi:'31/05/2025',fecha_final:'29/05/2026',tiempo_restante:'64'}
  ];

  var sh = getSheet(SHEETS.CLIENTES);
  if (sh.getLastRow() > 1) {
    sh.deleteRows(2, sh.getLastRow() - 1);
  }
  var headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  for (var i = 0; i < clientes.length; i++) {
    sh.appendRow(buildRow(headers, clientes[i]));
  }
  return { ok: true, migrados: clientes.length };
}
