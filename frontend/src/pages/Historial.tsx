import { useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Calendar,
  FlaskConical,
  Pill,
  Scissors,
  Search,
  Stethoscope,
} from "lucide-react";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
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
import { useQuery } from "@tanstack/react-query";
import { fetchPatientHistory, fetchPatientSelfProfile } from "@/lib/api";

const getEncounterKey = (encounter: Encounter, index: number) => {
  const label =
    encounter.type === "consultation"
      ? encounter.doctor
      : encounter.type === "lab"
        ? encounter.lab
        : encounter.surgeon;

  return `${encounter.type}-${encounter.patientId}-${encounter.date}-${label}-${index}`;
};

const Historial = () => {
  const revealRef = useScrollReveal();
  const [search, setSearch] = useState("");
  const patientQuery = useQuery({
    queryKey: ["patient-profile"],
    queryFn: fetchPatientSelfProfile,
  });
  const historyQuery = useQuery({
    queryKey: ["patient-history"],
    queryFn: fetchPatientHistory,
  });

  const patient = patientQuery.data;
  const encounterList = useMemo(() => historyQuery.data ?? [], [historyQuery.data]);

  const filtered = useMemo(() => {
    if (!search.trim()) return encounterList;
    const query = search.toLowerCase();

    return encounterList.filter((encounter) => {
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
  }, [encounterList, search]);

  const getTimelineLabel = (encounter: Encounter) => {
    if (encounter.type === "consultation") return encounter.doctor;
    if (encounter.type === "lab") return encounter.lab;
    return encounter.surgeon;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main id="main-content" tabIndex={-1} className="flex-1 container py-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-foreground">
            Mi Historial Médico
          </h1>
          <p className="text-muted-foreground mt-1">
            {patient ? `Expediente clínico digital de ${patient.name}` : "Cargando expediente clínico…"}
          </p>
        </div>

        {historyQuery.isLoading || patientQuery.isLoading ? (
          <div className="py-16 text-center text-muted-foreground">Cargando historial…</div>
        ) : historyQuery.isError || patientQuery.isError ? (
          <div className="py-16 text-center text-destructive">
            No se pudo cargar tu historial médico.
          </div>
        ) : (
          <div ref={revealRef} className="reveal-on-scroll">
            <Tabs defaultValue="consultas">
              <TabsList className="mb-6">
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
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    name="timeline_search"
                    type="search"
                    autoComplete="off"
                    spellCheck={false}
                    placeholder="Buscar por diagnóstico, medicamento o doctor…"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    className="pl-9"
                  />
                </div>

                <div className="relative space-y-0">
                  <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-border" />

                  {filtered.length === 0 && (
                    <p className="text-sm text-muted-foreground pl-10 py-4">
                      No se encontraron resultados.
                    </p>
                  )}

                  {filtered.map((encounter, index) => (
                    <div key={getEncounterKey(encounter, index)} className="relative pl-10 pb-8 last:pb-0">
                      <div className="absolute left-[9px] top-1.5 h-3 w-3 rounded-full border-2 border-primary bg-background z-10" />

                      <p className="text-xs text-muted-foreground flex items-center gap-1.5 mb-2">
                        <Calendar className="h-3 w-3" />
                        {encounter.date} ·{" "}
                        <span className="font-medium text-foreground">{getTimelineLabel(encounter)}</span>
                        {encounter.type === "consultation" && (
                          <Badge variant="outline" className="text-xs ml-1">
                            {encounter.specialty}
                          </Badge>
                        )}
                        {encounter.type === "surgery" && (
                          <Badge variant="outline" className="text-xs ml-1">
                            {encounter.procedureType}
                          </Badge>
                        )}
                      </p>

                      {encounter.type === "consultation" ? (
                        <ConsultationCard encounter={encounter} patient={patient} defaultOpen={index === 0} />
                      ) : encounter.type === "lab" ? (
                        <LabCard encounter={encounter} defaultOpen={index === 0} />
                      ) : (
                        <SurgeryCard encounter={encounter} defaultOpen={index === 0} />
                      )}
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="cirugias">
                <div className="space-y-4">
                  {encounterList
                    .filter((encounter): encounter is SurgeryEncounter => encounter.type === "surgery")
                    .map((encounter, index) => (
                      <SurgeryCard key={getEncounterKey(encounter, index)} encounter={encounter} defaultOpen={index === 0} />
                    ))}
                </div>
              </TabsContent>

              <TabsContent value="recetas">
                <div className="space-y-4">
                  {encounterList
                    .filter((encounter): encounter is ConsultationEncounter => encounter.type === "consultation")
                    .map((encounter, index) => (
                      <PrescriptionCard
                        key={getEncounterKey(encounter, index)}
                        encounter={encounter}
                        patient={patient}
                        defaultOpen={index === 0}
                      />
                    ))}
                </div>
              </TabsContent>

              <TabsContent value="laboratorio">
                <div className="space-y-4">
                  {encounterList
                    .filter((encounter): encounter is LabEncounter => encounter.type === "lab")
                    .map((encounter, index) => (
                      <LabCard key={getEncounterKey(encounter, index)} encounter={encounter} defaultOpen={index === 0} />
                    ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Historial;
