import { describe, expect, it } from "vitest";
import {
  getDemoDoctorDashboardData,
  getDemoDoctorPatients,
  getDemoNotifications,
  getDemoPatientHistory,
  updateDemoNotificationPreferences,
} from "@/lib/demo-app-fallback";

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
});
