# Project Insights

Date: 2026-03-07
Repository: `peruvian-health-ai`

## Summary

El cambio consolida `peruvian-health-ai` como monorepo real y deja la aplicación operativa de punta a punta:

- el frontend React/Vite fue movido a `frontend/`
- se agregó un backend `FastAPI` en `backend/`
- el frontend dejó de depender solo de mocks/localStorage para autenticación, portal médico, notificaciones y configuración
- se añadieron flujos locales de desarrollo para monorepo completo con `Makefile` y `docker-compose`

## Scope Of Changes

### 1. Monorepo restructuring

Files:
- `README.md`
- `frontend/**`
- `.gitignore`

Changes:
- El proyecto frontend existente fue reubicado bajo `frontend/` sin cambiar su stack base (`React + Vite + shadcn/ui`).
- El README raíz ahora documenta el monorepo, comandos separados por capa y credenciales demo.
- `.gitignore` se amplió para excluir artefactos Python adicionales del backend (`*.db`, `*.egg-info/`) además de venvs, caches y `__pycache__`.

Impact:
- La base queda preparada para trabajar frontend y backend en un solo repo.
- Se evita mezclar código fuente con artefactos locales generados en desarrollo.

### 2. New FastAPI backend

Files:
- `backend/app/**`
- `backend/migrations/**`
- `backend/tests/**`
- `backend/pyproject.toml`
- `backend/alembic.ini`
- `backend/.env.example`
- `backend/README.md`

Changes:
- Se creó una API versionada bajo `/api/v1` con `FastAPI`, `SQLAlchemy 2`, `Pydantic Settings`, `Alembic` y JWT.
- Se implementaron endpoints para:
  - autenticación (`login`, `refresh`, `logout`, `me`, cambio de contraseña)
  - directorio médico y detalle de doctor
  - dashboard, agenda, pacientes, ficha clínica y perfil del médico autenticado
  - historial del paciente
  - citas y cambios de estado
  - encuentros clínicos
  - notificaciones y preferencias de notificación
  - metadata/versionado
- El backend incorpora modelos, repositorios, servicios y serializadores por capa.
- `main.py` agrega `healthz`, `readyz`, CORS configurable y seed de datos al iniciar.
- Hay migraciones iniciales y una segunda migración para preferencias/notificaciones del portal.

Impact:
- El producto deja de estar limitado a mocks frontend y pasa a tener una API con estado persistente.
- La arquitectura queda lista para evolucionar a producción con PostgreSQL y despliegue separado por capa.

### 3. Frontend auth and API integration

Files:
- `frontend/src/App.tsx`
- `frontend/src/components/ProtectedRoute.tsx`
- `frontend/src/contexts/AuthContext.tsx`
- `frontend/src/lib/api-client.ts`
- `frontend/src/lib/api.ts`
- `frontend/src/lib/auth-session.ts`
- `frontend/src/lib/query-client.ts`
- `frontend/src/pages/Login.tsx`

Changes:
- Se añadió `AuthProvider` global y protección de rutas por rol (`doctor` y `patient`).
- Se reemplazó la sesión mock por una sesión persistida con `accessToken` + `refreshToken`.
- El cliente HTTP maneja `401`, refresco automático de token y limpieza de sesión inválida.
- El login ahora llama al backend real y respeta `redirect` y `role` desde query params.
- Se integró `@tanstack/react-query` como capa estándar de cache y sincronización remota.

Impact:
- La navegación protegida ya responde al usuario autenticado real, no a estado local ad hoc.
- La app puede mantener sesión, rehidratar usuario y recuperarse mejor ante expiración de token.

### 4. Doctor portal migrated from local state to backend data

Files:
- `frontend/src/contexts/NotificationContext.tsx`
- `frontend/src/pages/DoctorAgenda.tsx`
- `frontend/src/pages/DoctorConsultation.tsx`
- `frontend/src/pages/DoctorDashboard.tsx`
- `frontend/src/pages/DoctorPatientRecord.tsx`
- `frontend/src/pages/DoctorPatients.tsx`
- `frontend/src/pages/DoctorProfile.tsx`
- `frontend/src/pages/DoctorSettings.tsx`
- `frontend/src/pages/Historial.tsx`
- `frontend/src/lib/appointments-store.ts`
- `frontend/src/lib/encounters-store.ts`

Changes:
- El portal médico y el historial del paciente fueron conectados a endpoints reales del backend.
- Dashboard, agenda, lista de pacientes, ficha de paciente y settings ahora consumen datos remotos.
- Las notificaciones y sus preferencias pasan por API y se sincronizan con cache local de React Query.
- Configuración del médico ahora permite actualizar perfil, preferencias y contraseña contra el backend.
- El historial del paciente y la consulta clínica dependen de datos servidos por la API, no solo de estructuras mock en memoria.

Impact:
- El flujo principal del producto queda coherente entre login, portal médico, pacientes, historial y settings.
- La persistencia deja de depender de `localStorage` para datos clínicos y de agenda.

### 5. Booking, encounter and notification workflows

Files:
- `backend/app/api/v1/endpoints/appointments.py`
- `backend/app/api/v1/endpoints/encounters.py`
- `backend/app/api/v1/endpoints/notifications.py`
- `backend/app/services/appointments.py`
- `backend/app/services/encounters.py`
- `backend/app/services/notifications.py`
- `backend/tests/test_api.py`

Changes:
- Solo pacientes autenticados pueden crear citas.
- Solo médicos autenticados pueden confirmar/cancelar/completar citas.
- Crear una cita genera visibilidad correcta por rol y notificaciones para el médico.
- Registrar una consulta clínica actualiza el historial recuperable por API.
- Se validó además el ciclo de perfil/preferencias/cambio de contraseña del médico.

Impact:
- Las reglas de autorización ya viven en backend.
- Los flujos críticos del negocio tienen cobertura de integración automatizada.

### 6. Local developer experience and deployment baseline

Files:
- `Makefile`
- `docker-compose.yml`
- `.env.example`
- `frontend/Dockerfile`
- `frontend/scripts/e2e-smoke.mjs`
- `backend/Dockerfile`

Changes:
- Se añadieron comandos consistentes para instalar, correr, testear y lint de frontend/backend.
- `docker-compose.yml` levanta PostgreSQL, backend y frontend como stack local.
- Se definieron variables de entorno base para URLs, secret y conexión DB.
- El frontend incluye script de smoke E2E y Dockerfile para entorno contenedorizado.

Impact:
- Onboarding local más claro.
- Base razonable para CI y despliegue reproducible del stack completo.

## Validation

- `cd backend && .venv/bin/pytest` -> `8 passed`
- `cd backend && .venv/bin/ruff check .` -> passing
- `npm --prefix frontend run build` -> passing
- `npm --prefix frontend run test` -> passing
- Nota no bloqueante: Vite mostró el aviso habitual de `Browserslist: browsers data (caniuse-lite) is 9 months old`, pero no afectó build ni tests.

## Final State

- Repositorio reorganizado como monorepo.
- Backend FastAPI funcional añadido al proyecto.
- Frontend conectado a autenticación y datos reales para los flujos principales.
- Configuración local y contenedorizada disponible para levantar el stack completo.
