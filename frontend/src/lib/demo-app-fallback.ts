import {
  appointments as seededAppointments,
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
const DEFAULT_DEMO_AVAILABILITY_SLOTS = ["09:00", "10:00", "11:00", "16:00"] as const;

type DemoAppointmentRecord = Appointment & {
  doctorId: string;
  doctorName: string;
};

type DemoCreateAppointmentInput = {
  doctorId: string;
  patientId: string;
  date: string;
  time: string;
  duration?: number;
  type: Appointment["type"];
  reason: string;
  notes?: string;
};

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

const cloneAppointment = <T extends Appointment>(appointment: T): T => ({
  ...appointment,
  delivery: appointment.delivery
    ? {
        email: { ...appointment.delivery.email },
        whatsapp: { ...appointment.delivery.whatsapp },
        telegram: { ...appointment.delivery.telegram },
        access: { ...appointment.delivery.access },
      }
    : undefined,
}) as T;

const cloneEncounter = (encounter: Encounter): Encounter =>
  JSON.parse(JSON.stringify(encounter)) as Encounter;

const normalizeSearchText = (value: string) =>
  value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

const compareDateTime = (left: Appointment, right: Appointment) =>
  `${left.date}T${left.time}`.localeCompare(`${right.date}T${right.time}`);

const formatDateKey = (date: Date) =>
  [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");

const pickActiveAgendaDate = () => {
  const uniqueDates = [
    ...new Set(
      demoAppointmentStore
        .filter((appointment) => appointment.doctorId === DEMO_DOCTOR_ID)
        .map((appointment) => appointment.date),
    ),
  ].sort();

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

const DEMO_PRIMARY_DOCTOR = getDoctorById(DEMO_DOCTOR_ID);

let demoAppointmentStore: DemoAppointmentRecord[] = seededAppointments.map((appointment) => ({
  ...cloneAppointment(appointment),
  doctorId: DEMO_DOCTOR_ID,
  doctorName: DEMO_PRIMARY_DOCTOR.name,
}));

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
  name: DEMO_PRIMARY_DOCTOR.name,
  specialty: DEMO_PRIMARY_DOCTOR.specialty,
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

export const getDemoDoctorAvailability = (doctorId: string) => {
  const doctor = getDoctorById(doctorId);
  if (!doctor.available) {
    return [];
  }

  const today = new Date();
  today.setHours(12, 0, 0, 0);

  return Array.from({ length: 5 }, (_, index) => {
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + index + 1);
    const dateKey = formatDateKey(nextDate);
    const reservedSlots = demoAppointmentStore
      .filter(
        (appointment) =>
          appointment.doctorId === doctorId &&
          appointment.date === dateKey &&
          appointment.status !== "cancelada",
      )
      .map((appointment) => appointment.time);

    return {
      date: dateKey,
      slots: DEFAULT_DEMO_AVAILABILITY_SLOTS.filter((slot) => !reservedSlots.includes(slot)),
    };
  }).filter((slotGroup) => slotGroup.slots.length > 0);
};

export const getDemoDoctorDashboardData = (): DoctorDashboardData => {
  const activeDate = pickActiveAgendaDate();
  const doctorAppointments = demoAppointmentStore.filter(
    (appointment) => appointment.doctorId === DEMO_DOCTOR_ID,
  );
  const upcomingToday = doctorAppointments
    .filter((appointment) => appointment.date === activeDate)
    .sort(compareDateTime)
    .map(cloneAppointment);

  const recentPatientIds = [
    ...new Set(
      [...doctorAppointments]
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
  demoAppointmentStore
    .filter(
      (appointment) =>
        appointment.doctorId === DEMO_DOCTOR_ID && (!date || appointment.date === date),
    )
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
    upcomingAppointments: demoAppointmentStore
      .filter(
        (appointment) =>
          appointment.patientId === patientId && appointment.doctorId === DEMO_DOCTOR_ID,
      )
      .sort(compareDateTime)
      .map(cloneAppointment),
    encounters: mockEncounters
      .filter((encounter) => encounter.patientId === patientId)
      .map(cloneEncounter),
  };
};

export const createDemoAppointment = (payload: DemoCreateAppointmentInput): Appointment => {
  const currentUser = getCurrentDemoUser();
  if (!currentUser || currentUser.role !== "patient" || currentUser.patient_id !== payload.patientId) {
    throw new Error("Debes iniciar sesión como paciente para reservar una cita.");
  }

  const patient = getPatientById(payload.patientId);
  if (!patient) {
    throw new Error("Paciente demo no encontrado.");
  }

  const doctor = getDoctorById(payload.doctorId);
  const availableSlot = getDemoDoctorAvailability(payload.doctorId).find(
    (slotGroup) => slotGroup.date === payload.date,
  );

  if (!availableSlot || !availableSlot.slots.includes(payload.time)) {
    throw new Error("Ese horario ya no está disponible. Elige otro para continuar.");
  }

  const patientSummary = getDemoPatientSelfProfile();
  const appointmentId = `demo-${Date.now()}`;
  const isTelemedicine = payload.type === "telemedicina";
  const whatsappEnabled = Boolean(patient.phone?.trim());
  const telegramEnabled = Boolean(patient.telegramHandle?.trim());

  const appointment: DemoAppointmentRecord = {
    id: appointmentId,
    patientId: payload.patientId,
    patientName: patientSummary.name,
    doctorId: doctor.id,
    doctorName: doctor.name,
    date: payload.date,
    time: payload.time,
    duration: payload.duration ?? 30,
    type: payload.type,
    status: "en-espera",
    reason: payload.reason,
    notes: payload.notes,
    delivery: {
      email: {
        enabled: true,
        destination: patientSummary.email,
        status: "scheduled",
        summary:
          "Enviaremos la confirmación, el detalle de la cita y el acceso correspondiente por email.",
      },
      whatsapp: {
        enabled: whatsappEnabled,
        destination: whatsappEnabled ? patient.phone : undefined,
        status: whatsappEnabled ? "scheduled" : "unavailable",
        summary: whatsappEnabled
          ? "Enviaremos resumen y recordatorios por WhatsApp al número registrado."
          : "Necesitamos un número celular válido para enviar WhatsApp.",
      },
      telegram: {
        enabled: telegramEnabled,
        destination: telegramEnabled ? patient.telegramHandle : undefined,
        status: telegramEnabled ? "scheduled" : "unavailable",
        summary: telegramEnabled
          ? "Telegram recibirá el mismo resumen y recordatorios del enlace."
          : "Telegram solo se habilita cuando el paciente vincula su usuario.",
      },
      access: {
        type: payload.type,
        instructions: isTelemedicine
          ? "Recibirás el enlace de ingreso y recordatorios por los canales habilitados."
          : `Preséntate en ${doctor.location} 10 minutos antes de la cita.`,
        joinUrl: isTelemedicine
          ? `https://peruhealthai.vercel.app/teleconsulta?appointment=${appointmentId}`
          : undefined,
        location: isTelemedicine ? undefined : doctor.location,
      },
    },
  };

  demoAppointmentStore = [...demoAppointmentStore, appointment].sort(compareDateTime);

  if (doctor.id === DEMO_DOCTOR_ID) {
    demoNotifications = [
      {
        id: `demo-booking-${appointmentId}`,
        type: "appointment",
        title: "Nueva cita agendada",
        message: `${patientSummary.name} agendó una consulta para el ${payload.date} a las ${payload.time}.`,
        timestamp: new Date(),
        read: false,
        link: "/doctor/portal/agenda",
      },
      ...demoNotifications,
    ];
  }

  return cloneAppointment(appointment);
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
