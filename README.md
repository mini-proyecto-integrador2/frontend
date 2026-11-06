# Salón de Estudio — Frontend

Aplicación web del mini-proyecto 2 (Salón de Estudio Colaborativo en Tiempo Real).
React + TypeScript + Vite + Tailwind CSS. Se publica en **Vercel**.

> El frontend **nunca** consulta Firestore directamente: todos los datos pasan por la API (backend-api en Render).

## Requisitos

- Node.js 20 o superior
- npm

## Cómo ejecutarlo en local

```bash
# 1. Instalar dependencias
npm install

# 2. Crear el archivo de variables de entorno a partir del ejemplo
cp .env.example .env        # en PowerShell: Copy-Item .env.example .env
#    y poner la URL real de la API en VITE_API_URL

# 3. Levantar el servidor de desarrollo
npm run dev                 # abre http://localhost:5173
```

## Variables de entorno

| Variable | Para qué sirve | Ejemplo |
|---|---|---|
| `VITE_API_URL` | URL pública de la API en Render, sin `/` al final | `https://salon-api.onrender.com` |

El archivo `.env` no se sube al repositorio. En Vercel la variable se configura en
**Settings → Environment Variables**.

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Compila para producción en `dist/` |
| `npm run preview` | Sirve la versión compilada para probarla |
| `npm run lint` | Revisa el código con oxlint |

## Docker

```bash
docker build --build-arg VITE_API_URL=https://salon-api.onrender.com -t salon-frontend .
docker run -p 8080:80 salon-frontend   # abre http://localhost:8080
```

La imagen compila la app con Node y la sirve con Nginx. `nginx.conf` devuelve `index.html`
en cualquier ruta para que recargar `/base-tecnica` no dé error 404.

## Despliegue en Vercel

1. Importar el repositorio en Vercel (framework: Vite).
2. Agregar la variable `VITE_API_URL`.
3. `vercel.json` redirige todas las rutas a `index.html`, así recargar una ruta no falla.

## Rutas (mapa del sitio)

| Ruta | Pantalla | Estado |
|---|---|---|
| `/` | Inicio | Sprint 0 |
| `/base-tecnica` | Base técnica: muestra el dato de Firestore (cargando, error, éxito) | Sprint 0 |
| `/ingresar`, `/registro`, `/completar-perfil` | Identidad | Sprint 1 |
| `/panel`, `/perfil` | Panel y perfil | Sprint 2 |
| `/sala/:id` | Sala | Sprint 3 |
| `/ayuda` | Ayuda | Sprint 6 |
| cualquier otra | Página no encontrada (404) | Sprint 0 |

## Estructura

```
src/
  components/   Encabezado, Pie, Logo, Boton, Mensaje (componentes de la guía visual)
  layouts/      LayoutBase: encabezado + contenido + pie
  pages/        Una página por ruta del mapa del sitio
  services/     api.ts: cliente de la API (usa VITE_API_URL)
  index.css     Tailwind + tokens de color y tipografía de la guía visual
```
