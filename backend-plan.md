# Backend Plan

## Objetivo

Diseñar e implementar un backend productivo para SaludPe usando `Python 3.12` y `FastAPI`, dentro de un monorepo, manteniendo el frontend actual sin rediseño visual y dejando el producto operativo de punta a punta.

El frontend actual ya define claramente los flujos de negocio que el backend debe soportar:

- directorio médico
- autenticación por rol (`paciente` y `médico`)
- portal médico
- agenda y gestión de citas
- consulta clínica
- historial médico
- ficha de paciente

## Restricción importante

El frontend puede quedarse "como está" a nivel visual y de UX, pero no puede permanecer consumiendo `mocks` y `localStorage` si el objetivo es que el producto quede realmente operativo.

Por tanto, el alcance correcto es:

- no rediseñar el frontend
- sí reemplazar progresivamente la capa de datos mock por llamadas reales al backend

## Stack propuesto

### Backend

- `Python 3.12`
- `FastAPI 0.135.1` al 6 de marzo de 2026
- `Pydantic v2`
- `SQLAlchemy 2.x`
- `Alembic`
- `PostgreSQL`
- `pydantic-settings`
- `pwdlib[argon2]` para hashing de contraseñas
- JWT con access token y refresh token
- `httpx` para tests de integración
- `pytest`
- `ruff`
- `mypy`

### Infraestructura local

- `Docker`
- `docker compose`
- variables de entorno por archivo `.env`

### Observabilidad mínima

- logs estructurados
- `healthz` y `readyz`
- trazabilidad por `request_id`

## Estructura de monorepo

```text
repo/
  frontend/
    # app React actual
  backend/
    pyproject.toml
    alembic.ini
    .env.example
    app/
      main.py
      api/
        deps.py
        v1/
          router.py
          endpoints/
            auth.py
            doctors.py
            directory.py
            appointments.py
            patients.py
            encounters.py
            history.py
            notifications.py
            admin.py
      core/
        config.py
        logging.py
        security.py
        exceptions.py
      db/
        base.py
        session.py
        models/
      schemas/
      repositories/
      services/
      integrations/
      workers/
    migrations/
    tests/
      unit/
      integration/
      contract/
  docker-compose.yml
  Makefile
  .github/workflows/
```

## Principios de arquitectura

### 1. Monolito modular primero

No conviene arrancar con microservicios. El dominio todavía está consolidándose y el frontend actual corresponde a un solo producto cohesionado. Un monolito modular reduce complejidad operacional y acelera la salida a producción.

### 2. API versionada

Toda la API pública debe vivir bajo:

```text
/api/v1
```

### 3. Separación por capas

- `endpoints`: validación HTTP y serialización
- `services`: reglas de negocio
- `repositories`: acceso a datos
- `schemas`: contratos de entrada y salida
- `models`: persistencia

### 4. FastAPI según convención oficial

- usar `Annotated` para parámetros y dependencias
- tipado explícito de retorno
- configuración en `pyproject.toml` para `fastapi dev` y `fastapi run`

## Mapeo del frontend actual al backend

### Directorio

Rutas frontend:

- `/directorio`
- `/doctor/:id`

Necesidades backend:

- búsqueda por texto
- filtros por especialidad, seguro y modalidad
- detalle de médico
- disponibilidad resumida

### Autenticación

Ruta frontend:

- `/iniciar-sesion`

Necesidades backend:

- login paciente
- login médico
- refresh token
- logout
- endpoint `me`
- autorización por rol

### Portal médico

Rutas frontend:

- `/doctor/portal`
- `/doctor/portal/agenda`
- `/doctor/portal/pacientes`
- `/doctor/portal/pacientes/:patientId`
- `/doctor/portal/consulta/:appointmentId`
- `/doctor/portal/configuracion`

Necesidades backend:

- agenda del médico autenticado
- listado de pacientes vinculados
- detalle de paciente
- creación de encuentro clínico
- cambio de estado de cita
- preferencias del médico

### Historial del paciente

Rutas frontend:

- `/historial`

Necesidades backend:

- timeline clínico
- consultas
- laboratorios
- recetas
- cirugías
- acceso solo al paciente dueño de la historia o a un médico autorizado

## Dominios funcionales

### Auth

Responsabilidades:

- login
- refresh
- cierre de sesión
- recuperación futura de contraseña
- control de sesión por dispositivo

### Doctors

Responsabilidades:

- perfil médico
- especialidad
- idiomas
- seguros aceptados
- modalidades de atención
- disponibilidad

### Patients

