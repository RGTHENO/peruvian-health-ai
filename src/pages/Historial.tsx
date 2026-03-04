import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Pill, FlaskConical, Calendar, Lock, ClipboardList } from "lucide-react";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

const mockDiagnoses = [
  { date: "15 Feb 2026", doctor: "Dr. Carlos Mendoza", diagnosis: "Hipertensión arterial leve", status: "Activo" },
  { date: "03 Ene 2026", doctor: "Dra. Ana Gutiérrez", diagnosis: "Rinitis alérgica estacional", status: "Resuelto" },
];

const mockPrescriptions = [
  { date: "15 Feb 2026", medication: "Losartán 50mg", dosage: "1 vez al día", duration: "3 meses" },
  { date: "03 Ene 2026", medication: "Loratadina 10mg", dosage: "1 vez al día", duration: "14 días" },
];

const mockLabResults = [
  { date: "10 Feb 2026", test: "Hemograma completo", result: "Normal", lab: "Lab. Roe" },
  { date: "10 Feb 2026", test: "Perfil lipídico", result: "Colesterol LDL elevado", lab: "Lab. Roe" },
];

const Historial = () => {
  const revealRef = useScrollReveal();

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

        <div ref={revealRef} className="grid gap-6 lg:grid-cols-3 reveal-on-scroll">
          {/* Diagnoses */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-primary" /> Diagnósticos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockDiagnoses.map((d, i) => (
                <div key={i} className="border-b border-border pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> {d.date}
                    </span>
                    <Badge variant={d.status === "Activo" ? "default" : "secondary"} className="text-xs">
                      {d.status}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium text-foreground">{d.diagnosis}</p>
                  <p className="text-xs text-muted-foreground">{d.doctor}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Prescriptions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Pill className="h-5 w-5 text-primary" /> Recetas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockPrescriptions.map((p, i) => (
                <div key={i} className="border-b border-border pb-3 last:border-0 last:pb-0">
                  <span className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                    <Calendar className="h-3 w-3" /> {p.date}
                  </span>
                  <p className="text-sm font-medium text-foreground">{p.medication}</p>
                  <p className="text-xs text-muted-foreground">{p.dosage} · {p.duration}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Lab Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FlaskConical className="h-5 w-5 text-primary" /> Resultados de Laboratorio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockLabResults.map((l, i) => (
                <div key={i} className="border-b border-border pb-3 last:border-0 last:pb-0">
                  <span className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                    <Calendar className="h-3 w-3" /> {l.date}
                  </span>
                  <p className="text-sm font-medium text-foreground">{l.test}</p>
                  <p className="text-xs text-muted-foreground">{l.result} · {l.lab}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Historial;
