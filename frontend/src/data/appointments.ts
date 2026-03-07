export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: "M" | "F";
  phone: string;
  email: string;
  insurance: string;
  lastVisit: string;
  conditions: string[];
  avatar: string;
  bloodType?: string;
  allergies?: string[];
  emergencyContact?: { name: string; phone: string; relationship: string };
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  duration: number; // minutes
  type: "presencial" | "telemedicina";
  status: "confirmada" | "en-espera" | "cancelada" | "completada";
  reason: string;
  notes?: string;
}

export const patients: Patient[] = [
  {
    id: "p1",
    name: "Juan Pérez Sánchez",
    age: 45,
    gender: "M",
    phone: "+51 987 654 321",
    email: "juan.perez@email.com",
    insurance: "Rímac",
    lastVisit: "2026-02-15",
    conditions: ["Hipertensión", "Diabetes tipo 2"],
    avatar: "",
    bloodType: "O+",
    allergies: ["Penicilina"],
    emergencyContact: { name: "María Sánchez", phone: "+51 987 111 222", relationship: "Esposa" },
  },
  {
    id: "p2",
    name: "Ana María López",
    age: 32,
    gender: "F",
    phone: "+51 912 345 678",
    email: "ana.lopez@email.com",
    insurance: "Pacífico",
    lastVisit: "2026-02-28",
    conditions: ["Asma"],
    avatar: "",
    bloodType: "A+",
    allergies: [],
    emergencyContact: { name: "Carlos López", phone: "+51 912 000 111", relationship: "Hermano" },
  },
  {
    id: "p3",
    name: "Roberto García Flores",
    age: 58,
    gender: "M",
    phone: "+51 945 678 123",
    email: "roberto.garcia@email.com",
    insurance: "Mapfre",
    lastVisit: "2026-01-20",
    conditions: ["Arritmia cardíaca", "Colesterol alto"],
    avatar: "",
    bloodType: "B+",
    allergies: ["Sulfonamidas", "Ibuprofeno"],
    emergencyContact: { name: "Elena García", phone: "+51 945 000 111", relationship: "Esposa" },
  },
  {
    id: "p4",
    name: "Carmen Ríos Vega",
    age: 27,
    gender: "F",
    phone: "+51 976 543 210",
    email: "carmen.rios@email.com",
    insurance: "SIS",
    lastVisit: "2026-03-01",
    conditions: [],
    avatar: "",
    bloodType: "AB+",
    allergies: [],
  },
  {
    id: "p5",
    name: "Luis Fernando Mendoza",
    age: 63,
    gender: "M",
    phone: "+51 934 567 890",
    email: "luis.mendoza@email.com",
    insurance: "La Positiva",
    lastVisit: "2026-02-10",
    conditions: ["EPOC", "Hipertensión"],
    avatar: "",
    bloodType: "A-",
    allergies: ["Aspirina"],
    emergencyContact: { name: "Rosa Mendoza", phone: "+51 934 000 111", relationship: "Hija" },
  },
  {
    id: "p6",
    name: "Sofía Castillo Torres",
    age: 19,
    gender: "F",
    phone: "+51 923 456 789",
    email: "sofia.castillo@email.com",
    insurance: "Rímac",
    lastVisit: "2026-02-25",
    conditions: ["Dermatitis atópica"],
    avatar: "",
    bloodType: "O-",
    allergies: ["Látex"],
  },
];

export const appointments: Appointment[] = [
  {
    id: "a1",
    patientId: "p1",
    patientName: "Juan Pérez Sánchez",
    date: "2026-03-03",
    time: "08:00",
    duration: 30,
    type: "presencial",
    status: "confirmada",
    reason: "Control de presión arterial",
    notes: "Traer resultados de laboratorio recientes",
  },
  {
    id: "a2",
    patientId: "p2",
    patientName: "Ana María López",
    date: "2026-03-03",
    time: "08:30",
    duration: 30,
    type: "telemedicina",
    status: "confirmada",
    reason: "Revisión de tratamiento para asma",
  },
  {
    id: "a3",
    patientId: "p4",
    patientName: "Carmen Ríos Vega",
    date: "2026-03-03",
    time: "09:00",
    duration: 30,
    type: "presencial",
    status: "en-espera",
    reason: "Consulta general - dolor de cabeza frecuente",
  },
  {
    id: "a4",
    patientId: "p3",
    patientName: "Roberto García Flores",
    date: "2026-03-03",
    time: "09:30",
    duration: 45,
    type: "presencial",
    status: "confirmada",
    reason: "Evaluación cardiológica de seguimiento",
    notes: "Paciente con antecedente de arritmia",
  },
  {
    id: "a5",
    patientId: "p5",
    patientName: "Luis Fernando Mendoza",
    date: "2026-03-03",
    time: "10:30",
    duration: 30,
    type: "telemedicina",
    status: "cancelada",
    reason: "Control de EPOC",
  },
  {
    id: "a6",
    patientId: "p6",
    patientName: "Sofía Castillo Torres",
    date: "2026-03-03",
    time: "11:00",
    duration: 30,
    type: "presencial",
    status: "en-espera",
    reason: "Brote de dermatitis",
  },
  {
    id: "a7",
    patientId: "p1",
    patientName: "Juan Pérez Sánchez",
    date: "2026-03-04",
    time: "09:00",
    duration: 30,
    type: "presencial",
    status: "confirmada",
    reason: "Resultados de laboratorio",
  },
  {
    id: "a8",
    patientId: "p2",
    patientName: "Ana María López",
    date: "2026-03-04",
    time: "10:00",
    duration: 30,
    type: "telemedicina",
    status: "confirmada",
    reason: "Seguimiento respiratorio",
  },
  {
    id: "a9",
    patientId: "p3",
    patientName: "Roberto García Flores",
    date: "2026-02-28",
    time: "08:00",
    duration: 45,
    type: "presencial",
    status: "completada",
    reason: "Electrocardiograma de control",
  },
  {
    id: "a10",
    patientId: "p4",
    patientName: "Carmen Ríos Vega",
    date: "2026-02-27",
    time: "11:00",
    duration: 30,
    type: "telemedicina",
    status: "completada",
    reason: "Primera consulta - migrañas",
  },
];
