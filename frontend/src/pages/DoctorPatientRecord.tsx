import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Droplets,
  FlaskConical,
  Mail,
  Phone,
  Pill,
  Scissors,
  Search,
  Stethoscope,
  UserCheck,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import type {
  ConsultationEncounter,
  Encounter,
  LabEncounter,
  SurgeryEncounter,
} from "@/data/encounters";
import ConsultationCard from "@/components/ConsultationCard";
import LabCard from "@/components/LabCard";
import PrescriptionCard from "@/components/PrescriptionCard";
import SurgeryCard from "@/components/SurgeryCard";
import { fetchDoctorPatientRecord } from "@/lib/api";

const getEncounterKey = (encounter: Encounter, index: number) => {
  const label =
    encounter.type === "consultation"
      ? encounter.doctor
      : encounter.type === "lab"
        ? encounter.lab
        : encounter.surgeon;

  return `${encounter.type}-${encounter.patientId}-${encounter.date}-${label}-${index}`;
};

const DoctorPatientRecord = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const recordQuery = useQuery({
    queryKey: ["doctor-patient-record", patientId],
    queryFn: () => fetchDoctorPatientRecord(patientId!),
    enabled: Boolean(patientId),
  });

  const patient = recordQuery.data?.patient;
  const upcomingAppointments = recordQuery.data?.upcomingAppointments ?? [];
  const allEncounters = useMemo(
    () => recordQuery.data?.encounters ?? [],
    [recordQuery.data?.encounters],
  );

  const encounters = useMemo(() => {
    if (!search.trim()) return allEncounters;
    const query = search.toLowerCase();

    return allEncounters.filter((encounter) => {
      if (encounter.type === "consultation") {
        return (
          encounter.diagnosis.toLowerCase().includes(query) ||
          encounter.doctor.toLowerCase().includes(query) ||
          encounter.specialty.toLowerCase().includes(query) ||
          encounter.prescriptions.some((prescription) =>
            prescription.medication.toLowerCase().includes(query),
          ) ||
          encounter.recommendations.some((recommendation) =>
            recommendation.toLowerCase().includes(query),
          )
        );
      }

      if (encounter.type === "lab") {
        return (
          encounter.lab.toLowerCase().includes(query) ||
          encounter.orderedBy.toLowerCase().includes(query) ||
          encounter.labResults.some((result) => result.test.toLowerCase().includes(query))
        );
      }

      return (
        encounter.procedure.toLowerCase().includes(query) ||
        encounter.surgeon.toLowerCase().includes(query) ||
        encounter.hospital.toLowerCase().includes(query) ||
        encounter.preOpDiagnosis.toLowerCase().includes(query) ||
        encounter.postOpDiagnosis.toLowerCase().includes(query)
      );
    });
  }, [allEncounters, search]);

  const consultations = encounters.filter(
    (encounter): encounter is ConsultationEncounter => encounter.type === "consultation",
  );
  const surgeries = encounters.filter(
    (encounter): encounter is SurgeryEncounter => encounter.type === "surgery",
  );
  const labs = encounters.filter((encounter): encounter is LabEncounter => encounter.type === "lab");
  const prescriptionEncounters = encounters.filter(
    (encounter): encounter is ConsultationEncounter => encounter.type === "consultation",
  );

  if (recordQuery.isLoading) {
    return <div className="p-8 text-muted-foreground">Cargando historial del paciente…</div>;
  }

  if (!patient || recordQuery.isError) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Paciente no encontrado.</p>
        <Button variant="ghost" className="mt-4" onClick={() => navigate("/doctor/portal/pacientes")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Volver a pacientes
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
    <div className="p-4 lg:p-8 space-y-6">
      <Button
        variant="ghost"
        size="sm"
        className="h-10 gap-1.5 -ml-2"
        onClick={() => navigate("/doctor/portal/pacientes")}
      >
        <ArrowLeft className="h-4 w-4" /> Volver a pacientes
      </Button>

      <Card className="rounded-2xl border-border/60">
        <CardContent className="p-5 lg:p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0 space-y-3">
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-foreground font-serif">
                  {patient.name}
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {patient.age} años · {patient.gender === "M" ? "Masculino" : "Femenino"} ·{" "}
                  {patient.insurance}
                </p>
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" /> {patient.phone}
                </span>
                <span className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" /> {patient.email}
                </span>
                {patient.bloodType && (
                  <span className="flex items-center gap-1.5">
                    <Droplets className="h-3.5 w-3.5 text-destructive" /> {patient.bloodType}
                  </span>
                )}
              </div>

              {patient.conditions.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {patient.conditions.map((condition) => (
                    <Badge key={condition} variant="secondary" className="text-xs">
                      {condition}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-x-6 gap-y-2">
                {patient.allergies && patient.allergies.length > 0 && (
                  <div className="flex items-center gap-1.5 text-sm">
                    <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                    <span className="font-medium text-foreground">Alergias:</span>
                    <span className="text-muted-foreground">
                      {patient.allergies.join(", ")}
                    </span>
                  </div>
                )}
                {patient.emergencyContact && (
                  <div className="flex items-center gap-1.5 text-sm">
                    <UserCheck className="h-3.5 w-3.5" />
                    <span className="font-medium text-foreground">Contacto:</span>
                    <span className="text-muted-foreground">
                      {patient.emergencyContact.name} ({patient.emergencyContact.relationship}) —{" "}
                      {patient.emergencyContact.phone}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {upcomingAppointments.length > 0 && (
        <Card className="rounded-2xl border-border/60">
          <CardContent className="p-5">
            <p className="text-sm font-semibold text-foreground flex items-center gap-1.5 mb-3">
              <Calendar className="h-4 w-4 text-primary" /> Próximas citas
            </p>
            <div className="space-y-2">
              {upcomingAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex flex-col gap-2 rounded-lg bg-muted/40 p-2.5 text-sm sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium text-foreground">
                      {appointment.date} — {appointment.time}
                    </p>
                    <p className="text-xs text-muted-foreground">{appointment.reason}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {appointment.type === "telemedicina" ? "Virtual" : "Presencial"}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {appointment.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          name="patient_record_search"
          type="search"
          autoComplete="off"
          spellCheck={false}
          placeholder="Buscar por diagnóstico, medicamento o doctor…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="pl-9"
        />
      </div>

      <Tabs defaultValue="consultas">
        <TabsList className="mb-4">
          <TabsTrigger value="consultas" className="gap-1.5">
            <Stethoscope className="h-4 w-4" /> Consultas
          </TabsTrigger>
          <TabsTrigger value="cirugias" className="gap-1.5">
            <Scissors className="h-4 w-4" /> Cirugías
          </TabsTrigger>
          <TabsTrigger value="recetas" className="gap-1.5">
            <Pill className="h-4 w-4" /> Recetas
          </TabsTrigger>
          <TabsTrigger value="laboratorio" className="gap-1.5">
            <FlaskConical className="h-4 w-4" /> Laboratorio
          </TabsTrigger>
        </TabsList>

        <TabsContent value="consultas">
          {consultations.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Sin consultas registradas
            </p>
          ) : (
            <div className="relative space-y-0">
              <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-border" />
              {consultations.map((encounter, index) => (
                <div key={getEncounterKey(encounter, index)} className="relative pl-10 pb-8 last:pb-0">
                  <div className="absolute left-[9px] top-1.5 h-3 w-3 rounded-full border-2 border-primary bg-background z-10" />
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5 mb-2">
                    <Calendar className="h-3 w-3" />
                    {encounter.date} ·{" "}
                    <span className="font-medium text-foreground">{encounter.doctor}</span>
                    <Badge variant="outline" className="text-xs ml-1">
                      {encounter.specialty}
                    </Badge>
                  </p>
                  <ConsultationCard encounter={encounter} patient={patient} defaultOpen={index === 0} />
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="cirugias">
          {surgeries.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Sin cirugías registradas
            </p>
          ) : (
            <div className="space-y-4">
              {surgeries.map((encounter, index) => (
                <div key={getEncounterKey(encounter, index)}>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5 mb-2">
                    <Calendar className="h-3 w-3" />
                    {encounter.date} ·{" "}
                    <span className="font-medium text-foreground">{encounter.surgeon}</span>
                    <Badge variant="outline" className="text-xs ml-1">
                      {encounter.procedureType}
                    </Badge>
                  </p>
                  <SurgeryCard encounter={encounter} defaultOpen={index === 0} />
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="recetas">
          {prescriptionEncounters.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Sin recetas registradas
            </p>
          ) : (
            <div className="space-y-4">
              {prescriptionEncounters.map((encounter, index) => (
                <div key={getEncounterKey(encounter, index)}>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5 mb-2">
                    <Calendar className="h-3 w-3" />
                    {encounter.date} ·{" "}
                    <span className="font-medium text-foreground">{encounter.doctor}</span>
                    <Badge variant="outline" className="text-xs ml-1">
                      {encounter.specialty}
                    </Badge>
                  </p>
                  <PrescriptionCard encounter={encounter} patient={patient} defaultOpen={index === 0} />
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="laboratorio">
          {labs.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Sin resultados de laboratorio
            </p>
          ) : (
            <div className="space-y-4">
              {labs.map((encounter, index) => (
                <div key={getEncounterKey(encounter, index)}>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5 mb-2">
                    <Calendar className="h-3 w-3" />
                    {encounter.date} ·{" "}
                    <span className="font-medium text-foreground">{encounter.lab}</span>
                  </p>
                  <LabCard encounter={encounter} defaultOpen={index === 0} />
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DoctorPatientRecord;
