import type { Doctor } from "@/data/doctors";
import type { AppNotification, NotificationPreferences } from "@/data/notifications";
import type { Appointment, AppointmentDeliveryPlan, Patient } from "@/data/appointments";
import type {
  ConsultationEncounter,
  Encounter,
  LabEncounter,
  Prescription,
  SurgeryEncounter,
} from "@/data/encounters";
import { ApiError, apiRequest } from "@/lib/api-client";
import {
  changeDemoPassword,
  dismissDemoNotification,
  getDemoCurrentUser,
  getDemoDoctorAgenda,
  getDemoDoctorDashboardData,
  getDemoDoctorPatientRecord,
  getDemoDoctorPatients,
  getDemoDoctorProfile,
  getDemoNotificationPreferences,
  getDemoNotifications,
  getDemoPatientHistory,
  getDemoPatientSelfProfile,
  getDemoSessionForCredentials,
  isHostedDemoSessionActive,
  markAllDemoNotificationsAsRead,
  markDemoNotificationAsRead,
  updateDemoDoctorProfile,
  updateDemoNotificationPreferences,
} from "@/lib/demo-app-fallback";
import {
  getFallbackDirectoryResponse,
  getFallbackDoctorDetail,
  isPublicDirectoryFallbackEnabled,
  type PublicDirectorySearchParams,
} from "@/lib/public-directory-fallback";

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  role: "patient" | "doctor" | "admin";
  doctor_id: string | null;
  patient_id: string | null;
}

interface TokenPairResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: AuthUser;
}

interface DirectoryResponse {
  total: number;
  doctors: Doctor[];
}

interface AppointmentResponse {
  id: string;
  patient_id: string;
  patient_name: string;
  doctor_id: string;
  doctor_name: string;
  date: string;
  time: string;
  duration: number;
  type: Appointment["type"];
  status: Appointment["status"];
  reason: string;
  notes?: string | null;
  delivery?: {
    email: {
      enabled: boolean;
      destination?: string | null;
      status: "scheduled" | "unavailable";
      summary: string;
    };
    whatsapp: {
      enabled: boolean;
      destination?: string | null;
      status: "scheduled" | "unavailable";
      summary: string;
    };
    telegram: {
      enabled: boolean;
      destination?: string | null;
      status: "scheduled" | "unavailable";
      summary: string;
    };
    access: {
      type: Appointment["type"];
      instructions: string;
      join_url?: string | null;
      location?: string | null;
    };
  } | null;
}

interface EmergencyContactResponse {
  name: string;
  phone: string;
  relationship: string;
}

interface PatientResponse {
  id: string;
  name: string;
  age: number;
  gender: Patient["gender"];
  phone: string;
  email: string;
  telegram_handle?: string | null;
  insurance: string;
  last_visit?: string | null;
  conditions: string[];
  avatar: string;
  blood_type?: string | null;
  allergies?: string[];
  emergency_contact?: EmergencyContactResponse | null;
}

interface ConsultationEncounterResponse {
  type: "consultation";
  patient_id: string;
  date: string;
  doctor: string;
  specialty: string;
  diagnosis: string;
  diagnosis_status: "Activo" | "Resuelto";
  prescriptions: Prescription[];
  recommendations: string[];
  lab_orders: string[];
  notes?: string | null;
}

interface LabResultResponse {
  test: string;
  result: string;
  reference_range: string;
  unit: string;
  status: "Normal" | "Anormal";
}

interface LabEncounterResponse {
  type: "lab";
  patient_id: string;
  date: string;
  lab: string;
  ordered_by: string;
  lab_results: LabResultResponse[];
}

interface SurgeryEncounterResponse {
  type: "surgery";
  patient_id: string;
  date: string;
  surgeon: string;
  specialty: string;
  hospital: string;
  procedure: string;
  procedure_type: "Electiva" | "Emergencia" | "Ambulatoria";
  anesthesia_type: string;
  duration: string;
  pre_op_diagnosis: string;
  post_op_diagnosis: string;
  findings: string[];
  complications: string[];
  post_op_instructions: string[];
  prescriptions: Prescription[];
  follow_up: string;
  notes?: string | null;
}

type EncounterResponse =
  | ConsultationEncounterResponse
  | LabEncounterResponse
  | SurgeryEncounterResponse;

interface DoctorDashboardResponse {
  active_date: string;
  active_date_label: string;
  counts: {
    citas_hoy: number;
    confirmadas: number;
    en_espera: number;
    canceladas: number;
    total_pacientes: number;
  };
  upcoming_today: AppointmentResponse[];
  recent_patients: PatientResponse[];
}

