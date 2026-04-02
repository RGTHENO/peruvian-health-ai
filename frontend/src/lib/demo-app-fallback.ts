import {
  appointments as demoAppointments,
  patients as demoPatients,
  type Appointment,
  type Patient,
} from "@/data/appointments";
import type { Doctor } from "@/data/doctors";
import { doctors as demoDoctors } from "@/data/doctors";
import { mockEncounters, type Encounter } from "@/data/encounters";
import {
  mockNotifications,
  type AppNotification,
  type NotificationPreferences,
} from "@/data/notifications";
import {
  getStoredSession,
  updateStoredUser,
  type AuthSession,
} from "@/lib/auth-session";
import { isHostedFallbackEnabled } from "@/lib/hosted-fallback";
import type {
  AuthUser,
  DoctorDashboardData,
  DoctorPatientRecordData,
  DoctorSettingsProfile,
} from "@/lib/api";

const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  newAppointment: true,
  reminder: true,
  cancellation: true,
  marketing: false,
};

const DEMO_PASSWORDS = {
  patient: "SaludPe123!",
  doctor: "SaludPe123!",
} as const;

const DEMO_PATIENT_ID = "p1";
const DEMO_DOCTOR_ID = "1";
const DEMO_PATIENT_EMAIL = "paciente@saludpe.pe";
const DEFAULT_DEMO_DOCTOR_EMAIL = "medico@saludpe.pe";
const DEMO_TOKEN_PREFIX = "demo-access-token:";
const DEMO_REFRESH_PREFIX = "demo-refresh-token:";

