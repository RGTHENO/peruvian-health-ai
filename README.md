# SaludPe Monorepo

Monorepo con:

- [frontend](/home/victor/Documents/SALUD/peruvian-health-ai/frontend) para la app React/Vite
- [backend](/home/victor/Documents/SALUD/peruvian-health-ai/backend) para la API FastAPI

## Estructura

```text
peruvian-health-ai/
  frontend/
  backend/
  backend-plan.md
  insights.md
  docker-compose.yml
  Makefile
```

## Requisitos

- Node.js 20+
- Python 3.12
- Docker opcional para levantar todo el stack

## Comandos útiles

### Frontend

```bash
npm --prefix frontend install
npm --prefix frontend run dev -- --host 0.0.0.0 --port 8080
```

### Backend

```bash
python3.12 -m venv backend/.venv
backend/.venv/bin/pip install -e ./backend[dev]
cd backend
../backend/.venv/bin/fastapi dev --host 0.0.0.0 --port 8000
```

### Backend por tunnel de Cloudflare

```bash
cd backend
../backend/.venv/bin/fastapi run --host 0.0.0.0 --port 8011
```

En otra terminal:

```bash
cloudflared tunnel --url http://127.0.0.1:8011 --no-autoupdate
make tunnel-sync URL=https://<nuevo-subdominio>.trycloudflare.com
```

Nota: los `quick tunnels` de `trycloudflare.com` son efimeros. Para un hostname estable hace falta autenticar Cloudflare y crear un named tunnel.

### Monorepo completo

```bash
docker compose up --build
```

## Credenciales demo

- Médico: `medico@saludpe.pe` / `SaludPe123!`
- Paciente: `paciente@saludpe.pe` / `SaludPe123!`
- Admin: `admin@saludpe.pe` / `SaludPe123!`

## Endpoints principales

- `GET /healthz`
- `GET /readyz`
- `POST /api/v1/auth/login`
- `GET /api/v1/directory/doctors`
- `GET /api/v1/doctors/me/dashboard`
- `GET /api/v1/patients/me/history`
- `POST /api/v1/patients/{patient_id}/encounters/consultations`

## Estado actual

- frontend movido a `frontend/`
- backend FastAPI operativo con seeds, auth, directorio, agenda, pacientes e historial
- tests backend incluidos
- rewrites de Vercel apuntando al backend via Cloudflare Tunnel