Responsabilidades:

- perfil paciente
- datos demográficos
- contacto
- alergias
- condiciones
- contacto de emergencia

### Appointments

Responsabilidades:

- creación de cita
- reprogramación
- cancelación
- confirmación
- completado
- filtros por fecha, doctor, paciente y modalidad

### Encounters

Responsabilidades:

- consulta médica
- órdenes de laboratorio
- resultados de laboratorio
- cirugías y procedimientos
- recetas
- notas clínicas

### History

Responsabilidades:

- timeline consolidado del paciente
- filtros por tipo de encuentro
- búsqueda por diagnóstico, medicamento, doctor o laboratorio

### Notifications

Responsabilidades:

- preferencias del usuario
- notificaciones funcionales básicas
- recordatorios de cita

## Modelo de datos inicial

### Identidad y acceso

- `users`
- `roles`
- `user_roles`
- `refresh_tokens`
- `audit_logs`

### Profesionales

- `doctor_profiles`
- `specialties`
- `doctor_specialties`
- `insurers`
- `doctor_insurers`
- `languages`
- `doctor_languages`
- `doctor_availability`

### Pacientes

- `patient_profiles`
- `patient_allergies`
- `patient_conditions`
- `emergency_contacts`

### Atención clínica

- `appointments`
- `encounters`
- `consultation_notes`
- `prescriptions`
- `lab_orders`
- `lab_results`
- `procedures`

### Preferencias y soporte

- `notification_preferences`

## Contratos API propuestos

### Auth

```text
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout
GET    /api/v1/auth/me
```

### Directory / Doctors

```text
GET    /api/v1/directory/doctors
GET    /api/v1/doctors/{doctor_id}
GET    /api/v1/doctors/{doctor_id}/availability
```

### Appointments

```text
GET    /api/v1/appointments
POST   /api/v1/appointments
GET    /api/v1/appointments/{appointment_id}
PATCH  /api/v1/appointments/{appointment_id}
POST   /api/v1/appointments/{appointment_id}/confirm
POST   /api/v1/appointments/{appointment_id}/cancel
POST   /api/v1/appointments/{appointment_id}/complete
```

### Doctor portal

```text
GET    /api/v1/doctors/me/dashboard
GET    /api/v1/doctors/me/agenda
GET    /api/v1/doctors/me/patients
GET    /api/v1/doctors/me/patients/{patient_id}
PATCH  /api/v1/doctors/me/settings
```

### Encounters / History

```text
GET    /api/v1/patients/me/history
GET    /api/v1/patients/{patient_id}/history
GET    /api/v1/patients/{patient_id}/encounters
POST   /api/v1/patients/{patient_id}/encounters/consultations
POST   /api/v1/patients/{patient_id}/encounters/labs
POST   /api/v1/patients/{patient_id}/encounters/procedures
```

### Notifications

```text
GET    /api/v1/notifications/preferences
PATCH  /api/v1/notifications/preferences
GET    /api/v1/notifications
```

### Operación

```text
GET    /healthz
GET    /readyz
GET    /api/v1/meta/version
```

## Esquemas y reglas de negocio clave

### Roles

- `patient`
- `doctor`
- `admin`

### Estados de cita

- `pending`
- `confirmed`
- `cancelled`
- `completed`
- `no_show`

### Regla crítica

Una cita no debe pasar a `completed` sin generar al menos un registro clínico asociado o una justificación explícita de cierre administrativo.

### Agenda

La disponibilidad del médico no se calcula solo desde citas existentes. Debe existir una tabla de disponibilidad base y luego descontar bloques ocupados.

### Historial clínico

El historial mostrado al paciente debe venir de una vista de dominio consolidada, no de múltiples consultas dispersas desde frontend.

## Seguridad

### Autenticación

- JWT de acceso de corta duración
- refresh token persistido y revocable
- hashing con Argon2
- expiración y rotación de refresh tokens

### Autorización

- RBAC por rol
- verificaciones de ownership para pacientes
- verificaciones de vínculo asistencial para médicos

### Seguridad de API

- CORS restringido por entorno
- rate limiting en login y endpoints sensibles
- validación estricta de payloads
- sanitización de logs para evitar fuga de datos sensibles

### Protección de datos

Dado que el sistema maneja datos de salud, debe asumirse un estándar más cercano a datos sensibles clínicos que a una app CRUD convencional. Se debe minimizar exposición, limitar logs y registrar auditoría por acceso.

## Persistencia y migraciones

### Base de datos

`PostgreSQL` es la opción correcta por:

