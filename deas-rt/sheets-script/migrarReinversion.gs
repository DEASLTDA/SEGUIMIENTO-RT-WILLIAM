// ============================================================
// DEAS RT — migrarReinversionYBitacora()
// PEGA ESTA FUNCION al final del Code.gs existente
// Ejecutar UNA sola vez desde el editor de Apps Script
// ============================================================

function migrarReinversionYBitacora() {
  // --- Datos extraidos del CSV original ---
  var REINVERSION = [
    {nit:'800176822',valor:28626048,anio:'2025',meses:'12',alcance:''},
    {nit:'830060320',valor:3200000,anio:'2025',meses:'12',alcance:''},
    {nit:'800056641',valor:9000000,anio:'2025',meses:'12',alcance:''},
    {nit:'830030823',valor:14923706,anio:'2025',meses:'12',alcance:''},
    {nit:'830059659',valor:50000000,anio:'2025',meses:'60',alcance:''},
    {nit:'830005360',valor:15000000,anio:'2025',meses:'36',alcance:''},
    {nit:'800197278',valor:24000000,anio:'2025',meses:'24',alcance:''},
    {nit:'900031181',valor:33000000,anio:'2025',meses:'36',alcance:''},
    {nit:'830063214',valor:4500000,anio:'2025',meses:'',alcance:''},
    {nit:'900599648',valor:18500000,anio:'2025',meses:'24',alcance:''},
    {nit:'900303451',valor:14300000,anio:'2025',meses:'12',alcance:''},
    {nit:'830032214',valor:26000000,anio:'2025',meses:'24',alcance:''},
    {nit:'900624128',valor:14547902,anio:'2025',meses:'12',alcance:''},
    {nit:'901214863',valor:21402618,anio:'2025',meses:'12',alcance:''},
    {nit:'830142114',valor:12000000,anio:'2025',meses:'13',alcance:''},
    {nit:'901483953',valor:14283394,anio:'2025',meses:'12',alcance:''},
    {nit:'830085411',valor:10000000,anio:'2025',meses:'12',alcance:''},
    {nit:'8300163615',valor:14547902,anio:'2026',meses:'12',alcance:''},
    {nit:'900410127-8',valor:99280500,anio:'2025',meses:'12',alcance:''},
  ];

  var BITACORA = [
    {nit:'800176822',monto:14313024,fecha:'01/Nov/2025',desc:'Descuento/Aplicacion Noviembre 2025'},
    {nit:'800176822',monto:14313024,fecha:'01/Dic/2025',desc:'Descuento/Aplicacion Diciembre 2025'},
    {nit:'830143270',monto:70000000,fecha:'01/Ene/2024',desc:'Descuento/Aplicacion RT Pendiente 2024 2024'},
    {nit:'830143270',monto:2380000,fecha:'01/Ene/2025',desc:'Descuento/Aplicacion Enero 2025'},
    {nit:'830143270',monto:8276450,fecha:'01/Feb/2025',desc:'Descuento/Aplicacion Febrero 2025'},
    {nit:'830143270',monto:22354670,fecha:'01/Mar/2025',desc:'Descuento/Aplicacion Marzo 2025'},
    {nit:'830143270',monto:2850000,fecha:'01/Abr/2025',desc:'Descuento/Aplicacion Abril 2025'},
    {nit:'830143270',monto:22354670,fecha:'01/May/2025',desc:'Descuento/Aplicacion Mayo 2025'},
    {nit:'830143270',monto:1190000,fecha:'01/Dic/2025',desc:'Descuento/Aplicacion Diciembre 2025'},
    {nit:'830143270',monto:4998000,fecha:'01/Feb/2026',desc:'Descuento/Aplicacion Febrero 2026'},
    {nit:'830060320',monto:1600000,fecha:'01/Jun/2025',desc:'Descuento/Aplicacion Junio 2025'},
    {nit:'830060320',monto:1600000,fecha:'01/Dic/2025',desc:'Descuento/Aplicacion Diciembre 2025'},
    {nit:'830030823',monto:6052384,fecha:'01/Ene/2024',desc:'Descuento/Aplicacion RT Pendiente 2024 2024'},
    {nit:'830030823',monto:6052384,fecha:'01/Ene/2025',desc:'Descuento/Aplicacion Enero 2025'},
    {nit:'830030823',monto:4974000,fecha:'01/Ene/2026',desc:'Descuento/Aplicacion Enero 2026'},
    {nit:'830059659',monto:5000000,fecha:'01/Abr/2025',desc:'Descuento/Aplicacion Abril 2025'},
    {nit:'830059659',monto:5000000,fecha:'01/May/2025',desc:'Descuento/Aplicacion Mayo 2025'},
    {nit:'830059659',monto:5000000,fecha:'01/Jun/2025',desc:'Descuento/Aplicacion Junio 2025'},
    {nit:'830059659',monto:5000000,fecha:'01/Jul/2025',desc:'Descuento/Aplicacion Julio 2025'},
    {nit:'830059659',monto:5000000,fecha:'01/Ago/2025',desc:'Descuento/Aplicacion Agosto 2025'},
    {nit:'830059659',monto:5000000,fecha:'01/Sep/2025',desc:'Descuento/Aplicacion Septiembre 2025'},
    {nit:'830059659',monto:5000000,fecha:'01/Oct/2025',desc:'Descuento/Aplicacion Octubre 2025'},
    {nit:'830059659',monto:5000000,fecha:'01/Nov/2025',desc:'Descuento/Aplicacion Noviembre 2025'},
    {nit:'830059659',monto:5000000,fecha:'01/Dic/2025',desc:'Descuento/Aplicacion Diciembre 2025'},
    {nit:'800197278',monto:8000000,fecha:'01/Ene/2024',desc:'Descuento/Aplicacion RT Pendiente 2024 2024'},
    {nit:'800197278',monto:8000000,fecha:'01/Oct/2025',desc:'Descuento/Aplicacion Octubre 2025'},
    {nit:'800197278',monto:9000000,fecha:'01/Nov/2025',desc:'Descuento/Aplicacion Noviembre 2025'},
    {nit:'800197278',monto:7500000,fecha:'01/Abr/2026',desc:'Descuento/Aplicacion Abril 2026'},
    {nit:'800197278',monto:7500000,fecha:'01/May/2026',desc:'Descuento/Aplicacion Mayo 2026'},
    {nit:'900031181',monto:15511542,fecha:'01/Feb/2025',desc:'Descuento/Aplicacion Febrero 2025'},
    {nit:'900031181',monto:15511542,fecha:'01/May/2025',desc:'Descuento/Aplicacion Mayo 2025'},
    {nit:'900031181',monto:1975400,fecha:'01/Oct/2025',desc:'Descuento/Aplicacion Octubre 2025'},
    {nit:'830063214',monto:4500000,fecha:'01/Jun/2025',desc:'Descuento/Aplicacion Junio 2025'},
    {nit:'830132477',monto:23000000,fecha:'01/Ene/2024',desc:'Descuento/Aplicacion RT Pendiente 2024 2024'},
    {nit:'830132477',monto:23000000,fecha:'01/Dic/2025',desc:'Descuento/Aplicacion Diciembre 2025'},
    {nit:'900303451',monto:15500000,fecha:'01/Ene/2024',desc:'Descuento/Aplicacion RT Pendiente 2024 2024'},
    {nit:'900303451',monto:7750000,fecha:'01/Feb/2025',desc:'Descuento/Aplicacion Febrero 2025'},
    {nit:'900303451',monto:7750000,fecha:'01/Mar/2025',desc:'Descuento/Aplicacion Marzo 2025'},
    {nit:'900303451',monto:7150000,fecha:'01/Feb/2026',desc:'Descuento/Aplicacion Febrero 2026'},
    {nit:'900303451',monto:7150000,fecha:'01/Mar/2026',desc:'Descuento/Aplicacion Marzo 2026'},
    {nit:'830027675',monto:17000000,fecha:'01/Ene/2024',desc:'Descuento/Aplicacion RT Pendiente 2024 2024'},
    {nit:'830027675',monto:17000000,fecha:'01/Ene/2025',desc:'Descuento/Aplicacion Enero 2025'},
    {nit:'830032214',monto:9000000,fecha:'01/Dic/2025',desc:'Descuento/Aplicacion Diciembre 2025'},
    {nit:'830032214',monto:8500000,fecha:'01/Ene/2026',desc:'Descuento/Aplicacion Enero 2026'},
    {nit:'830032214',monto:8500000,fecha:'01/Feb/2026',desc:'Descuento/Aplicacion Febrero 2026'},
    {nit:'900624128',monto:10000000,fecha:'01/Ene/2024',desc:'Descuento/Aplicacion RT Pendiente 2024 2024'},
    {nit:'900624128',monto:5000000,fecha:'01/Ago/2025',desc:'Descuento/Aplicacion Agosto 2025'},
    {nit:'900624128',monto:2284800,fecha:'01/Oct/2025',desc:'Descuento/Aplicacion Octubre 2025'},
    {nit:'900624128',monto:14547902,fecha:'01/Dic/2025',desc:'Descuento/Aplicacion Diciembre 2025'},
    {nit:'901551362',monto:43200000,fecha:'01/Ene/2024',desc:'Descuento/Aplicacion RT Pendiente 2024 2024'},
    {nit:'901551362',monto:23682219,fecha:'01/Ene/2025',desc:'Descuento/Aplicacion Enero 2025'},
    {nit:'901551362',monto:12317381,fecha:'01/Feb/2025',desc:'Descuento/Aplicacion Febrero 2025'},
    {nit:'901551362',monto:4634675,fecha:'01/Sep/2025',desc:'Descuento/Aplicacion Septiembre 2025'},
    {nit:'901551362',monto:2565325,fecha:'01/Oct/2025',desc:'Descuento/Aplicacion Octubre 2025'},
    {nit:'901214863',monto:7000000,fecha:'01/Oct/2025',desc:'Descuento/Aplicacion Octubre 2025'},
    {nit:'901214863',monto:7000000,fecha:'01/Nov/2025',desc:'Descuento/Aplicacion Noviembre 2025'},
    {nit:'901214863',monto:7402618,fecha:'01/Dic/2025',desc:'Descuento/Aplicacion Diciembre 2025'},
    {nit:'900769934',monto:5000000,fecha:'01/Ene/2024',desc:'Descuento/Aplicacion RT Pendiente 2024 2024'},
    {nit:'900769934',monto:580000,fecha:'01/Ene/2025',desc:'Descuento/Aplicacion Enero 2025'},
    {nit:'900769934',monto:2145000,fecha:'01/Feb/2025',desc:'Descuento/Aplicacion Febrero 2025'},
    {nit:'900769934',monto:1800000,fecha:'01/Mar/2025',desc:'Descuento/Aplicacion Marzo 2025'},
    {nit:'830142114',monto:6000000,fecha:'01/Jun/2025',desc:'Descuento/Aplicacion Junio 2025'},
    {nit:'830142114',monto:6000000,fecha:'01/Jul/2025',desc:'Descuento/Aplicacion Julio 2025'},
    {nit:'901483953',monto:4948389,fecha:'01/Ene/2024',desc:'Descuento/Aplicacion RT Pendiente 2024 2024'},
    {nit:'901483953',monto:2022883,fecha:'01/Ene/2025',desc:'Descuento/Aplicacion Enero 2025'},
    {nit:'901483953',monto:2022883,fecha:'01/Mar/2025',desc:'Descuento/Aplicacion Marzo 2025'},
    {nit:'901483953',monto:149940,fecha:'01/Ago/2025',desc:'Descuento/Aplicacion Agosto 2025'},
    {nit:'901483953',monto:339150,fecha:'01/Dic/2025',desc:'Descuento/Aplicacion Diciembre 2025'},
    {nit:'901483953',monto:339150,fecha:'01/Mar/2026',desc:'Descuento/Aplicacion Marzo 2026'},
    {nit:'900032117',monto:16500000,fecha:'01/Ene/2024',desc:'Descuento/Aplicacion RT Pendiente 2024 2024'},
    {nit:'830092018',monto:27000000,fecha:'01/Ene/2024',desc:'Descuento/Aplicacion RT Pendiente 2024 2024'},
    {nit:'830092018',monto:9000000,fecha:'01/Ene/2025',desc:'Descuento/Aplicacion Enero 2025'},
    {nit:'830092018',monto:9000000,fecha:'01/Feb/2025',desc:'Descuento/Aplicacion Febrero 2025'},
    {nit:'830092018',monto:9000000,fecha:'01/Mar/2025',desc:'Descuento/Aplicacion Marzo 2025'},
    {nit:'9017156845',monto:8000000,fecha:'01/Ene/2024',desc:'Descuento/Aplicacion RT Pendiente 2024 2024'},
    {nit:'9017156845',monto:3247000,fecha:'01/Ene/2025',desc:'Descuento/Aplicacion Enero 2025'},
    {nit:'830085411',monto:5000000,fecha:'01/May/2025',desc:'Descuento/Aplicacion Mayo 2025'},
    {nit:'830085411',monto:5000000,fecha:'01/Jun/2025',desc:'Descuento/Aplicacion Junio 2025'},
    {nit:'900410127-8',monto:611500,fecha:'01/Jun/2025',desc:'Descuento/Aplicacion Junio 2025'},
    {nit:'900410127-8',monto:611500,fecha:'01/Jul/2025',desc:'Descuento/Aplicacion Julio 2025'},
    {nit:'900410127-8',monto:611500,fecha:'01/Ago/2025',desc:'Descuento/Aplicacion Agosto 2025'},
    {nit:'900410127-8',monto:611500,fecha:'01/Sep/2025',desc:'Descuento/Aplicacion Septiembre 2025'},
    {nit:'900410127-8',monto:611500,fecha:'01/Oct/2025',desc:'Descuento/Aplicacion Octubre 2025'},
    {nit:'900410127-8',monto:611500,fecha:'01/Nov/2025',desc:'Descuento/Aplicacion Noviembre 2025'},
    {nit:'900410127-8',monto:611500,fecha:'01/Dic/2025',desc:'Descuento/Aplicacion Diciembre 2025'},
    {nit:'900410127-8',monto:42179481,fecha:'01/Ene/2026',desc:'Descuento/Aplicacion Enero 2026'},
  ];

  // --- 1. Construir mapa NIT -> cliente_id desde hoja CLIENTES ---
  var shCli   = getSheet(SHEETS.CLIENTES);
  var rowsCli = sheetToObjects(shCli);
  var nitMap  = {};
  for (var i = 0; i < rowsCli.length; i++) {
    var nit = String(rowsCli[i].nit || '').trim();
    var cid = String(rowsCli[i].cliente_id || '').trim();
    if (nit) nitMap[nit] = cid;
  }
  Logger.log('Mapa NIT->ID construido: ' + Object.keys(nitMap).length + ' clientes');

  // --- 2. Migrar REINVERSION ---
  var shReinv   = getSheet(SHEETS.REINVERSION);
  // Limpiar hoja excepto cabecera
  if (shReinv.getLastRow() > 1) shReinv.deleteRows(2, shReinv.getLastRow() - 1);
  var headersR  = shReinv.getRange(1,1,1,shReinv.getLastColumn()).getValues()[0];
  var migR = 0, skipR = 0;

  for (var r = 0; r < REINVERSION.length; r++) {
    var d    = REINVERSION[r];
    var nit  = String(d.nit).trim();
    // Handle NIT variants like 900410127-8 -> 900410127
    var nitClean = nit.replace(/-.*$/,'');
    var cid  = nitMap[nit] || nitMap[nitClean] || null;
    if (!cid) { Logger.log('REINV SKIP NIT no encontrado: ' + nit); skipR++; continue; }
    var row  = buildRow(headersR, {
      reinv_id:         'RI-' + nit + '-' + d.anio,
      cliente_id:       cid,
      valor_reinversion:d.valor,
      tiempo_pactado:   d.meses ? d.meses + ' meses' : '',
      valor_gastado:    0,
      fecha_registro:   '01/01/' + d.anio,
      descripcion:      'Reinversion ' + d.anio + (d.alcance ? ' - ' + d.alcance : '') + ' (migrado desde CSV)'
    });
    shReinv.appendRow(row);
    migR++;
  }

  // --- 3. Migrar BITACORA ---
  var shBit   = getSheet(SHEETS.BITACORA);
  if (shBit.getLastRow() > 1) shBit.deleteRows(2, shBit.getLastRow() - 1);
  var headersB = shBit.getRange(1,1,1,shBit.getLastColumn()).getValues()[0];
  var migB = 0, skipB = 0;

  for (var b = 0; b < BITACORA.length; b++) {
    var d   = BITACORA[b];
    var nit = String(d.nit).trim();
    var nitClean = nit.replace(/-.*$/,'');
    var cid = nitMap[nit] || nitMap[nitClean] || null;
    if (!cid) { Logger.log('BIT SKIP NIT no encontrado: ' + nit); skipB++; continue; }
    var row = buildRow(headersB, {
      bit_id:      'BIT-' + nit + '-' + b,
      cliente_id:  cid,
      tipo:        'gasto',
      monto:       d.monto,
      fecha:       d.fecha,
      descripcion: d.desc + ' (migrado desde CSV)',
      creado_por:  'Migración CSV'
    });
    shBit.appendRow(row);
    migB++;
  }

  var resumen = {
    reinversion_migradas: migR,
    reinversion_omitidas: skipR,
    bitacora_migradas:    migB,
    bitacora_omitidas:    skipB
  };
  Logger.log('RESULTADO: ' + JSON.stringify(resumen));
  return resumen;
}
