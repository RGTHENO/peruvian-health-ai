import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  ArrowLeft,
  Droplets,
  PanelRightClose,
  PanelRightOpen,
  Shield,
} from "lucide-react";
import type { ConsultationEncounter, LabEncounter, SurgeryEncounter } from "@/data/encounters";
import ConsultationFormPanel from "@/components/doctor/ConsultationFormPanel";
import PatientHistoryPanel from "@/components/doctor/PatientHistoryPanel";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  consultationFormReducer,
  createConsultationFormState,
  type ConsultationTextField,
} from "@/lib/doctor-consultation";
import {
  createConsultationEncounter,
  fetchDoctorAgenda,
  fetchDoctorPatientRecord,
} from "@/lib/api";
import { ApiError } from "@/lib/api-client";

const DoctorConsultation = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const agendaQuery = useQuery({
    queryKey: ["doctor-agenda"],
    queryFn: () => fetchDoctorAgenda(),
  });

  const appointment = useMemo(
    () => agendaQuery.data?.find((item) => item.id === appointmentId),
    [agendaQuery.data, appointmentId],
  );

  const patientRecordQuery = useQuery({
    queryKey: ["doctor-patient-record", appointment?.patientId],
    queryFn: () => fetchDoctorPatientRecord(appointment!.patientId),
    enabled: Boolean(appointment?.patientId),
  });

  const patient = patientRecordQuery.data?.patient;
  const encounterList = useMemo(
    () => patientRecordQuery.data?.encounters ?? [],
    [patientRecordQuery.data?.encounters],
  );
  const [state, dispatch] = useReducer(
    consultationFormReducer,
    createConsultationFormState(appointment?.reason ?? "", isMobile),
  );
  const previousAppointmentId = useRef<string | undefined>(appointment?.id);

  useEffect(() => {
    if (previousAppointmentId.current === appointment?.id) return;
    previousAppointmentId.current = appointment?.id;
    dispatch({
      type: "reset",
      state: createConsultationFormState(appointment?.reason ?? "", isMobile),
    });
  }, [appointment?.id, appointment?.reason, isMobile]);

  useEffect(() => {
    dispatch({ type: "setShowHistory", value: !isMobile });
  }, [isMobile]);

  const previousEncounters = useMemo(
    () => encounterList.filter((encounter) => encounter.patientId === patient?.id),
    [encounterList, patient?.id],
  );

  const prevConsultations = useMemo(
    () =>
      previousEncounters.filter(
        (encounter): encounter is ConsultationEncounter => encounter.type === "consultation",
      ),
    [previousEncounters],
  );
  const prevLabs = useMemo(
    () => previousEncounters.filter((encounter): encounter is LabEncounter => encounter.type === "lab"),
    [previousEncounters],
  );
  const prevSurgeries = useMemo(
    () =>
      previousEncounters.filter(
        (encounter): encounter is SurgeryEncounter => encounter.type === "surgery",
      ),
    [previousEncounters],
  );

  const appendToField = useCallback(
    (field: ConsultationTextField) => (text: string) => {
      dispatch({ type: "appendTextField", field, value: text });
    },
    [],
  );

  const saveConsultationMutation = useMutation({
    mutationFn: async () => {
      if (!patient || !appointment) throw new Error("Consulta incompleta");

      const validPrescriptions = state.prescriptions
        .filter((prescription) => prescription.medication.trim())
        .map(({ id, ...prescription }) => prescription);
      const validRecommendations = state.recommendations
        .map((recommendation) => recommendation.value.trim())
        .filter(Boolean);
      const validLabOrders = state.labOrders.map((order) => order.test.trim()).filter(Boolean);

      return createConsultationEncounter(patient.id, {
        appointmentId: appointment.id,
        chiefComplaint: state.chiefComplaint,
        symptoms: state.symptoms,
        physicalExam: state.physicalExam,
        diagnosis: state.diagnosis.trim(),
        diagnosisStatus: state.diagnosisStatus,
        prescriptions: validPrescriptions,
        recommendations: validRecommendations,
        labOrders: validLabOrders,
        surgeryReferral: state.surgeryReferral,
        notes: state.notes,
      });
    },
    onSuccess: async () => {
      if (!patient) return;

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["doctor-agenda"] }),
        queryClient.invalidateQueries({ queryKey: ["doctor-dashboard"] }),
        queryClient.invalidateQueries({ queryKey: ["doctor-patients"] }),
        queryClient.invalidateQueries({ queryKey: ["doctor-patient-record", patient.id] }),
        queryClient.invalidateQueries({ queryKey: ["patient-history"] }),
      ]);

      toast({
        title: "Consulta guardada",
        description: "El encuentro clínico ha sido registrado exitosamente.",
      });
      setTimeout(() => navigate(`/doctor/portal/pacientes/${patient.id}`), 500);
    },
    onError: (error) => {
      const description =
        error instanceof ApiError ? error.message : "No se pudo guardar la consulta.";
      toast({
        title: "Error al guardar",
        description,
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    if (!patient || !appointment) return;

    if (!state.diagnosis.trim()) {
      toast({
        title: "Diagnóstico requerido",
        description: "Ingrese al menos un diagnóstico.",
        variant: "destructive",
      });
      return;
    }

    saveConsultationMutation.mutate();
  };

  if (agendaQuery.isLoading || patientRecordQuery.isLoading) {
    return <div className="p-8 text-muted-foreground">Cargando consulta…</div>;
  }

  if (!appointment || !patient || agendaQuery.isError || patientRecordQuery.isError) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Cita no encontrada.</p>
        <Button variant="ghost" className="mt-4" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Volver
        </Button>
      </div>
    );
  }

  const initials = patient.name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("");

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="h-10 gap-1">
          <ArrowLeft className="h-4 w-4" /> Volver a agenda
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-10 gap-1.5 lg:hidden"
          onClick={() => dispatch({ type: "toggleHistory" })}
        >
          {state.showHistory ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
          Historial
        </Button>
      </div>

      <Card className="border-l-4 border-l-primary">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-foreground">{patient.name}</h2>
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span>{patient.age} años</span>
                <span>·</span>
                <span>{patient.gender === "M" ? "Masculino" : "Femenino"}</span>
                {patient.bloodType && (
                  <>
                    <span>·</span>
                    <Badge variant="outline" className="gap-1 text-xs">
                      <Droplets className="h-3 w-3" /> {patient.bloodType}
                    </Badge>
                  </>
                )}
              </div>
            </div>
            <Badge variant="secondary" className="gap-1 text-sm">
              <Shield className="h-3.5 w-3.5" /> {patient.insurance}
            </Badge>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {patient.allergies && patient.allergies.length > 0 && (
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="h-3 w-3" /> Alergias: {patient.allergies.join(", ")}
              </Badge>
            )}
            {patient.conditions.map((condition) => (
              <Badge key={condition} variant="outline" className="text-xs">
                {condition}
              </Badge>
            ))}
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            <strong>Motivo de cita:</strong> {appointment.reason}
            {appointment.type === "telemedicina" && (
              <Badge variant="outline" className="ml-2 text-xs">
                Telemedicina
              </Badge>
            )}
          </p>
        </CardContent>
      </Card>

      <div className="flex flex-col items-start gap-4 lg:flex-row lg:gap-6">
        <div className={`w-full ${state.showHistory ? "lg:w-[60%]" : "lg:w-full"} space-y-4 transition-all`}>
          <ConsultationFormPanel
            state={state}
            dispatch={dispatch}
            onAppendField={appendToField}
            onSave={handleSave}
            isSaving={saveConsultationMutation.isPending}
          />
        </div>

        <PatientHistoryPanel
          visible={state.showHistory}
          isMobile={isMobile}
          patient={patient}
          previousConsultations={prevConsultations}
          previousLabs={prevLabs}
          previousSurgeries={prevSurgeries}
          onClose={() => dispatch({ type: "setShowHistory", value: false })}
          onOpen={() => dispatch({ type: "setShowHistory", value: true })}
        />
      </div>
    </div>
  );
};

export default DoctorConsultation;