interface DoctorPatientRecordResponse {
  patient: PatientResponse;
  upcoming_appointments: AppointmentResponse[];
  encounters: EncounterResponse[];
}

interface DoctorProfileResponse {
  id: string;
  name: string;
  specialty: string;
  email: string;
  phone: string;
  bio: string;
}

interface NotificationResponse {
  id: string;
  type: AppNotification["type"];
  title: string;
  message: string;
  link?: string | null;
  read: boolean;
  created_at: string;
}

interface LoginInput {
  email: string;
  password: string;
  role: "patient" | "doctor";
}

interface RegisterPatientInput {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  age: number;
  gender: Patient["gender"];
  insurance: string;
  telegramHandle?: string;
}

type DirectorySearchParams = PublicDirectorySearchParams;

interface CreateAppointmentInput {
  doctorId: string;
  patientId: string;
  date: string;
  time: string;
  duration?: number;
  type: Appointment["type"];
  reason: string;
  notes?: string;
}

interface ConsultationInput {
  appointmentId?: string;
  chiefComplaint: string;
  symptoms: string;
  physicalExam: string;
  diagnosis: string;
  diagnosisStatus: "Activo" | "Resuelto";
  prescriptions: Prescription[];
  recommendations: string[];
  labOrders: string[];
  surgeryReferral?: {
    procedure: string;
    urgency: "Electiva" | "Urgente";
    notes: string;
  } | null;
  notes: string;
}

export interface DoctorDashboardData {
  activeDate: string;
  activeDateLabel: string;
  counts: DoctorDashboardResponse["counts"];
  upcomingToday: Appointment[];
  recentPatients: Patient[];
}

export interface DoctorPatientRecordData {
  patient: Patient;
  upcomingAppointments: Appointment[];
  encounters: Encounter[];
}

export interface DoctorSettingsProfile {
  id: string;
  name: string;
  specialty: string;
  email: string;
  phone: string;
  bio: string;
}

