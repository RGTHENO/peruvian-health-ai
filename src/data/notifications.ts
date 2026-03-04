export type NotificationType = "appointment" | "reminder" | "cancellation" | "system";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  link?: string;
}

// Map notification types to DoctorSettings preference keys
export const notificationTypeToPreference: Record<NotificationType, string> = {
  appointment: "newAppointment",
  reminder: "reminder",
  cancellation: "cancellation",
  system: "marketing",
};

export const mockNotifications: AppNotification[] = [
  {
    id: "n1",
    type: "appointment",
    title: "Nueva cita agendada",
    message: "Juan Pérez agendó una consulta para el 10 de marzo a las 10:00 AM.",
    timestamp: new Date(Date.now() - 1000 * 60 * 12), // 12 min ago
    read: false,
    link: "/doctor/portal/agenda",
  },
  {
    id: "n2",
    type: "reminder",
    title: "Consulta en 30 minutos",
    message: "Tienes una consulta con María García a las 3:00 PM.",
    timestamp: new Date(Date.now() - 1000 * 60 * 28), // 28 min ago
    read: false,
    link: "/doctor/portal/agenda",
  },
  {
    id: "n3",
    type: "cancellation",
    title: "Cita cancelada",
    message: "Carmen Ríos canceló su cita del 11 de marzo.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2h ago
    read: false,
    link: "/doctor/portal/agenda",
  },
  {
    id: "n4",
    type: "appointment",
    title: "Cita confirmada",
    message: "Roberto Sánchez confirmó su cita del 12 de marzo a las 9:00 AM.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5h ago
    read: true,
  },
  {
    id: "n5",
    type: "system",
    title: "Nueva funcionalidad disponible",
    message: "Ahora puedes compartir recetas directamente por WhatsApp.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    read: true,
  },
];
