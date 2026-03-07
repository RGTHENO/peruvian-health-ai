from datetime import date, timedelta


def get_access_token(client, *, email: str, password: str, role: str) -> str:
    response = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password, "role": role},
    )
    assert response.status_code == 200
    return response.json()["access_token"]


def test_health_and_version(client):
    assert client.get("/healthz").json()["status"] == "ok"
    assert client.get("/readyz").json()["status"] == "ready"
    version = client.get("/api/v1/meta/version")
    assert version.status_code == 200
    assert version.json()["app_name"] == "SaludPe API"


def test_directory_filters(client):
    response = client.get("/api/v1/directory/doctors", params={"especialidad": "Cardiología"})
    assert response.status_code == 200
    payload = response.json()
    assert payload["total"] == 1
    assert payload["doctors"][0]["specialty"] == "Cardiología"


def test_doctor_login_and_dashboard(client):
    token = get_access_token(
        client,
        email="medico@saludpe.pe",
        password="SaludPe123!",
        role="doctor",
    )
    response = client.get(
        "/api/v1/doctors/me/dashboard",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["counts"]["total_pacientes"] >= 4
    assert len(payload["upcoming_today"]) >= 1


def test_patient_login_and_history(client):
    token = get_access_token(
        client,
        email="paciente@saludpe.pe",
        password="SaludPe123!",
        role="patient",
    )
    response = client.get(
        "/api/v1/patients/me/history",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    history = response.json()
    assert len(history) >= 2
    assert history[0]["patient_id"] == "p1"


def test_create_consultation_updates_history(client):
    doctor_token = get_access_token(
        client,
        email="medico@saludpe.pe",
        password="SaludPe123!",
        role="doctor",
    )
    create_response = client.post(
        "/api/v1/patients/p1/encounters/consultations",
        headers={"Authorization": f"Bearer {doctor_token}"},
        json={
            "appointment_id": "a7",
            "chief_complaint": "Control cardiológico",
            "diagnosis": "Hipertensión controlada",
            "diagnosis_status": "Activo",
            "prescriptions": [
                {
                    "medication": "Losartán 50mg",
                    "dosage": "1 tableta",
                    "frequency": "1 vez al día",
                    "duration": "30 días",
                }
            ],
            "recommendations": ["Continuar monitoreo semanal"],
            "lab_orders": ["Perfil lipídico"],
            "notes": "Paciente estable.",
        },
    )
    assert create_response.status_code == 200
    assert create_response.json()["diagnosis"] == "Hipertensión controlada"

    history_response = client.get(
        "/api/v1/patients/p1/history",
        headers={"Authorization": f"Bearer {doctor_token}"},
    )
    assert history_response.status_code == 200
    history = history_response.json()
    assert any(
        item["type"] == "consultation" and item["diagnosis"] == "Hipertensión controlada"
        for item in history
    )


def test_patient_booking_requires_auth_and_creates_doctor_notification(client):
    payload = {
        "doctor_id": "1",
        "patient_id": "p1",
        "date": (date.today() + timedelta(days=3)).isoformat(),
        "time": "16:00",
        "duration": 30,
        "type": "telemedicina",
        "reason": "Seguimiento cardiológico",
        "notes": "Paciente con consulta de control",
    }

    unauthorized = client.post("/api/v1/appointments", json=payload)
    assert unauthorized.status_code == 401

    patient_token = get_access_token(
        client,
        email="paciente@saludpe.pe",
        password="SaludPe123!",
        role="patient",
    )
    create_response = client.post(
        "/api/v1/appointments",
        headers={"Authorization": f"Bearer {patient_token}"},
        json=payload,
    )
    assert create_response.status_code == 200
    booking = create_response.json()
    assert booking["status"] == "en-espera"
    assert booking["patient_id"] == "p1"

    doctor_token = get_access_token(
        client,
        email="medico@saludpe.pe",
        password="SaludPe123!",
        role="doctor",
    )
    notifications = client.get(
        "/api/v1/notifications",
        headers={"Authorization": f"Bearer {doctor_token}"},
    )
    assert notifications.status_code == 200
    assert any(item["title"] == "Nueva cita agendada" for item in notifications.json())


def test_appointment_visibility_and_status_permissions(client):
    patient_token = get_access_token(
        client,
        email="paciente@saludpe.pe",
        password="SaludPe123!",
        role="patient",
    )
    doctor_token = get_access_token(
        client,
        email="medico@saludpe.pe",
        password="SaludPe123!",
        role="doctor",
    )

    patient_appointments = client.get(
        "/api/v1/appointments",
        headers={"Authorization": f"Bearer {patient_token}"},
    )
    assert patient_appointments.status_code == 200
    assert all(item["patient_id"] == "p1" for item in patient_appointments.json())

    doctor_appointments = client.get(
        "/api/v1/appointments",
        headers={"Authorization": f"Bearer {doctor_token}"},
    )
    assert doctor_appointments.status_code == 200
    assert len(doctor_appointments.json()) >= len(patient_appointments.json())

    forbidden_status_change = client.patch(
        "/api/v1/appointments/a1",
        headers={"Authorization": f"Bearer {patient_token}"},
        json={"status": "cancelada"},
    )
    assert forbidden_status_change.status_code == 403

    confirmed = client.post(
        "/api/v1/appointments/a3/confirm",
        headers={"Authorization": f"Bearer {doctor_token}"},
    )
    assert confirmed.status_code == 200
    assert confirmed.json()["status"] == "confirmada"


def test_doctor_profile_preferences_and_password_cycle(client):
    doctor_token = get_access_token(
        client,
        email="medico@saludpe.pe",
        password="SaludPe123!",
        role="doctor",
    )

    profile = client.get(
        "/api/v1/doctors/me/profile",
        headers={"Authorization": f"Bearer {doctor_token}"},
    )
    assert profile.status_code == 200
    assert profile.json()["email"] == "medico@saludpe.pe"

    update_profile = client.patch(
        "/api/v1/doctors/me/profile",
        headers={"Authorization": f"Bearer {doctor_token}"},
        json={
            "name": "Dra. María Elena Quispe Test",
            "specialty": "Cardiología",
            "email": "medico.test@saludpe.pe",
            "phone": "+51 900 111 222",
            "bio": "Cardióloga con experiencia clínica, seguimiento preventivo y telemedicina.",
        },
    )
    assert update_profile.status_code == 200
    assert update_profile.json()["phone"] == "+51 900 111 222"

    preferences = client.patch(
        "/api/v1/notifications/preferences",
        headers={"Authorization": f"Bearer {doctor_token}"},
        json={
            "new_appointment": True,
            "reminder": False,
            "cancellation": True,
            "marketing": False,
        },
    )
    assert preferences.status_code == 200
    assert preferences.json()["reminder"] is False

    change_password = client.post(
        "/api/v1/auth/change-password",
        headers={"Authorization": f"Bearer {doctor_token}"},
        json={
            "current_password": "SaludPe123!",
            "new_password": "SaludPe456!",
        },
    )
    assert change_password.status_code == 204

    relogin = client.post(
        "/api/v1/auth/login",
        json={
            "email": "medico.test@saludpe.pe",
            "password": "SaludPe456!",
            "role": "doctor",
        },
    )
    assert relogin.status_code == 200
