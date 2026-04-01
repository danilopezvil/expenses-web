This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Debug de autenticación (login)

Si el login falla y no se ve suficiente detalle, puedes activar logs de diagnóstico en el navegador:

1. Variable de entorno (recomendado en local):

```bash
NEXT_PUBLIC_DEBUG_AUTH=true
```

2. O desde DevTools:

```js
localStorage.setItem('debug:auth', 'true')
```

3. O por URL:

```txt
/es/login?debugAuth=true
```

Con el modo activo, se imprimen eventos `[auth-debug]` con:
- URL base de API detectada.
- Requests de auth (`/auth/login`, `/auth/refresh`, `/auth/me`).
- Status code, mensaje y payload de error de backend.
- Diagnóstico sugerido (`cors_or_network`, `timeout`, `unauthorized`, etc.) para acelerar el troubleshooting.

## Evitar CORS en desarrollo (recomendado)

El frontend ahora usa `/v1` como base URL por defecto y Next.js hace proxy al backend vía `rewrites`.

Variables sugeridas:

```bash
# URL interna del backend para el servidor Next.js (no expuesta al navegador)
API_URL=http://localhost:3001

# Opcional: solo si quieres forzar llamadas directas desde navegador
# (puede requerir CORS en backend)
# NEXT_PUBLIC_API_URL=http://localhost:3001/v1
```

Con esto, el navegador llama a `http://localhost:3002/v1/...` (mismo origen) y Next reenvía a `API_URL`, reduciendo errores CORS en login.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
