import { useSyncExternalStore } from "react";
import { appointments, type Appointment } from "@/data/appointments";

const APPOINTMENT_STATUS_STORAGE_KEY = "saludpe.appointment-status-overrides.v1";
const APPOINTMENT_EVENT = "saludpe:appointments-updated";

type AppointmentStatusOverrides = Partial<Record<Appointment["id"], Appointment["status"]>>;

const canUseStorage = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const formatDateKey = (date: Date) =>
  [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");

const readOverrides = (): AppointmentStatusOverrides => {
  if (!canUseStorage()) return {};

  try {
    const stored = window.localStorage.getItem(APPOINTMENT_STATUS_STORAGE_KEY);
    if (!stored) return {};

    const parsed = JSON.parse(stored);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

const notifyAppointmentSubscribers = () => {
  if (!canUseStorage()) return;
  window.dispatchEvent(new Event(APPOINTMENT_EVENT));
};

const subscribeToAppointments = (callback: () => void) => {
  if (!canUseStorage()) return () => {};

  const handleStorage = (event: StorageEvent) => {
    if (!event.key || event.key === APPOINTMENT_STATUS_STORAGE_KEY) {
      callback();
    }
  };

  window.addEventListener(APPOINTMENT_EVENT, callback);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(APPOINTMENT_EVENT, callback);
    window.removeEventListener("storage", handleStorage);
  };
};

export const getAppointments = (): Appointment[] => {
  const overrides = readOverrides();

  return appointments.map((appointment) => {
    const nextStatus = overrides[appointment.id];
    return nextStatus ? { ...appointment, status: nextStatus } : appointment;
  });
};

export const setAppointmentStatus = (appointmentId: string, status: Appointment["status"]) => {
  if (!canUseStorage()) return;

  const nextOverrides = {
    ...readOverrides(),
    [appointmentId]: status,
  };

  window.localStorage.setItem(APPOINTMENT_STATUS_STORAGE_KEY, JSON.stringify(nextOverrides));
  notifyAppointmentSubscribers();
};

export const useAppointments = () =>
  useSyncExternalStore(subscribeToAppointments, getAppointments, () => appointments);

export const getPreferredAppointmentDate = (appointmentList: Appointment[], referenceDate = new Date()) => {
  const uniqueDates = [...new Set(appointmentList.map((appointment) => appointment.date))].sort();

  if (uniqueDates.length === 0) {
    return formatDateKey(referenceDate);
  }

  const referenceKey = formatDateKey(referenceDate);
  return uniqueDates.find((date) => date >= referenceKey) ?? uniqueDates[uniqueDates.length - 1];
};

export const toAppointmentDate = (date: string) => new Date(`${date}T12:00:00`);
