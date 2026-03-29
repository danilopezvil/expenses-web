# GastoCompartido — Design System (Apex Ledger Style)

Este archivo se carga automáticamente en cada sesión. Todo código de UI generado para este proyecto **debe seguir estas reglas sin excepción**.

---

## Tokens de Diseño

### Colores
| Token            | Valor     | Uso                                          |
|------------------|-----------|----------------------------------------------|
| Primary          | `#bc000a` | Botones de acción, iconos activos, branding  |
| Background       | `#fcf9f8` | Superficie principal                         |
| Surface 2        | `#f6f3f2` | Fondos de tarjetas y campos de entrada       |
| Text             | `#1c1b1b` | Encabezados, máxima legibilidad              |
| Text Secondary   | `#5d3f3b` | Etiquetas y textos de apoyo                  |
| Border           | `#e7bdb7` | Separadores suaves (1px sólido)              |

En Tailwind, usar siempre las clases semánticas del `tailwind.config.ts` — **no hardcodear hex en JSX**.

### Tipografía
- **Encabezados:** Manrope Bold (800), `tracking-tight` (`letter-spacing: -0.05em`)
- **Cuerpo / UI:** Inter Medium (500)
- Cargar ambas fuentes desde `next/font/google` en `layout.tsx`

### Formas
- `border-radius`: `8px` → clase `rounded-lg` en Tailwind
- Bordes: `1px solid #e7bdb7` → `border border-[#e7bdb7]`

### Espaciado
- Safe area lateral: `24px` → `px-6` en Tailwind

### Transiciones
- Todos los estados interactivos: `transition-all duration-200 ease-in-out`

---

## Componentes — Reglas de Implementación

### Botón Primario
```tsx
<button className="bg-[#bc000a] text-white font-[800] font-manrope uppercase
                   tracking-wide rounded-lg px-6 py-3
                   transition-all duration-200 ease-in-out
                   hover:bg-[#a0000e] active:scale-95">
```
- Texto siempre en **UPPERCASE**
- Font: Manrope Bold
- Sin outline — el color rojo es el indicador de acción

### Input Fields
```tsx
<input className="bg-[#f6f3f2] border-0 border-b border-[#e7bdb7]
                  rounded-t-lg px-4 py-3 font-inter text-[#1c1b1b]
                  placeholder:text-[#5d3f3b]/60
                  focus:outline-none focus:border-[#bc000a]
                  transition-all duration-200 ease-in-out" />
```
- Fondo `Surface 2`, borde inferior sutil
- Focus: borde inferior cambia a `Primary`

### Cards
```tsx
<div className="bg-white rounded-lg border border-[#e7bdb7]
                shadow-sm p-6">
```
- Fondo blanco (no `Surface 2`)
- Sombra muy ligera o plana con borde fino

---

## Flujo de Navegación (Onboarding)

El flujo de entrada siempre sigue este orden:

```
/login  →  (si sin contraseña: /recovery)  →  /groups/select  →  /dashboard
```

1. **`/login`** — Validación de credenciales (email + password)
2. **`/recovery`** — Envío de token por email para recuperación
3. **`/groups/select`** — Carga del contexto del grupo antes de acceder al dashboard
4. **`/dashboard`** — Vista principal, requiere `activeGroup` en el store

La redirección a `/groups/select` ocurre cuando `useGroupStore().activeGroup === null`.

---

## Stack Técnico

- **Next.js 16** App Router con `src/app/[locale]/` para i18n
- **Tailwind CSS v3** — configuración en `tailwind.config.ts`
- **shadcn/ui** para primitivos de UI
- **Zustand** para estado global (`auth.store.ts`, `group.store.ts`)
- **Axios** con interceptors en `src/lib/api/client.ts`
- **next-intl** con locales `es` (default) y `en`
- **react-hook-form + zod** para formularios
- **@tanstack/react-query** para data fetching
- **Convención:** `src/proxy.ts` (no `middleware.ts`) para next-intl en Next.js 16

---

## Reglas Generales de Código

- TypeScript strict mode — sin `any` implícito
- Path alias `@/*` → `src/*`
- No hardcodear colores en JSX cuando hay clase Tailwind disponible
- `params` en layouts/pages de App Router es `Promise<{...}>` (Next.js 16) — siempre `await params`
- No agregar `@import "shadcn/tailwind.css"` a globals.css (es API de Tailwind v4)
- No importar `Geist` desde `next/font/google` (no disponible en este setup)
