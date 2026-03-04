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

export interface SurgeryEncounter {
  type: "surgery";
  date: string;
  surgeon: string;
  specialty: string;
  hospital: string;
  procedure: string;
  procedureType: "Electiva" | "Emergencia" | "Ambulatoria";
  anesthesiaType: string;
  duration: string;
  preOpDiagnosis: string;
  postOpDiagnosis: string;
  findings: string[];
  complications: string[];
  postOpInstructions: string[];
  prescriptions: Prescription[];
  followUp: string;
  notes?: string;
}

export type Encounter = ConsultationEncounter | LabEncounter | SurgeryEncounter;

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
  {
    type: "lab",
    date: "05 Mar 2026",
    lab: "Laboratorio Suiza Lab",
    orderedBy: "Dr. Carlos Mendoza",
    labResults: [
      { test: "Colesterol LDL", result: "138", referenceRange: "< 130", unit: "mg/dL", status: "Anormal" },
      { test: "Colesterol HDL", result: "55", referenceRange: "> 40", unit: "mg/dL", status: "Normal" },
      { test: "Triglicéridos", result: "130", referenceRange: "< 150", unit: "mg/dL", status: "Normal" },
      { test: "Hemoglobina glicosilada", result: "5.4", referenceRange: "< 5.7", unit: "%", status: "Normal" },
    ],
  },
  {
    type: "surgery",
    date: "20 Dic 2025",
    surgeon: "Dr. Javier Morales",
    specialty: "Cirugía General",
    hospital: "Clínica San Felipe",
    procedure: "Apendicectomía laparoscópica",
    procedureType: "Emergencia",
    anesthesiaType: "Anestesia general",
    duration: "45 minutos",
    preOpDiagnosis: "Apendicitis aguda",
    postOpDiagnosis: "Apendicitis aguda no complicada",
    findings: [
      "Apéndice inflamado sin perforación",
      "Sin presencia de líquido purulento en cavidad",
      "Ciego y colon ascendente sin alteraciones",
    ],
    complications: [],
    postOpInstructions: [
      "Reposo relativo por 7 días",
      "No levantar objetos pesados por 3 semanas",
      "Dieta blanda las primeras 48 horas, luego dieta normal progresiva",
      "Mantener heridas limpias y secas",
      "Retirar puntos en 10 días",
      "Acudir a emergencias si presenta fiebre > 38°C, dolor intenso o enrojecimiento en heridas",
    ],
    prescriptions: [
      { medication: "Ketorolaco 10mg", dosage: "1 tableta", frequency: "Cada 8 horas", duration: "5 días" },
      { medication: "Ciprofloxacino 500mg", dosage: "1 tableta", frequency: "Cada 12 horas", duration: "7 días" },
      { medication: "Metronidazol 500mg", dosage: "1 tableta", frequency: "Cada 8 horas", duration: "7 días" },
    ],
    followUp: "Control en 10 días para retiro de puntos y evaluación post-operatoria",
    notes: "Paciente toleró bien el procedimiento. Alta a las 24 horas sin complicaciones.",
  },
  {
    type: "surgery",
    date: "15 Ago 2025",
    surgeon: "Dra. Patricia Flores",
    specialty: "Cirugía General",
    hospital: "Hospital Nacional Arzobispo Loayza",
    procedure: "Colecistectomía laparoscópica",
    procedureType: "Electiva",
    anesthesiaType: "Anestesia general",
    duration: "1 hora 10 minutos",
    preOpDiagnosis: "Colelitiasis sintomática",
    postOpDiagnosis: "Colelitiasis múltiple, vesícula con paredes engrosadas",
    findings: [
      "Vesícula biliar con paredes engrosadas y múltiples cálculos",
      "Conducto cístico de calibre normal",
      "Vía biliar principal sin dilatación",
      "Hígado de aspecto normal",
    ],
    complications: [],
    postOpInstructions: [
      "Dieta baja en grasas por 4 semanas",
      "Evitar frituras, embutidos y lácteos enteros",
      "Reposo relativo por 10 días",
      "No realizar esfuerzos físicos por 3 semanas",
      "Mantener heridas limpias y secas",
      "Acudir a emergencias si presenta fiebre, ictericia o dolor abdominal intenso",
    ],
    prescriptions: [
      { medication: "Tramadol 50mg", dosage: "1 cápsula", frequency: "Cada 8 horas (si dolor)", duration: "5 días" },
      { medication: "Paracetamol 500mg", dosage: "1 tableta", frequency: "Cada 6 horas", duration: "5 días" },
      { medication: "Omeprazol 20mg", dosage: "1 cápsula", frequency: "1 vez al día (en ayunas)", duration: "2 semanas" },
    ],
    followUp: "Control en 2 semanas con resultados de anatomía patológica",
    notes: "Procedimiento sin complicaciones. Se envió pieza operatoria a anatomía patológica.",
  },
  {
    type: "surgery",
    date: "02 Jun 2025",
    surgeon: "Dr. Ricardo Vega",
    specialty: "Traumatología y Ortopedia",
    hospital: "Clínica Ricardo Palma",
    procedure: "Artroscopia de rodilla derecha",
    procedureType: "Ambulatoria",
    anesthesiaType: "Anestesia raquídea",
    duration: "35 minutos",
    preOpDiagnosis: "Lesión de menisco medial, rodilla derecha",
    postOpDiagnosis: "Rotura del cuerno posterior del menisco medial",
    findings: [
      "Rotura compleja del cuerno posterior del menisco medial",
      "Cartílago articular femoral y tibial conservado",
      "Ligamentos cruzados íntegros",
      "Se realizó meniscectomía parcial",
    ],
    complications: [],
    postOpInstructions: [
      "Uso de muletas por 1 semana",
      "Aplicar hielo local 20 minutos cada 4 horas los primeros 3 días",
      "Iniciar fisioterapia a partir del día 5",
      "No apoyar peso completo hasta indicación médica",
      "Mantener pierna elevada en reposo",
      "Ejercicios isométricos de cuádriceps desde el día 2",
    ],
    prescriptions: [
      { medication: "Celecoxib 200mg", dosage: "1 cápsula", frequency: "Cada 12 horas", duration: "7 días" },
      { medication: "Paracetamol 500mg", dosage: "1 tableta", frequency: "Cada 6 horas (si dolor)", duration: "5 días" },
    ],
    followUp: "Control en 1 semana. Iniciar fisioterapia con protocolo de rehabilitación de meniscectomía",
    notes: "Procedimiento ambulatorio. Paciente dado de alta el mismo día con buena tolerancia.",
  },
];
