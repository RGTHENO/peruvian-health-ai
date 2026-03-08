from collections.abc import Generator
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app.core.config import get_settings


@pytest.fixture
def client(monkeypatch: pytest.MonkeyPatch, tmp_path: Path) -> Generator[TestClient, None, None]:
    database_url = f"sqlite+pysqlite:///{tmp_path / 'test.db'}"
    monkeypatch.setenv("SALUDPE_DATABASE_URL", database_url)
    monkeypatch.setenv("SALUDPE_ENVIRONMENT", "test")
    monkeypatch.setenv("SALUDPE_SECRET_KEY", "test-secret-key-for-ci-at-least-32-chars!!")
    monkeypatch.setenv("SALUDPE_SEED_DEMO_DATA", "true")
    monkeypatch.setenv(
        "SALUDPE_CORS_ORIGINS",
        '["http://localhost:8080"]',
    )
    get_settings.cache_clear()

    from app.main import create_app

    app = create_app()
    with TestClient(app) as test_client:
        yield test_client

    get_settings.cache_clear()
