import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Pill, FlaskConical, Calendar, ClipboardList, Stethoscope } from "lucide-react";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

interface Prescription {
  medication: string;
  dosage: string;
  duration: string;
}

interface LabResult {
  test: string;
  result: string;
  lab: string;
  status: "Normal" | "Anormal";
}

interface Encounter {
  date: string;
  doctor: string;
  type: "consultation" | "lab";
  diagnosis?: string;
  diagnosisStatus?: "Activo" | "Resuelto";
  prescriptions?: Prescription[];
  labs?: LabResult[];
}

const mockEncounters: Encounter[] = [
  {
    date: "15 Feb 2026",
    doctor: "Dr. Carlos Mendoza",
    type: "consultation",
    diagnosis: "Hipertensión arterial leve",
    diagnosisStatus: "Activo",
    prescriptions: [
      { medication: "Losartán 50mg", dosage: "1 vez al día", duration: "3 meses" },
    ],
  },
  {
    date: "10 Feb 2026",
    doctor: "Lab. Roe",
    type: "lab",
    labs: [
      { test: "Hemograma completo", result: "Normal", lab: "Lab. Roe", status: "Normal" },
      { test: "Perfil lipídico", result: "Colesterol LDL elevado", lab: "Lab. Roe", status: "Anormal" },
    ],
  },
  {
    date: "03 Ene 2026",
    doctor: "Dra. Ana Gutiérrez",
    type: "consultation",
    diagnosis: "Rinitis alérgica estacional",
    diagnosisStatus: "Resuelto",
    prescriptions: [
      { medication: "Loratadina 10mg", dosage: "1 vez al día", duration: "14 días" },
    ],
  },
];

const allPrescriptions = mockEncounters
  .filter((e) => e.prescriptions)
  .flatMap((e) => e.prescriptions!.map((p) => ({ ...p, doctor: e.doctor, date: e.date })));

const allLabs = mockEncounters
  .filter((e) => e.labs)
  .flatMap((e) => e.labs!.map((l) => ({ ...l, date: e.date })));

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
              <div className="relative space-y-0">
                {/* Vertical line */}
                <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-border" />

                {mockEncounters.map((encounter, i) => (
                  <div key={i} className="relative pl-10 pb-8 last:pb-0">
                    {/* Dot */}
                    <div className="absolute left-[9px] top-1.5 h-3 w-3 rounded-full border-2 border-primary bg-background z-10" />

                    {/* Date & Doctor header */}
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 mb-2">
                      <Calendar className="h-3 w-3" />
                      {encounter.date} · <span className="font-medium text-foreground">{encounter.doctor}</span>
                    </p>

                    <Card>
                      <CardContent className="p-4 space-y-3">
                        {/* Diagnosis */}
                        {encounter.diagnosis && (
                          <div className="flex items-start gap-2">
                            <FileText className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-medium text-foreground">{encounter.diagnosis}</span>
                                <Badge
                                  variant={encounter.diagnosisStatus === "Activo" ? "default" : "secondary"}
                                  className="text-xs"
                                >
                                  {encounter.diagnosisStatus}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Prescriptions */}
                        {encounter.prescriptions?.map((rx, j) => (
                          <div key={j} className="flex items-start gap-2">
                            <Pill className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-foreground">{rx.medication}</p>
                              <p className="text-xs text-muted-foreground">{rx.dosage} · {rx.duration}</p>
                            </div>
                          </div>
                        ))}

                        {/* Labs */}
                        {encounter.labs?.map((lab, j) => (
                          <div key={j} className="flex items-start gap-2">
                            <FlaskConical className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-medium text-foreground">{lab.test}</span>
                                <Badge
                                  variant={lab.status === "Normal" ? "secondary" : "destructive"}
                                  className="text-xs"
                                >
                                  {lab.result}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">{lab.lab}</p>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Recetas Tab */}
            <TabsContent value="recetas">
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Medicamento</TableHead>
                        <TableHead>Dosis</TableHead>
                        <TableHead>Duración</TableHead>
                        <TableHead>Doctor</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allPrescriptions.map((rx, i) => (
                        <TableRow key={i}>
                          <TableCell className="text-muted-foreground">{rx.date}</TableCell>
                          <TableCell className="font-medium">{rx.medication}</TableCell>
                          <TableCell>{rx.dosage}</TableCell>
                          <TableCell>{rx.duration}</TableCell>
                          <TableCell>{rx.doctor}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Lab Tab */}
            <TabsContent value="laboratorio">
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Estudio</TableHead>
                        <TableHead>Resultado</TableHead>
                        <TableHead>Laboratorio</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allLabs.map((lab, i) => (
                        <TableRow key={i}>
                          <TableCell className="text-muted-foreground">{lab.date}</TableCell>
                          <TableCell className="font-medium">{lab.test}</TableCell>
                          <TableCell>
                            <Badge variant={lab.status === "Normal" ? "secondary" : "destructive"} className="text-xs">
                              {lab.result}
                            </Badge>
                          </TableCell>
                          <TableCell>{lab.lab}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Historial;