const encounterDateFormatter = new Intl.DateTimeFormat("es-PE", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const formatEncounterDate = (value: string) =>
  encounterDateFormatter.format(new Date(`${value}T12:00:00`)).replace(/\./g, "");

const mapAppointment = (appointment: AppointmentResponse): Appointment => ({
  id: appointment.id,
  patientId: appointment.patient_id,
  patientName: appointment.patient_name,
  doctorId: appointment.doctor_id,
  doctorName: appointment.doctor_name,
  date: appointment.date,
  time: appointment.time,
  duration: appointment.duration,
  type: appointment.type,
  status: appointment.status,
  reason: appointment.reason,
  notes: appointment.notes ?? undefined,
  delivery: appointment.delivery
    ? ({
        email: {
          enabled: appointment.delivery.email.enabled,
          destination: appointment.delivery.email.destination ?? undefined,
          status: appointment.delivery.email.status,
          summary: appointment.delivery.email.summary,
        },
        whatsapp: {
          enabled: appointment.delivery.whatsapp.enabled,
          destination: appointment.delivery.whatsapp.destination ?? undefined,
          status: appointment.delivery.whatsapp.status,
          summary: appointment.delivery.whatsapp.summary,
        },
        telegram: {
          enabled: appointment.delivery.telegram.enabled,
          destination: appointment.delivery.telegram.destination ?? undefined,
          status: appointment.delivery.telegram.status,
          summary: appointment.delivery.telegram.summary,
        },
        access: {
          type: appointment.delivery.access.type,
          instructions: appointment.delivery.access.instructions,
          joinUrl: appointment.delivery.access.join_url ?? undefined,
          location: appointment.delivery.access.location ?? undefined,
        },
      } satisfies AppointmentDeliveryPlan)
    : undefined,
});

const mapPatient = (patient: PatientResponse): Patient => ({
  id: patient.id,
  name: patient.name,
  age: patient.age,
  gender: patient.gender,
  phone: patient.phone,
  email: patient.email,
  telegramHandle: patient.telegram_handle ?? undefined,
  insurance: patient.insurance,
  lastVisit: patient.last_visit ?? "",
  conditions: patient.conditions,
  avatar: patient.avatar,
  bloodType: patient.blood_type ?? undefined,
  allergies: patient.allergies ?? [],
  emergencyContact: patient.emergency_contact
    ? {
        name: patient.emergency_contact.name,
        phone: patient.emergency_contact.phone,
        relationship: patient.emergency_contact.relationship,
      }
    : undefined,
});

const mapEncounter = (encounter: EncounterResponse): Encounter => {
  if (encounter.type === "consultation") {
    const item: ConsultationEncounter = {
      type: "consultation",
      patientId: encounter.patient_id,
      date: formatEncounterDate(encounter.date),
      doctor: encounter.doctor,
      specialty: encounter.specialty,
      diagnosis: encounter.diagnosis,
      diagnosisStatus: encounter.diagnosis_status,
      prescriptions: encounter.prescriptions,
      recommendations: encounter.recommendations,
      labOrders: encounter.lab_orders,
      notes: encounter.notes ?? undefined,
    };
    return item;
  }

  if (encounter.type === "lab") {
    const item: LabEncounter = {
      type: "lab",
      patientId: encounter.patient_id,
      date: formatEncounterDate(encounter.date),
      lab: encounter.lab,
      orderedBy: encounter.ordered_by,
      labResults: encounter.lab_results.map((result) => ({
        test: result.test,
        result: result.result,
        referenceRange: result.reference_range,
        unit: result.unit,
        status: result.status,
      })),
    };
    return item;
  }

  const item: SurgeryEncounter = {
    type: "surgery",
    patientId: encounter.patient_id,
    date: formatEncounterDate(encounter.date),
    surgeon: encounter.surgeon,
    specialty: encounter.specialty,
    hospital: encounter.hospital,
    procedure: encounter.procedure,
    procedureType: encounter.procedure_type,
    anesthesiaType: encounter.anesthesia_type,
    duration: encounter.duration,
    preOpDiagnosis: encounter.pre_op_diagnosis,
    postOpDiagnosis: encounter.post_op_diagnosis,
    findings: encounter.findings,
    complications: encounter.complications,
    postOpInstructions: encounter.post_op_instructions,
    prescriptions: encounter.prescriptions,
    followUp: encounter.follow_up,
    notes: encounter.notes ?? undefined,
  };

  return item;
};

const mapNotification = (notification: NotificationResponse): AppNotification => ({
  id: notification.id,
  type: notification.type,
  title: notification.title,
  message: notification.message,
  link: notification.link ?? undefined,
  read: notification.read,
  timestamp: new Date(notification.created_at),
});

export const login = async (payload: LoginInput) => {
  const demoSession = getDemoSessionForCredentials(payload);
  if (demoSession) {
    return demoSession;
  }

  const response = await apiRequest<TokenPairResponse>("/auth/login", {
    method: "POST",
    auth: false,
    body: payload,
  });

  return {
    accessToken: response.access_token,
    refreshToken: response.refresh_token,
    expiresIn: response.expires_in,
    user: response.user,
  };
};

export const registerPatient = async (payload: RegisterPatientInput) => {
  const response = await apiRequest<TokenPairResponse>("/auth/register/patient", {
    method: "POST",
    auth: false,
    body: {
      full_name: payload.fullName,
      email: payload.email,
      password: payload.password,
      phone: payload.phone,
      age: payload.age,
      gender: payload.gender,
      insurance: payload.insurance,
      telegram_handle: payload.telegramHandle,
    },
  });

  return {
    accessToken: response.access_token,
    refreshToken: response.refresh_token,
    expiresIn: response.expires_in,
    user: response.user,
  };
};

export const logout = async (refreshToken: string) => {
  if (isHostedDemoSessionActive()) {
    return;
  }

  return apiRequest<void>("/auth/logout", {
    method: "POST",
    body: { refresh_token: refreshToken },
  });
};

export const fetchCurrentUser = async () => {
  if (isHostedDemoSessionActive()) {
    const demoUser = getDemoCurrentUser();
    if (demoUser) {
      return demoUser;
    }
  }

  return apiRequest<AuthUser>("/auth/me");
};

export const changePassword = (payload: {
  currentPassword: string;
  newPassword: string;
}) => {
  if (isHostedDemoSessionActive()) {
    const result = changeDemoPassword(payload);
    if (!result.ok) {
      throw new ApiError(result.message, 400, { detail: result.message });
    }

    return Promise.resolve();
  }

  return apiRequest<void>("/auth/change-password", {
    method: "POST",
    body: {
      current_password: payload.currentPassword,
      new_password: payload.newPassword,
    },
  });
};

export const fetchDirectoryDoctors = async (params: DirectorySearchParams) => {
  if (isPublicDirectoryFallbackEnabled()) {
    return getFallbackDirectoryResponse(params);
  }

  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) searchParams.set(key, value);
  });

  try {
    return await apiRequest<DirectoryResponse>(
      `/directory/doctors${searchParams.toString() ? `?${searchParams.toString()}` : ""}`,
      { auth: false },
    );
  } catch (error) {
    if (!isPublicDirectoryFallbackEnabled()) {
      throw error;
    }

    return getFallbackDirectoryResponse(params);
  }
};

