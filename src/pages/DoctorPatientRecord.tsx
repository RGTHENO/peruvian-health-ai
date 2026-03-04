import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Phone,
  Mail,
  Droplets,
  AlertTriangle,
  Stethoscope,
  Scissors,
  Pill,
  FlaskConical,
  Calendar,
  UserCheck,
} from "lucide-react";
import { patients, appointments } from "@/data/appointments";
import { mockEncounters } from "@/data/encounters";
import type { ConsultationEncounter, LabEncounter, SurgeryEncounter } from "@/data/encounters";
import ConsultationCard from "@/components/ConsultationCard";
import LabCard from "@/components/LabCard";
import PrescriptionCard from "@/components/PrescriptionCard";
import SurgeryCard from "@/components/SurgeryCard";

const DoctorPatientRecord = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();

  const patient = useMemo(() => patients.find((p) => p.id === patientId), [patientId]);

  const encounters = useMemo(
    () => mockEncounters.filter((e) => e.patientId === patientId),
    [patientId]
  );

  const upcomingAppointments = useMemo(
    () =>
      appointments
        .filter((a) => a.patientId === patientId && a.status !== "completada" && a.status !== "cancelada")
        .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)),
    [patientId]
  );

  const consultations = encounters.filter((e): e is ConsultationEncounter => e.type === "consultation");
  const surgeries = encounters.filter((e): e is SurgeryEncounter => e.type === "surgery");
  const labs = encounters.filter((e): e is LabEncounter => e.type === "lab");
  const prescriptionEncounters = encounters.filter(
    (e): e is ConsultationEncounter | SurgeryEncounter => e.type === "consultation" || e.type === "surgery"
  );

  if (!patient) {
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
    .map((n) => n[0])
    .join("");

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        className="gap-1.5 -ml-2"
        onClick={() => navigate("/doctor/portal/pacientes")}
      >
        <ArrowLeft className="h-4 w-4" /> Volver a pacientes
      </Button>

      {/* Patient summary card */}
      <Card className="rounded-2xl border-border/60">
        <CardContent className="p-5 lg:p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0 space-y-3">
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-foreground font-serif">{patient.name}</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {patient.age} años · {patient.gender === "M" ? "Masculino" : "Femenino"} · {patient.insurance}
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
                  {patient.conditions.map((c) => (
                    <Badge key={c} variant="secondary" className="text-xs">
                      {c}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-x-6 gap-y-2">
                {patient.allergies && patient.allergies.length > 0 && (
                  <div className="flex items-center gap-1.5 text-sm">
                    <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                    <span className="font-medium text-foreground">Alergias:</span>
                    <span className="text-muted-foreground">{patient.allergies.join(", ")}</span>
                  </div>
                )}
                {patient.emergencyContact && (
                  <div className="flex items-center gap-1.5 text-sm">
                    <UserCheck className="h-3.5 w-3.5" />
                    <span className="font-medium text-foreground">Contacto:</span>
                    <span className="text-muted-foreground">
                      {patient.emergencyContact.name} ({patient.emergencyContact.relationship}) — {patient.emergencyContact.phone}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming appointments */}
      {upcomingAppointments.length > 0 && (
        <Card className="rounded-2xl border-border/60">
          <CardContent className="p-5">
            <p className="text-sm font-semibold text-foreground flex items-center gap-1.5 mb-3">
              <Calendar className="h-4 w-4 text-primary" /> Próximas citas
            </p>
            <div className="space-y-2">
              {upcomingAppointments.map((apt) => (
                <div key={apt.id} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40 text-sm">
                  <div>
                    <p className="font-medium text-foreground">
                      {apt.date} — {apt.time}
                    </p>
                    <p className="text-xs text-muted-foreground">{apt.reason}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {apt.type === "telemedicina" ? "Virtual" : "Presencial"}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {apt.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Clinical history tabs */}
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
            <p className="text-sm text-muted-foreground py-8 text-center">Sin consultas registradas</p>
          ) : (
            <div className="relative space-y-0">
              <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-border" />
              {consultations.map((e, i) => (
                <div key={i} className="relative pl-10 pb-8 last:pb-0">
                  <div className="absolute left-[9px] top-1.5 h-3 w-3 rounded-full border-2 border-primary bg-background z-10" />
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5 mb-2">
                    <Calendar className="h-3 w-3" />
                    {e.date} · <span className="font-medium text-foreground">{e.doctor}</span>
                    <Badge variant="outline" className="text-xs ml-1">{e.specialty}</Badge>
                  </p>
                  <ConsultationCard encounter={e} defaultOpen={i === 0} />
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="cirugias">
          {surgeries.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Sin cirugías registradas</p>
          ) : (
            <div className="space-y-4">
              {surgeries.map((e, i) => (
                <div key={i}>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5 mb-2">
                    <Calendar className="h-3 w-3" />
                    {e.date} · <span className="font-medium text-foreground">{e.surgeon}</span>
                    <Badge variant="outline" className="text-xs ml-1">{e.procedureType}</Badge>
                  </p>
                  <SurgeryCard encounter={e} defaultOpen={i === 0} />
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="recetas">
          {prescriptionEncounters.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Sin recetas registradas</p>
          ) : (
            <div className="space-y-4">
              {prescriptionEncounters.map((e, i) =>
                e.type === "consultation" ? (
                  <div key={i}>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 mb-2">
                      <Calendar className="h-3 w-3" />
                      {e.date} · <span className="font-medium text-foreground">{e.doctor}</span>
                      <Badge variant="outline" className="text-xs ml-1">{e.specialty}</Badge>
                    </p>
                    <PrescriptionCard encounter={e} defaultOpen={i === 0} />
                  </div>
                ) : null
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="laboratorio">
          {labs.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Sin resultados de laboratorio</p>
          ) : (
            <div className="space-y-4">
              {labs.map((e, i) => (
                <div key={i}>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5 mb-2">
                    <Calendar className="h-3 w-3" />
                    {e.date} · <span className="font-medium text-foreground">{e.lab}</span>
                  </p>
                  <LabCard encounter={e} defaultOpen={i === 0} />
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
