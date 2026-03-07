PYTHON := python3.12
BACKEND_VENV := backend/.venv
BACKEND_PYTHON := $(BACKEND_VENV)/bin/python
BACKEND_PIP := $(BACKEND_VENV)/bin/pip
BACKEND_FASTAPI := $(BACKEND_VENV)/bin/fastapi
BACKEND_PYTEST := $(BACKEND_VENV)/bin/pytest
BACKEND_RUFF := $(BACKEND_VENV)/bin/ruff

.PHONY: backend-install backend-dev backend-test backend-lint frontend-install frontend-dev frontend-build frontend-test dev

backend-install:
	$(PYTHON) -m venv $(BACKEND_VENV)
	$(BACKEND_PIP) install -e ./backend[dev]

backend-dev:
	cd backend && ./.venv/bin/fastapi dev --host 0.0.0.0 --port 8000

backend-test:
	cd backend && ./.venv/bin/pytest

backend-lint:
	cd backend && ./.venv/bin/ruff check .

frontend-install:
	npm --prefix frontend install

frontend-dev:
	npm --prefix frontend run dev -- --host 0.0.0.0 --port 8080

frontend-build:
	npm --prefix frontend run build

frontend-test:
	npm --prefix frontend run test

dev:
	docker compose up --build
