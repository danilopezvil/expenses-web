# Auditoría de seguridad — expenses-web

Fecha: 2026-04-01

## Alcance revisado
- Flujo de autenticación en cliente (`auth.store.ts`, `client.ts`, `auth.api.ts`, layout protegido y middleware).
- Manejo de tokens/cookies y control de sesión en navegación.

## Hallazgos

### 1) Refresh token persistido en `localStorage` (riesgo alto)
**Evidencia técnica**
- El store persiste `refreshToken` en `localStorage` (`partialize`).
- El cliente HTTP lee y actualiza el refresh token desde `localStorage`.

**Impacto**
- Cualquier XSS (propio o de tercero) puede exfiltrar refresh tokens y secuestrar sesiones de larga duración.

**Recomendación**
- Mover refresh token a cookie `HttpOnly; Secure; SameSite=Strict/Lax` emitida por backend.
- Dejar en cliente únicamente estado no sensible.

---

### 2) Access token expuesto en `window.__zustand_auth_token__` (riesgo alto)
**Evidencia técnica**
- El token se escribe/lee desde una propiedad global de `window`.

**Impacto**
- Scripts de terceros comprometidos (analytics, extensiones, inyección XSS) pueden leer el token y usarlo para llamadas API.

**Recomendación**
- Evitar variables globales para secretos.
- Preferir cookies `HttpOnly` + backend session/rotation o un mecanismo de memoria encapsulada no global.

---

### 3) Cola de requests en refresh puede quedar colgada indefinidamente (bug de disponibilidad)
**Evidencia técnica**
- Si hay `401` concurrentes y `isRefreshing=true`, las requests entran a `pendingRequests` y esperan callback.
- En fallo de refresh (`catch`), no se drena/rechaza `pendingRequests`; solo se hace reject del request original.

**Impacto**
- Promesas pendientes sin resolver/rechazar, UI bloqueada y fuga de memoria bajo errores repetidos.

**Recomendación**
- Implementar `onRefreshFailed(error)` que rechace explícitamente toda la cola y la limpie.
- Añadir pruebas de concurrencia de interceptores (2+ requests simultáneas con refresh fallido).

---

### 4) Cookie de sesión de frontend no es `HttpOnly` ni `Secure` (riesgo medio)
**Evidencia técnica**
- `x-auth-user` se setea con `document.cookie` desde cliente, solo con `SameSite` y `Max-Age`.

**Impacto**
- Puede leerse/modificarse por JavaScript; no debe considerarse señal confiable de autenticación.
- En HTTP no seguro, puede filtrarse sin `Secure`.

**Recomendación**
- Evitar cookies de sesión “de confianza” setadas por JS.
- Si se necesita cookie de sesión, emitirla desde backend con `HttpOnly; Secure`.

---

### 5) Fallback a API por `http://localhost` en configuración base (riesgo medio)
**Evidencia técnica**
- `BASE_URL` cae a `http://localhost:3000/v1` cuando falta `NEXT_PUBLIC_API_URL`.

**Impacto**
- En despliegues mal configurados puede terminar en tráfico sin TLS o endpoint inesperado.

**Recomendación**
- Fallar explícitamente en producción si falta variable.
- Validar `https://` en entornos productivos.

## Prioridad sugerida
1. Migrar refresh/access tokens a esquema con cookies `HttpOnly` y rotación robusta.
2. Corregir el bug de cola colgada en interceptor de refresh.
3. Endurecer configuración (`NEXT_PUBLIC_API_URL` obligatoria en producción).

## Nota
Este reporte es de revisión estática del frontend y no sustituye pentest dinámico ni revisión de backend/API (autorización, rate limits, validación server-side, CSRF/CORS, etc.).
