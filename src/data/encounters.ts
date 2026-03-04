export interface Prescription {
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
}

export interface LabResult {
  test: string;
  result: string;
  referenceRange: string;
  unit: string;
  status: "Normal" | "Anormal";
}

export interface ConsultationEncounter {
  type: "consultation";
  date: string;
  doctor: string;
  specialty: string;
  diagnosis: string;
  diagnosisStatus: "Activo" | "Resuelto";
  prescriptions: Prescription[];
  recommendations: string[];
  labOrders: string[];
  notes?: string;
}

export interface LabEncounter {
  type: "lab";
  date: string;
  lab: string;
  orderedBy: string;
  labResults: LabResult[];
}

export type Encounter = ConsultationEncounter | LabEncounter;

export const mockEncounters: Encounter[] = [
  {
    type: "consultation",
    date: "15 Feb 2026",
    doctor: "Dr. Carlos Mendoza",
    specialty: "Cardiología",
    diagnosis: "Hipertensión arterial leve",
    diagnosisStatus: "Activo",
    prescriptions: [
      { medication: "Losartán 50mg", dosage: "1 tableta", frequency: "1 vez al día", duration: "3 meses" },
      { medication: "Amlodipino 5mg", dosage: "1 tableta", frequency: "1 vez al día", duration: "3 meses" },
      { medication: "Aspirina 100mg", dosage: "1 tableta", frequency: "1 vez al día", duration: "Continuo" },
    ],
    recommendations: [
      "Reducir consumo de sal",
      "Evitar ají y comidas picantes",
      "No consumir gaseosas",
      "Caminar 30 minutos al día",
      "Control de presión arterial semanal",
    ],
    labOrders: ["Hemograma completo", "Perfil lipídico", "Glucosa en ayunas"],
    notes: "Control en 1 mes con resultados de laboratorio. Si presenta cefalea intensa o mareos, acudir a emergencias.",
  },
  {
    type: "lab",
    date: "10 Feb 2026",
    lab: "Laboratorio Roe",
    orderedBy: "Dr. Carlos Mendoza",
    labResults: [
      { test: "Hemograma completo", result: "Normal", referenceRange: "—", unit: "—", status: "Normal" },
      { test: "Colesterol LDL", result: "165", referenceRange: "< 130", unit: "mg/dL", status: "Anormal" },
      { test: "Colesterol HDL", result: "52", referenceRange: "> 40", unit: "mg/dL", status: "Normal" },
      { test: "Triglicéridos", result: "148", referenceRange: "< 150", unit: "mg/dL", status: "Normal" },
      { test: "Glucosa en ayunas", result: "92", referenceRange: "70 – 100", unit: "mg/dL", status: "Normal" },
    ],
  },
  {
    type: "consultation",
    date: "03 Ene 2026",
    doctor: "Dra. Ana Gutiérrez",
    specialty: "Medicina General",
    diagnosis: "Rinitis alérgica estacional",
    diagnosisStatus: "Resuelto",
    prescriptions: [
      { medication: "Loratadina 10mg", dosage: "1 tableta", frequency: "1 vez al día", duration: "14 días" },
      { medication: "Fluticasona spray nasal", dosage: "2 puffs por fosa", frequency: "2 veces al día", duration: "21 días" },
    ],
    recommendations: [
      "Evitar exposición a polvo y polen",
      "Lavar fosas nasales con solución salina",
      "Mantener ventanas cerradas en días de viento",
    ],
    labOrders: [],
    notes: "Si los síntomas persisten después de 2 semanas, volver para evaluación.",
  },
  {
    type: "consultation",
    date: "15 Nov 2025",
    doctor: "Dr. Roberto Sánchez",
    specialty: "Gastroenterología",
    diagnosis: "Gastritis crónica",
    diagnosisStatus: "Activo",
    prescriptions: [
      { medication: "Omeprazol 20mg", dosage: "1 cápsula", frequency: "1 vez al día (en ayunas)", duration: "2 meses" },
      { medication: "Sucralfato 1g", dosage: "1 sobre", frequency: "3 veces al día (antes de comidas)", duration: "1 mes" },
    ],
    recommendations: [
      "No consumir ají ni comidas picantes",
      "Evitar café, alcohol y gaseosas",
      "Comer en horarios regulares, no saltarse comidas",
      "No acostarse inmediatamente después de comer",
      "Reducir estrés con técnicas de relajación",
    ],
    labOrders: ["Test de Helicobacter pylori"],
    notes: "Evaluar resultado del test de H. pylori para definir terapia de erradicación.",
  },
];