const dateLabelFormatter = new Intl.DateTimeFormat("es-PE", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

const cloneNotification = (notification: AppNotification): AppNotification => ({
  ...notification,
  timestamp: new Date(notification.timestamp),
});

const clonePatient = (patient: Patient): Patient => ({
  ...patient,
  conditions: [...patient.conditions],
  allergies: patient.allergies ? [...patient.allergies] : [],
  emergencyContact: patient.emergencyContact ? { ...patient.emergencyContact } : undefined,
});

const cloneAppointment = (appointment: Appointment): Appointment => ({
  ...appointment,
  delivery: appointment.delivery
    ? {
        email: { ...appointment.delivery.email },
        whatsapp: { ...appointment.delivery.whatsapp },
        telegram: { ...appointment.delivery.telegram },
        access: { ...appointment.delivery.access },
      }
    : undefined,
});

const cloneEncounter = (encounter: Encounter): Encounter =>
  JSON.parse(JSON.stringify(encounter)) as Encounter;

const normalizeSearchText = (value: string) =>
  value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

const compareDateTime = (left: Appointment, right: Appointment) =>
  `${left.date}T${left.time}`.localeCompare(`${right.date}T${right.time}`);

const pickActiveAgendaDate = () => {
  const uniqueDates = [...new Set(demoAppointments.map((appointment) => appointment.date))].sort();
  if (!uniqueDates.length) {
    return new Date().toISOString().slice(0, 10);
  }

  const today = new Date().toISOString().slice(0, 10);
  return uniqueDates.find((date) => date >= today) ?? uniqueDates[uniqueDates.length - 1];
};

const getPatientById = (patientId: string) =>
  demoPatients.find((patient) => patient.id === patientId);

const getDoctorById = (doctorId: string): Doctor => {
  const doctor = demoDoctors.find((item) => item.id === doctorId);
  if (!doctor) {
    throw new Error(`Doctor demo ${doctorId} no encontrado.`);
  }

  return doctor;
};

const buildPatientUser = (): AuthUser => ({
  id: "u-patient-1",
  email: DEMO_PATIENT_EMAIL,
  full_name: getPatientById(DEMO_PATIENT_ID)?.name ?? "Paciente Demo",
  role: "patient",
  doctor_id: null,
  patient_id: DEMO_PATIENT_ID,
});

let demoDoctorProfile: DoctorSettingsProfile = {
  id: DEMO_DOCTOR_ID,
  name: getDoctorById(DEMO_DOCTOR_ID).name,
  specialty: getDoctorById(DEMO_DOCTOR_ID).specialty,
  email: DEFAULT_DEMO_DOCTOR_EMAIL,
  phone: "+51 999 888 777",
  bio: "Cardióloga con 15 años de experiencia en el Instituto Nacional Cardiovascular. Especialista en ecocardiografía y prevención cardiovascular.",
};

let demoNotificationPreferences = { ...DEFAULT_NOTIFICATION_PREFERENCES };
let demoNotifications = mockNotifications.map(cloneNotification);
let demoPasswords = { ...DEMO_PASSWORDS };

const buildDoctorUser = (): AuthUser => ({
  id: "u-doctor-1",
  email: demoDoctorProfile.email,
  full_name: demoDoctorProfile.name,
  role: "doctor",
  doctor_id: DEMO_DOCTOR_ID,
  patient_id: null,
});

const buildDemoUser = (role: "patient" | "doctor") =>
  role === "doctor" ? buildDoctorUser() : buildPatientUser();

const getCurrentDemoUser = () => {
  const session = getStoredSession();
  if (!session || !isDemoSession(session)) {
    return null;
  }

  return session.user;
};

export const isDemoSession = (session: AuthSession | null | undefined) =>
  Boolean(session?.accessToken?.startsWith(DEMO_TOKEN_PREFIX));

export const isHostedDemoSessionActive = () =>
  isHostedFallbackEnabled() && isDemoSession(getStoredSession());

export const getDemoSessionForCredentials = (payload: {
  email: string;
  password: string;
  role: "patient" | "doctor";
}): AuthSession | null => {
  if (!isHostedFallbackEnabled()) {
    return null;
  }

  const expectedUser = buildDemoUser(payload.role);
  if (
    payload.email.trim().toLowerCase() !== expectedUser.email.toLowerCase() ||
    payload.password !== demoPasswords[payload.role]
  ) {
    return null;
  }

  return {
    accessToken: `${DEMO_TOKEN_PREFIX}${payload.role}`,
    refreshToken: `${DEMO_REFRESH_PREFIX}${payload.role}`,
    expiresIn: 60 * 60 * 24,
    user: expectedUser,
  };
};

export const getDemoCurrentUser = () => getCurrentDemoUser();

export const getDemoDoctorProfile = (): DoctorSettingsProfile => ({
  ...demoDoctorProfile,
});

export const updateDemoDoctorProfile = (payload: DoctorSettingsProfile): DoctorSettingsProfile => {
  demoDoctorProfile = { ...payload };

  const session = getStoredSession();
  if (session && isDemoSession(session) && session.user.role === "doctor") {
    updateStoredUser(buildDoctorUser());
  }

  return getDemoDoctorProfile();
};

export const changeDemoPassword = (payload: { currentPassword: string; newPassword: string }) => {
  const session = getStoredSession();
  if (!session || !isDemoSession(session)) {
    return {
      ok: false,
      message: "No hay una sesión demo activa.",
    };
  }

  const role = session.user.role;
  if (role !== "patient" && role !== "doctor") {
    return {
      ok: false,
      message: "La cuenta demo no permite esta operación.",
    };
  }

  if (demoPasswords[role] !== payload.currentPassword) {
    return {
      ok: false,
      message: "La contraseña actual es incorrecta.",
    };
  }

  demoPasswords = {
    ...demoPasswords,
    [role]: payload.newPassword,
  };

  return { ok: true };
};

export const getDemoPatientSelfProfile = (): Patient => {
  const basePatient = getPatientById(DEMO_PATIENT_ID);
  if (!basePatient) {
    throw new Error("Paciente demo no encontrado.");
  }

  const currentUser = getCurrentDemoUser();

  return {
    ...clonePatient(basePatient),
    name: currentUser?.role === "patient" ? currentUser.full_name : basePatient.name,
    email: currentUser?.role === "patient" ? currentUser.email : DEMO_PATIENT_EMAIL,
  };
};

export const getDemoPatientHistory = (): Encounter[] =>
  mockEncounters
    .filter((encounter) => encounter.patientId === DEMO_PATIENT_ID)
    .map(cloneEncounter);

export const getDemoDoctorDashboardData = (): DoctorDashboardData => {
  const activeDate = pickActiveAgendaDate();
  const upcomingToday = demoAppointments
    .filter((appointment) => appointment.date === activeDate)
    .sort(compareDateTime)
    .map(cloneAppointment);

  const recentPatientIds = [
    ...new Set(
      [...demoAppointments]
        .sort((left, right) => compareDateTime(right, left))
        .map((appointment) => appointment.patientId),
    ),
  ];

  return {
    activeDate,
    activeDateLabel: dateLabelFormatter.format(new Date(`${activeDate}T12:00:00`)),
    counts: {
      citas_hoy: upcomingToday.length,
      confirmadas: upcomingToday.filter((appointment) => appointment.status === "confirmada").length,
      en_espera: upcomingToday.filter((appointment) => appointment.status === "en-espera").length,
      canceladas: upcomingToday.filter((appointment) => appointment.status === "cancelada").length,
      total_pacientes: demoPatients.length,
    },
    upcomingToday,
    recentPatients: recentPatientIds
      .map((patientId) => getPatientById(patientId))
      .filter((patient): patient is Patient => Boolean(patient))
      .slice(0, 4)
      .map(clonePatient),
  };
};

export const getDemoDoctorAgenda = (date?: string): Appointment[] =>
  demoAppointments
    .filter((appointment) => !date || appointment.date === date)
    .sort(compareDateTime)
    .map(cloneAppointment);

export const getDemoDoctorPatients = (search?: string): Patient[] => {
  const normalizedQuery = search?.trim() ? normalizeSearchText(search.trim()) : "";

  return demoPatients
    .filter((patient) => {
      if (!normalizedQuery) {
        return true;
      }

      return (
        normalizeSearchText(patient.name).includes(normalizedQuery) ||
        normalizeSearchText(patient.insurance).includes(normalizedQuery) ||
        patient.conditions.some((condition) =>
          normalizeSearchText(condition).includes(normalizedQuery),
        )
      );
    })
    .map(clonePatient);
};

export const getDemoDoctorPatientRecord = (patientId: string): DoctorPatientRecordData => {
  const patient = getPatientById(patientId);
  if (!patient) {
    throw new Error("Paciente demo no encontrado.");
  }

  return {
    patient: clonePatient(patient),
    upcomingAppointments: demoAppointments
      .filter((appointment) => appointment.patientId === patientId)
      .sort(compareDateTime)
      .map(cloneAppointment),
    encounters: mockEncounters
      .filter((encounter) => encounter.patientId === patientId)
      .map(cloneEncounter),
  };
};

export const getDemoNotifications = (): AppNotification[] =>
  demoNotifications.map(cloneNotification);

export const getDemoNotificationPreferences = (): NotificationPreferences => ({
  ...demoNotificationPreferences,
});

export const updateDemoNotificationPreferences = (
  preferences: NotificationPreferences,
): NotificationPreferences => {
  demoNotificationPreferences = { ...preferences };
  return getDemoNotificationPreferences();
};

export const markDemoNotificationAsRead = (notificationId: string): AppNotification => {
  demoNotifications = demoNotifications.map((notification) =>
    notification.id === notificationId ? { ...notification, read: true } : notification,
  );

  const nextNotification = demoNotifications.find((notification) => notification.id === notificationId);
  if (!nextNotification) {
    throw new Error("Notificación demo no encontrada.");
  }

  return cloneNotification(nextNotification);
};

export const markAllDemoNotificationsAsRead = (): AppNotification[] => {
  demoNotifications = demoNotifications.map((notification) => ({ ...notification, read: true }));
  return getDemoNotifications();
};

export const dismissDemoNotification = (notificationId: string) => {
  demoNotifications = demoNotifications.filter((notification) => notification.id !== notificationId);
};
