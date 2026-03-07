import type { Prescription } from "@/data/encounters";

export type ConsultationTextField =
  | "chiefComplaint"
  | "symptoms"
  | "physicalExam"
  | "diagnosis"
  | "notes";

export interface PrescriptionField extends Prescription {
  id: string;
}

export interface RecommendationField {
  id: string;
  value: string;
}

export interface LabOrderField {
  id: string;
  test: string;
}

export interface SurgeryReferralState {
  procedure: string;
  urgency: "Electiva" | "Urgente";
  notes: string;
}

export interface ConsultationFormState {
  chiefComplaint: string;
  symptoms: string;
  physicalExam: string;
  diagnosis: string;
  diagnosisStatus: "Activo" | "Resuelto";
  prescriptions: PrescriptionField[];
  recommendations: RecommendationField[];
  labOrders: LabOrderField[];
  surgeryReferral: SurgeryReferralState | null;
  notes: string;
  showHistory: boolean;
}

export type ConsultationFormAction =
  | { type: "reset"; state: ConsultationFormState }
  | { type: "setTextField"; field: ConsultationTextField; value: string }
  | { type: "appendTextField"; field: ConsultationTextField; value: string }
  | { type: "setDiagnosisStatus"; value: ConsultationFormState["diagnosisStatus"] }
  | { type: "toggleHistory" }
  | { type: "setShowHistory"; value: boolean }
  | { type: "addPrescription" }
  | { type: "updatePrescription"; id: string; field: keyof Prescription; value: string }
  | { type: "removePrescription"; id: string }
  | { type: "addRecommendation" }
  | { type: "updateRecommendation"; id: string; value: string }
  | { type: "removeRecommendation"; id: string }
  | { type: "addLabOrder" }
  | { type: "updateLabOrder"; id: string; value: string }
  | { type: "removeLabOrder"; id: string }
  | { type: "enableSurgeryReferral" }
  | { type: "setSurgeryReferralField"; field: keyof SurgeryReferralState; value: string }
  | { type: "clearSurgeryReferral" };

const createId = (prefix: string) => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
};

export const createPrescriptionField = (): PrescriptionField => ({
  id: createId("rx"),
  medication: "",
  dosage: "",
  frequency: "",
  duration: "",
});

export const createRecommendationField = (): RecommendationField => ({
  id: createId("rec"),
  value: "",
});

export const createLabOrderField = (): LabOrderField => ({
  id: createId("lab"),
  test: "",
});

export const createConsultationFormState = (
  initialComplaint: string,
  isMobile: boolean,
): ConsultationFormState => ({
  chiefComplaint: initialComplaint,
  symptoms: "",
  physicalExam: "",
  diagnosis: "",
  diagnosisStatus: "Activo",
  prescriptions: [createPrescriptionField()],
  recommendations: [createRecommendationField()],
  labOrders: [],
  surgeryReferral: null,
  notes: "",
  showHistory: !isMobile,
});

export const consultationFormReducer = (
  state: ConsultationFormState,
  action: ConsultationFormAction,
): ConsultationFormState => {
  switch (action.type) {
    case "reset":
      return action.state;
    case "setTextField":
      return { ...state, [action.field]: action.value };
    case "appendTextField": {
      const previousValue = state[action.field];
      return {
        ...state,
        [action.field]: previousValue ? `${previousValue} ${action.value}` : action.value,
      };
    }
    case "setDiagnosisStatus":
      return { ...state, diagnosisStatus: action.value };
    case "toggleHistory":
      return { ...state, showHistory: !state.showHistory };
    case "setShowHistory":
      return { ...state, showHistory: action.value };
    case "addPrescription":
      return { ...state, prescriptions: [...state.prescriptions, createPrescriptionField()] };
    case "updatePrescription":
      return {
        ...state,
        prescriptions: state.prescriptions.map((prescription) =>
          prescription.id === action.id
            ? { ...prescription, [action.field]: action.value }
            : prescription,
        ),
      };
    case "removePrescription": {
      const nextPrescriptions = state.prescriptions.filter((prescription) => prescription.id !== action.id);
      return {
        ...state,
        prescriptions: nextPrescriptions.length > 0 ? nextPrescriptions : [createPrescriptionField()],
      };
    }
    case "addRecommendation":
      return { ...state, recommendations: [...state.recommendations, createRecommendationField()] };
    case "updateRecommendation":
      return {
        ...state,
        recommendations: state.recommendations.map((recommendation) =>
          recommendation.id === action.id
            ? { ...recommendation, value: action.value }
            : recommendation,
        ),
      };
    case "removeRecommendation": {
      const nextRecommendations = state.recommendations.filter(
        (recommendation) => recommendation.id !== action.id,
      );
      return {
        ...state,
        recommendations: nextRecommendations.length > 0 ? nextRecommendations : [createRecommendationField()],
      };
    }
    case "addLabOrder":
      return { ...state, labOrders: [...state.labOrders, createLabOrderField()] };
    case "updateLabOrder":
      return {
        ...state,
        labOrders: state.labOrders.map((order) =>
          order.id === action.id ? { ...order, test: action.value } : order,
        ),
      };
    case "removeLabOrder":
      return { ...state, labOrders: state.labOrders.filter((order) => order.id !== action.id) };
    case "enableSurgeryReferral":
      return {
        ...state,
        surgeryReferral: state.surgeryReferral ?? {
          procedure: "",
          urgency: "Electiva",
          notes: "",
        },
      };
    case "setSurgeryReferralField":
      if (!state.surgeryReferral) return state;

      return {
        ...state,
        surgeryReferral: {
          ...state.surgeryReferral,
          [action.field]: action.value,
        },
      };
    case "clearSurgeryReferral":
      return { ...state, surgeryReferral: null };
    default:
      return state;
  }
};