- solidez transaccional
- buen soporte para JSONB cuando convenga
- extensibilidad futura
- compatibilidad operativa con FastAPI y SQLAlchemy

### Migraciones

- toda modificación estructural via `Alembic`
- seeds iniciales versionados
- entorno local reproducible

## Seeds iniciales

Para acelerar la integración con el frontend actual, la primera base debe sembrarse con equivalentes reales de:

- médicos
- pacientes
- citas
- encuentros clínicos
- preferencias de notificaciones

Esto permite reemplazar mocks sin rediseñar pantallas.

## Estrategia de implementación

### Fase 0. Reestructuración del repo

- mover la app React actual a `frontend/`
- crear `backend/`
- añadir `docker-compose.yml`
- añadir `Makefile`
- añadir `.env.example`

### Fase 1. Esqueleto FastAPI

- `pyproject.toml`
- entrypoint para `fastapi dev` y `fastapi run`
- configuración por entorno
- logging
- healthchecks
- excepción global
- CI inicial

### Fase 2. Modelo de datos y migraciones

- definir tablas base
- relaciones
- constraints
- índices
- seeds

### Fase 3. Auth y usuarios

- login
- refresh
- logout
- `me`
- roles
- sesiones

### Fase 4. Directorio médico

- búsqueda
- filtros
- detalle
- disponibilidad resumida

### Fase 5. Citas y agenda

- crear y listar citas
- agenda médica
- cambio de estado
- reprogramación

### Fase 6. Pacientes e historia clínica

- ficha del paciente
- timeline clínico
- consultas
- recetas
- laboratorios
- cirugías

### Fase 7. Integración del frontend

- crear cliente HTTP tipado
- reemplazar mocks y `localStorage`
- conservar UI actual
- manejar loading, errors y estados vacíos reales

### Fase 8. Hardening

- tests de integración
- pruebas de permisos
- observabilidad
- backup y restore
- documentación operativa

## Criterios de aceptación

El producto se considerará operativo cuando:

- `docker compose up` levante `frontend`, `backend` y `postgres`
- el backend arranque con `fastapi dev` en desarrollo y `fastapi run` en producción
- exista documentación OpenAPI usable en `/docs`
- un paciente pueda iniciar sesión y consultar su historial real
- un médico pueda iniciar sesión y ver su dashboard real
- un médico pueda abrir una cita y registrar una consulta clínica
- el historial del paciente refleje esa atención
- el directorio médico consulte base de datos real
- no exista dependencia de mocks para datos clínicos, citas ni pacientes
- los tests críticos pasen en CI

## Calidad y testing

### Tests mínimos

- unit tests de servicios
- integración de endpoints con DB temporal
- auth y permisos
- cambios de estado de cita
- creación de encuentros clínicos
- consistencia del historial

### Calidad estática

- `ruff check`
- `ruff format`
- `mypy`
- `pytest`

## Integración futura con estándares clínicos

El frontend menciona estándar FHIR, pero no conviene empezar montando un servidor FHIR completo. La estrategia correcta es:

1. modelar el dominio con tablas claras
2. asegurar operatividad del producto
3. mapear progresivamente a recursos FHIR

Recursos FHIR objetivo a mediano plazo:

- `Patient`
- `Practitioner`
- `Appointment`
- `Encounter`
- `Observation`
- `MedicationRequest`
- `Procedure`

## Riesgos

### Riesgo 1. Querer backend productivo sin integrar frontend

Eso dejaría dos sistemas paralelos: una API correcta y una UI todavía apoyada en mocks. No cumple el objetivo.

### Riesgo 2. Intentar FHIR completo demasiado pronto

Eleva mucho la complejidad y frena la entrega.

### Riesgo 3. Modelar agenda sin reglas de disponibilidad

Termina generando solapamientos, estados inconsistentes y retrabajo.

## Próximos pasos recomendados

1. aprobar esta arquitectura
2. mover el frontend actual a `frontend/`
3. crear el esqueleto de `backend/`
4. definir el modelo relacional inicial
5. implementar `auth`, `directory` y `appointments` primero
6. integrar frontend contra API real en la siguiente fase

## Referencias

- FastAPI CLI: `fastapi dev` y `fastapi run`
- FastAPI security con OAuth2/JWT
- FastAPI con `Annotated`
- FastAPI con Pydantic v2

Fuentes consultadas:

- https://pypi.org/project/fastapi/
- https://fastapi.tiangolo.com/fastapi-cli/
- https://fastapi.tiangolo.com/tutorial/security/oauth2-jwt/