export const fetchDoctorDetail = async (doctorId: string) => {
  if (isPublicDirectoryFallbackEnabled()) {
    const fallbackDoctor = getFallbackDoctorDetail(doctorId);
    if (!fallbackDoctor) {
      throw new ApiError("Doctor no encontrado.", 404, { detail: "Doctor no encontrado." });
    }

    return fallbackDoctor;
  }

  try {
    return await apiRequest<Doctor>(`/doctors/${doctorId}`, { auth: false });
  } catch (error) {
    if (!isPublicDirectoryFallbackEnabled()) {
      throw error;
    }

    const fallbackDoctor = getFallbackDoctorDetail(doctorId);
    if (!fallbackDoctor) {
      throw error;
    }

    return fallbackDoctor;
  }
};

export const fetchDoctorAvailability = async (doctorId: string) => {
  if (isPublicDirectoryFallbackEnabled()) {
    const fallbackDoctor = getFallbackDoctorDetail(doctorId);
    if (!fallbackDoctor) {
      throw new ApiError("Doctor no encontrado.", 404, { detail: "Doctor no encontrado." });
    }

    return [];
  }

  try {
    return await apiRequest<Array<{ date: string; slots: string[] }>>(
      `/doctors/${doctorId}/availability`,
      {
        auth: false,
      },
    );
  } catch (error) {
    if (!isPublicDirectoryFallbackEnabled()) {
      throw error;
    }

    const fallbackDoctor = getFallbackDoctorDetail(doctorId);
    if (!fallbackDoctor) {
      throw error;
    }

    return [];
  }
};

export const createAppointment = async (payload: CreateAppointmentInput) => {
  const response = await apiRequest<AppointmentResponse>("/appointments", {
    method: "POST",
    body: {
      doctor_id: payload.doctorId,
      patient_id: payload.patientId,
      date: payload.date,
      time: payload.time,
      duration: payload.duration ?? 30,
      type: payload.type,
      reason: payload.reason,
      notes: payload.notes,
    },
  });

  return mapAppointment(response);
};

export const fetchDoctorDashboard = async (): Promise<DoctorDashboardData> => {
  if (isHostedDemoSessionActive()) {
    return getDemoDoctorDashboardData();
  }

  const response = await apiRequest<DoctorDashboardResponse>("/doctors/me/dashboard");
  return {
    activeDate: response.active_date,
    activeDateLabel: response.active_date_label,
    counts: response.counts,
    upcomingToday: response.upcoming_today.map(mapAppointment),
    recentPatients: response.recent_patients.map(mapPatient),
  };
};

export const fetchDoctorAgenda = async (date?: string) => {
  if (isHostedDemoSessionActive()) {
    return getDemoDoctorAgenda(date);
  }

  const query = date ? `?date=${encodeURIComponent(date)}` : "";
  const response = await apiRequest<AppointmentResponse[]>(`/doctors/me/agenda${query}`);
  return response.map(mapAppointment);
};

export const fetchDoctorPatients = async (search?: string) => {
  if (isHostedDemoSessionActive()) {
    return getDemoDoctorPatients(search);
  }

  const query = search ? `?search=${encodeURIComponent(search)}` : "";
  const response = await apiRequest<PatientResponse[]>(`/doctors/me/patients${query}`);
  return response.map(mapPatient);
};

export const fetchDoctorPatientRecord = async (
  patientId: string,
): Promise<DoctorPatientRecordData> => {
  if (isHostedDemoSessionActive()) {
    return getDemoDoctorPatientRecord(patientId);
  }

  const response = await apiRequest<DoctorPatientRecordResponse>(
    `/doctors/me/patients/${patientId}`,
  );

  return {
    patient: mapPatient(response.patient),
    upcomingAppointments: response.upcoming_appointments.map(mapAppointment),
    encounters: response.encounters.map(mapEncounter),
  };
};

export const fetchDoctorProfile = async (): Promise<DoctorSettingsProfile> => {
  if (isHostedDemoSessionActive()) {
    return getDemoDoctorProfile();
  }

  const response = await apiRequest<DoctorProfileResponse>("/doctors/me/profile");
  return {
    id: response.id,
    name: response.name,
    specialty: response.specialty,
    email: response.email,
    phone: response.phone,
    bio: response.bio,
  };
};

