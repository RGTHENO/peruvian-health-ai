import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Stethoscope, Pill, FlaskConical, Calendar, ClipboardList, Search } from "lucide-react";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { mockEncounters } from "@/data/encounters";
import type { Encounter } from "@/data/encounters";
import ConsultationCard from "@/components/ConsultationCard";
import LabCard from "@/components/LabCard";
import PrescriptionCard from "@/components/PrescriptionCard";
import type { ConsultationEncounter } from "@/data/encounters";

const Historial = () => {
  const revealRef = useScrollReveal();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return mockEncounters;
    const q = search.toLowerCase();
    return mockEncounters.filter((e) => {
      if (e.type === "consultation") {
        return (
          e.diagnosis.toLowerCase().includes(q) ||
          e.doctor.toLowerCase().includes(q) ||
          e.specialty.toLowerCase().includes(q) ||
          e.prescriptions.some((p) => p.medication.toLowerCase().includes(q)) ||
          e.recommendations.some((r) => r.toLowerCase().includes(q))
        );
      }
      return (
        e.lab.toLowerCase().includes(q) ||
        e.orderedBy.toLowerCase().includes(q) ||
        e.labResults.some((l) => l.test.toLowerCase().includes(q))
      );
    });
  }, [search]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-serif text-foreground">Mi Historial Médico</h1>
          <p className="text-muted-foreground mt-1">Expediente clínico digital con estándar FHIR</p>
        </div>

        <div className="bg-primary/5 border border-primary/20 rounded-lg p-5 mb-8 flex items-start gap-4">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <ClipboardList className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Vista de demostración</p>
            <p className="text-sm text-muted-foreground mt-0.5">
              Los datos mostrados son de ejemplo.{" "}
              <Link to="/iniciar-sesion" className="text-primary font-medium hover:underline">
                Inicia sesión
              </Link>{" "}
              para acceder a tu historial médico real.
            </p>
          </div>
        </div>

        <div ref={revealRef} className="reveal-on-scroll">
          <Tabs defaultValue="consultas">
            <TabsList className="mb-6">
              <TabsTrigger value="consultas" className="gap-1.5">
                <Stethoscope className="h-4 w-4" /> Consultas
              </TabsTrigger>
              <TabsTrigger value="recetas" className="gap-1.5">
                <Pill className="h-4 w-4" /> Recetas
              </TabsTrigger>
              <TabsTrigger value="laboratorio" className="gap-1.5">
                <FlaskConical className="h-4 w-4" /> Laboratorio
              </TabsTrigger>
            </TabsList>

            {/* Timeline Tab */}
            <TabsContent value="consultas">
              {/* Search */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por diagnóstico, medicamento, doctor..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>

              <div className="relative space-y-0">
                <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-border" />

                {filtered.length === 0 && (
                  <p className="text-sm text-muted-foreground pl-10 py-4">No se encontraron resultados.</p>
                )}

                {filtered.map((encounter, i) => (
                  <div key={i} className="relative pl-10 pb-8 last:pb-0">
                    <div className="absolute left-[9px] top-1.5 h-3 w-3 rounded-full border-2 border-primary bg-background z-10" />

                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 mb-2">
                      <Calendar className="h-3 w-3" />
                      {encounter.date} ·{" "}
                      <span className="font-medium text-foreground">
                        {encounter.type === "consultation" ? encounter.doctor : encounter.lab}
                      </span>
                      {encounter.type === "consultation" && (
                        <Badge variant="outline" className="text-xs ml-1">{encounter.specialty}</Badge>
                      )}
                    </p>

                    {encounter.type === "consultation" ? (
                      <ConsultationCard encounter={encounter} defaultOpen={i === 0} />
                    ) : (
                      <LabCard encounter={encounter} defaultOpen={i === 0} />
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Recetas Tab */}
            <TabsContent value="recetas">
              <div className="space-y-4">
                {mockEncounters
                  .filter((e): e is ConsultationEncounter => e.type === "consultation")
                  .map((encounter, i) => (
                    <PrescriptionCard key={i} encounter={encounter} defaultOpen={i === 0} />
                  ))}
              </div>
            </TabsContent>

            {/* Lab Tab */}
            <TabsContent value="laboratorio">
              <div className="space-y-4">
                {mockEncounters
                  .filter((e): e is import("@/data/encounters").LabEncounter => e.type === "lab")
                  .map((encounter, i) => (
                    <LabCard key={i} encounter={encounter} defaultOpen={i === 0} />
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Historial;
