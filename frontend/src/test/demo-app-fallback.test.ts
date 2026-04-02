import { afterEach, describe, expect, it } from "vitest";
import {
  createDemoAppointment,
  getDemoDoctorAvailability,
  getDemoDoctorDashboardData,
  getDemoDoctorPatients,
  getDemoNotifications,
  getDemoPatientHistory,
  updateDemoNotificationPreferences,
} from "@/lib/demo-app-fallback";
import { setStoredSession } from "@/lib/auth-session";

afterEach(() => {
  setStoredSession(null);
});

describe("demo app fallback", () => {
  it("builds a doctor dashboard from the local demo data", () => {
    const dashboard = getDemoDoctorDashboardData();

    expect(dashboard.upcomingToday.length).toBeGreaterThan(0);
    expect(dashboard.counts.citas_hoy).toBe(dashboard.upcomingToday.length);
    expect(dashboard.recentPatients.length).toBeGreaterThan(0);
  });

  it("filters doctor patients with the same local catalog", () => {
    const patients = getDemoDoctorPatients("rimac");

    expect(patients.length).toBeGreaterThan(0);
    expect(patients.every((patient) => patient.insurance === "Rímac")).toBe(true);
  });

  it("returns the seeded patient history for the demo patient", () => {
    const encounters = getDemoPatientHistory();

    expect(encounters.length).toBeGreaterThan(0);
    expect(encounters.every((encounter) => encounter.patientId === "p1")).toBe(true);
  });

  it("updates notification preferences in demo mode", () => {
    const nextPreferences = updateDemoNotificationPreferences({
      newAppointment: false,
      reminder: true,
      cancellation: false,
      marketing: true,
    });

    expect(nextPreferences).toEqual({
      newAppointment: false,
      reminder: true,
      cancellation: false,
      marketing: true,
    });
  });

  it("clones demo notifications to keep timestamps usable", () => {
    const notifications = getDemoNotifications();

    expect(notifications.length).toBeGreaterThan(0);
    expect(notifications[0].timestamp).toBeInstanceOf(Date);
  });

  it("creates a demo appointment and removes the booked slot from availability", () => {
    setStoredSession({
      accessToken: "demo-access-token:patient",
      refreshToken: "demo-refresh-token:patient",
      expiresIn: 86_400,
      user: {
        id: "u-patient-1",
        email: "paciente@saludpe.pe",
        full_name: "Juan Pérez Sánchez",
        role: "patient",
        doctor_id: null,
        patient_id: "p1",
      },
    });

    const availabilityBefore = getDemoDoctorAvailability("2");
    expect(availabilityBefore.length).toBeGreaterThan(0);

    const { date, slots } = availabilityBefore[0];
    expect(slots.length).toBeGreaterThan(0);

    const appointment = createDemoAppointment({
      doctorId: "2",
      patientId: "p1",
      date,
      time: slots[0],
      type: "telemedicina",
      reason: "Consulta general",
    });

    expect(appointment.status).toBe("en-espera");
    expect(appointment.delivery?.access.type).toBe("telemedicina");

    const availabilityAfter = getDemoDoctorAvailability("2");
    const sameDate = availabilityAfter.find((slotGroup) => slotGroup.date === date);

    expect(sameDate?.slots.includes(slots[0])).toBe(false);
  });
});