export const updateDoctorProfile = (payload: DoctorSettingsProfile) => {
  if (isHostedDemoSessionActive()) {
    return Promise.resolve(updateDemoDoctorProfile(payload));
  }

  return apiRequest<DoctorProfileResponse>("/doctors/me/profile", {
    method: "PATCH",
    body: {
      name: payload.name,
      specialty: payload.specialty,
      email: payload.email,
      phone: payload.phone,
      bio: payload.bio,
    },
  }).then((response) => ({
    id: response.id,
    name: response.name,
    specialty: response.specialty,
    email: response.email,
    phone: response.phone,
    bio: response.bio,
  }));
};

export const fetchPatientSelfProfile = async () => {
  if (isHostedDemoSessionActive()) {
    return getDemoPatientSelfProfile();
  }

  const response = await apiRequest<PatientResponse>("/patients/me/profile");
  return mapPatient(response);
};

export const fetchPatientHistory = async () => {
  if (isHostedDemoSessionActive()) {
    return getDemoPatientHistory();
  }

  const response = await apiRequest<EncounterResponse[]>("/patients/me/history");
  return response.map(mapEncounter);
};

export const createConsultationEncounter = async (
  patientId: string,
  payload: ConsultationInput,
) => {
  const response = await apiRequest<ConsultationEncounterResponse>(
    `/patients/${patientId}/encounters/consultations`,
    {
      method: "POST",
      body: {
        appointment_id: payload.appointmentId,
        chief_complaint: payload.chiefComplaint,
        symptoms: payload.symptoms,
        physical_exam: payload.physicalExam,
        diagnosis: payload.diagnosis,
        diagnosis_status: payload.diagnosisStatus,
        prescriptions: payload.prescriptions,
        recommendations: payload.recommendations,
        lab_orders: payload.labOrders,
        surgery_referral: payload.surgeryReferral,
        notes: payload.notes,
      },
    },
  );

  return mapEncounter(response) as ConsultationEncounter;
};

export const fetchNotifications = async () => {
  if (isHostedDemoSessionActive()) {
    return getDemoNotifications();
  }

  const response = await apiRequest<NotificationResponse[]>("/notifications");
  return response.map(mapNotification);
};

export const fetchNotificationPreferences = () => {
  if (isHostedDemoSessionActive()) {
    return Promise.resolve(getDemoNotificationPreferences());
  }

  return apiRequest<{
    new_appointment: boolean;
    reminder: boolean;
    cancellation: boolean;
    marketing: boolean;
  }>("/notifications/preferences").then((response): NotificationPreferences => ({
    newAppointment: response.new_appointment,
    reminder: response.reminder,
    cancellation: response.cancellation,
    marketing: response.marketing,
  }));
};

export const updateNotificationPreferences = (preferences: NotificationPreferences) => {
  if (isHostedDemoSessionActive()) {
    return Promise.resolve(updateDemoNotificationPreferences(preferences));
  }

  return apiRequest<{
    new_appointment: boolean;
    reminder: boolean;
    cancellation: boolean;
    marketing: boolean;
  }>("/notifications/preferences", {
    method: "PATCH",
    body: {
      new_appointment: preferences.newAppointment,
      reminder: preferences.reminder,
      cancellation: preferences.cancellation,
      marketing: preferences.marketing,
    },
  }).then((response): NotificationPreferences => ({
    newAppointment: response.new_appointment,
    reminder: response.reminder,
    cancellation: response.cancellation,
    marketing: response.marketing,
  }));
};

export const markNotificationAsRead = async (notificationId: string) => {
  if (isHostedDemoSessionActive()) {
    return markDemoNotificationAsRead(notificationId);
  }

  const response = await apiRequest<NotificationResponse>(`/notifications/${notificationId}/read`, {
    method: "POST",
  });
  return mapNotification(response);
};

export const markAllNotificationsAsRead = async () => {
  if (isHostedDemoSessionActive()) {
    return markAllDemoNotificationsAsRead();
  }

  const response = await apiRequest<NotificationResponse[]>("/notifications/read-all", {
    method: "POST",
  });
  return response.map(mapNotification);
};

export const dismissNotification = (notificationId: string) => {
  if (isHostedDemoSessionActive()) {
    dismissDemoNotification(notificationId);
    return Promise.resolve();
  }

  return apiRequest<void>(`/notifications/${notificationId}`, { method: "DELETE" });
};
