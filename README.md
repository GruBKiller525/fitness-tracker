# FitTracker

PWA personal de seguimiento de entrenamiento en el gimnasio. Modo oscuro, mobile-first, funciona offline. Datos en IndexedDB del navegador.

## Instalación local

```bash
npm install
npm run dev       # desarrollo en http://localhost:5173
npm run build     # build de producción en /dist
```

## Despliegue en Vercel (gratis)

1. Sube el proyecto a un repositorio de GitHub
2. Ve a [vercel.com](https://vercel.com) → Import project → selecciona el repo
3. Vercel detecta Vite automáticamente → Deploy
4. Te da una URL pública tipo `https://mi-fittracker.vercel.app`

Desde el móvil abre esa URL en Chrome → menú → "Añadir a pantalla de inicio" para instalarla como app.

## Configurar sincronización con Notion

### 1. Crear integración en Notion

1. Ve a [notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Crea una nueva integración → dale un nombre (ej. "FitTracker")
3. Copia el **Internal Integration Token** (`secret_xxx...`)

### 2. Crear la base de datos en Notion

Crea una base de datos con estas propiedades (nombres exactos):

| Propiedad | Tipo |
|-----------|------|
| Nombre | Title |
| Fecha | Date |
| Rutina | Select |
| Volumen (kg) | Number |
| Series completadas | Number |
| Energía | Select |
| Sueño (h) | Number |
| Duración (min) | Number |
| Peso corporal (kg) | Number |

Abre la base de datos → `···` menú → **Connections** → añade tu integración.

Copia el **ID de la base de datos**: es la parte de la URL entre el último `/` y el `?`
Ejemplo: `https://notion.so/workspace/`**`abc123def456`**`?v=...`

### 3. Conectar en la app

Ve a **Ajustes → Notion** → pega el token y el ID → Guardar.

A partir de ahí, en el resumen de cada sesión aparece el botón **"Enviar a Notion"**.

## Stack

- Vite + React + TypeScript
- TailwindCSS v4
- Dexie.js (IndexedDB)
- Recharts + React Router
- vite-plugin-pwa (offline)
- date-fns
- Vercel Serverless Functions (proxy Notion API)
