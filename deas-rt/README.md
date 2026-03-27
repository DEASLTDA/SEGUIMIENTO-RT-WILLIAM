# DEAS RT — Sistema de Seguimiento Portería Remota

Sistema web para gestión y seguimiento de clientes de Portería Remota de DEAS Ltda.
Coordinador: William Bocanegra

---

## 📁 Estructura del Proyecto

```
deas-rt/
├── index.html              ← Dashboard principal (KPIs + tabla clientes)
├── pages/
│   └── perfil.html         ← Perfil completo de cada cliente
├── css/
│   └── style.css           ← Sistema de diseño corporativo DEAS
├── js/
│   └── api.js              ← Capa de comunicación con Google Sheets API
└── sheets-script/
    └── Code.gs             ← Google Apps Script (backend / base de datos)
```

---

## 🚀 Configuración Paso a Paso

### 1. Configurar Google Apps Script (Backend)

1. Abre tu Google Sheets nuevo (el que será la base de datos)
2. Ve a **Extensiones → Apps Script**
3. Borra el contenido del editor y pega el contenido de `sheets-script/Code.gs`
4. Guarda el proyecto (Ctrl+S), ponle nombre: `DEAS RT API`
5. Haz clic en **Implementar → Nueva implementación**
   - Tipo: **Aplicación web**
   - Ejecutar como: **Yo (tu cuenta)**
   - Quién tiene acceso: **Cualquier persona**
6. Clic en **Implementar** → Copia la URL que aparece (termina en `/exec`)

### 2. Migrar datos iniciales

1. En el editor de Apps Script, selecciona la función `migrarDatosIniciales`
2. Haz clic en **Ejecutar**
3. Acepta los permisos que solicite
4. Esto creará las hojas y cargará los 64 clientes del CSV original

### 3. Conectar el frontend con el backend

1. Abre el archivo `js/api.js`
2. En la línea que dice:
   ```javascript
   const API_URL = 'https://script.google.com/macros/s/TU_DEPLOYMENT_ID/exec';
   ```
3. Reemplaza `TU_DEPLOYMENT_ID` con la URL completa de tu Web App

### 4. Deploy en Vercel

1. Sube el proyecto a GitHub (todos los archivos excepto `sheets-script/`)
2. Conecta el repositorio en [vercel.com](https://vercel.com)
3. Vercel detecta automáticamente que es un sitio estático
4. Haz clic en **Deploy**

---

## 📊 Hojas en Google Sheets (se crean automáticamente)

| Hoja | Descripción |
|------|-------------|
| `CLIENTES` | Datos maestros de todos los clientes |
| `CONTRATOS` | Información de contratos (horas, modalidad, vigilantes) |
| `REINVERSION` | Valores de reinversión por cliente |
| `BITACORA` | Historial de gastos de reinversión |
| `SEGUIMIENTO` | Registros de visitas, análisis, novedades, consignas, pólizas |
| `VIGILANTES` | Lista de vigilantes por cliente |

---

## 🎯 Funcionalidades

### Dashboard (index.html)
- ✅ KPIs: Total clientes, Vigentes, Próximos a vencer, Vencidos
- ✅ Tabla con búsqueda y filtros por estado
- ✅ Indicadores de color por estado del contrato
- ✅ Exportar a Excel y PDF
- ✅ Crear nuevo cliente con modal

### Perfil Cliente (pages/perfil.html)
- ✅ Ficha completa del cliente (NIT, nombre, contactos, fechas)
- ✅ Sección de contrato con timeline visual
- ✅ Reinversión con barra de progreso y alerta de sobrepasar presupuesto
- ✅ Bitácora de gastos (modal historial completo)
- ✅ Servicio: horas, modalidad, cantidad vigilantes
- ✅ Lista de vigilantes con foto de perfil generada
- ✅ Seguimiento: 5 categorías con tabs (Análisis Riesgo, Visitas, Novedades, Consignas, Pólizas)
- ✅ Exportar seguimiento a Excel y PDF
- ✅ Todos los campos editables con modales

---

## 🎨 Colores Corporativos DEAS

| Variable | Color | Uso |
|----------|-------|-----|
| `--blue` | `#1B2F8A` | Principal / Header |
| `--blue-light` | `#2540B8` | Hover / Acentos |
| `--accent` | `#00C2FF` | Gradientes |
| `--green` | `#16A34A` | Vigente |
| `--amber` | `#D97706` | Próximo a vencer |
| `--red` | `#DC2626` | Vencido / Gastos |

---

## ⚠️ Notas Importantes

- El valor de reinversión permite valores que superen el presupuesto (con alerta visual en rojo)
- Los gastos nunca bloquean operaciones, solo muestran alertas
- Los datos de clientes se cachean localmente por 2 minutos para mejor rendimiento
- Para actualizar el deployment de Apps Script después de cambios: **Implementar → Administrar implementaciones → Editar → Nueva versión**
