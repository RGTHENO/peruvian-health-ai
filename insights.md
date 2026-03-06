# Project Insights

Date: 2026-03-06
Repository: `peruvian-health-ai`

## Summary

Se ejecutó una pasada completa de performance, accesibilidad, responsive y mantenibilidad sobre la web pública y el portal médico. Las mejoras quedaron implementadas y verificadas localmente.

## Baseline vs Final

### Build output

- Antes:
  - `dist/assets/index.js`: `718.54 kB` (`209.37 kB` gzip)
  - Todo el enrutado principal estaba en el bundle inicial.
- Después:
  - bundle principal: `dist/assets/index-JYc2DdUA.js`: `320.15 kB` (`103.65 kB` gzip)
  - code-splitting real por ruta:
    - `Index`: `8.69 kB`
    - `Directory`: `5.97 kB`
    - `DoctorDashboard`: `5.78 kB`
    - `DoctorConsultation`: `25.10 kB`
    - `DoctorAgenda`: `52.37 kB`
    - `Login`: `87.13 kB`

### Lighthouse home

- Móvil antes:
  - Performance: `76`
  - Accessibility: `93`
  - LCP: `4.5 s`
  - Unused JS: `132 KiB`
- Móvil después:
  - Performance: `83`
  - Accessibility: `95`
  - LCP: `3.5 s`
  - Unused JS: `45 KiB`

- Desktop antes:
  - Performance: `98`
  - Accessibility: `93`
- Desktop después:
  - Performance: `97`
  - Accessibility: `95`

### Quality tooling

- `react-doctor` antes: `91/100`
- `react-doctor` después: `100/100`
- `npm run build`: passing
- `npm test`: passing
- `npm run lint`: sin errores; quedan solo warnings no bloqueantes de `react-refresh/only-export-components` en wrappers shadcn/ui

## Implemented Improvements

### 1. Initial payload and route loading

Files:
- `src/App.tsx`
- `src/components/RouteFallback.tsx`

Changes:
- Migración de rutas a `React.lazy()` + `Suspense`.
- Fallback de carga accesible para cambios de ruta.
- Separación del portal médico del payload inicial público.

Impact:
- Reducción fuerte del JS inicial.
- Menor `unused-javascript` en Lighthouse.

### 2. Critical rendering path

Files:
- `index.html`
- `src/index.css`
- `src/pages/Index.tsx`
- `src/assets/hero-health-768.webp`
- `src/assets/hero-health-1280.webp`
- `src/assets/hero-health-1920.webp`

Changes:
- Reemplazo de `@import` de Google Fonts por `preconnect` + `link rel="stylesheet"` en `head`.
- Hero image optimizada con variantes WebP responsivas.
- Uso de `<picture>` + `srcSet` + `sizes`.
- Prioridad alta de carga para el hero above-the-fold.
- Activación real del `reveal-on-scroll` moviendo estilos a `index.css`.
- Respeto a `prefers-reduced-motion`.

Impact:
- Mejora del LCP móvil.
- Menor peso descargado en la hero.

### 3. Accessibility and semantics

Files:
- `src/components/Navbar.tsx`
- `src/components/NotificationBell.tsx`
- `src/components/VoiceDictation.tsx`
- `src/pages/DoctorAgenda.tsx`
- `src/components/doctor/ConsultationFormPanel.tsx`
- `src/components/doctor/PatientHistoryPanel.tsx`
- múltiples páginas con `<main id="main-content">`

Changes:
- Skip link global.
- `main` targets consistentes para navegación por teclado.
- `aria-label` en botones icon-only.
- Mejores focus states en botones custom.
- Eliminación de `Link > Button` anidados; migración a `Button asChild`.
- Formularios clave con `name`, `autocomplete`, `spellCheck`, `inputMode`.

Impact:
- Mejor score de accesibilidad.
- HTML más semántico y navegación más robusta.

### 4. URL-driven directory filters

Files:
- `src/pages/Directory.tsx`

Changes:
- La búsqueda y los filtros ahora viven en query params:
  - `q`
  - `especialidad`
  - `seguro`
  - `modalidad`
- El buscador de la home ahora sí hidrata el directorio correctamente.

Impact:
- Deep linking real.
- Back/forward consistente.
- Mejor UX de compartición y recarga.

### 5. Doctor consultation architecture

Files:
- `src/pages/DoctorConsultation.tsx`
- `src/components/doctor/ConsultationFormPanel.tsx`
- `src/components/doctor/PatientHistoryPanel.tsx`
- `src/lib/doctor-consultation.ts`
- `src/lib/appointments-store.ts`
- `src/lib/encounters-store.ts`

Changes:
- Refactor de `DoctorConsultation` a `useReducer`.
- Extracción de panel de formulario y panel de historial.
- Reemplazo de mutación directa de mocks por stores cliente con `localStorage` + `useSyncExternalStore`.
- Persistencia de:
  - estado de citas
  - encuentros clínicos agregados
- Se agregó guardado de referencia quirúrgica como encuentro.
- Se eliminaron keys inestables en formularios dinámicos usando ids reales.

Impact:
- Menor complejidad por componente.
- Mejor consistencia entre dashboard, agenda y ficha del paciente.
- Menos riesgo de bugs por mutación de datos importados.

### 6. Login flow UX

Files:
- `src/pages/Login.tsx`

Changes:
- Atributos correctos de autofill.
- `inputMode` y `spellCheck` apropiados.
- Estado de envío con spinner y bloqueo temporal.
- Limpieza segura del timeout de redirección.

Impact:
- Mejor UX móvil.
- Mejor compatibilidad con password managers/autofill.

## Validation Performed

- `npm run build`
- `npm test`
- `npm run lint`
- `npx react-doctor@latest . --verbose --diff`
- Lighthouse móvil y desktop sobre preview de producción
- Verificación visual con navegador automatizado en viewport móvil (`390x844`)

## Final State

- App funcionando en desarrollo y producción local.
- Mejoras implementadas en performance, accesibilidad, responsive y arquitectura.
- Riesgos principales del informe original cubiertos.

## Remaining Non-Blocking Notes

- Persisten warnings de `react-refresh/only-export-components` en algunos wrappers de `shadcn/ui`.
- `unused-css-rules` aún reporta alrededor de `10-11 KiB`; corresponde sobre todo al CSS global de utilidades y no bloquea release.
