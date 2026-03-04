import { useState, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  ArrowLeft,
  Shield,
  Droplets,
  AlertTriangle,
  Plus,
  Trash2,
  ChevronDown,
  Stethoscope,
  FlaskConical,
  Scissors,
  Save,
  FileText,
} from "lucide-react";
import VoiceDictation from "@/components/VoiceDictation";
import { appointments, patients } from "@/data/appointments";
import { mockEncounters, addEncounter, type Prescription, type ConsultationEncounter, type LabEncounter } from "@/data/encounters";
import { useToast } from "@/hooks/use-toast";

interface LabOrder {
  test: string;
}

interface SurgeryReferral {
  procedure: string;
  urgency: "Electiva" | "Urgente";
  notes: string;
}

const emptyPrescription = (): Prescription => ({
  medication: "",
  dosage: "",
  frequency: "",
  duration: "",
});

const DoctorConsultation = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const appointment = useMemo(() => appointments.find((a) => a.id === appointmentId), [appointmentId]);
  const patient = useMemo(() => patients.find((p) => p.id === appointment?.patientId), [appointment]);

  // SOAP fields
  const [chiefComplaint, setChiefComplaint] = useState(appointment?.reason || "");
  const [symptoms, setSymptoms] = useState("");
  const [physicalExam, setPhysicalExam] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [diagnosisStatus, setDiagnosisStatus] = useState<"Activo" | "Resuelto">("Activo");
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([emptyPrescription()]);
  const [recommendations, setRecommendations] = useState<string[]>([""]);
  const [labOrders, setLabOrders] = useState<LabOrder[]>([]);
  const [surgeryReferral, setSurgeryReferral] = useState<SurgeryReferral | null>(null);
  const [notes, setNotes] = useState("");

  // Previous encounters
  const previousEncounters = useMemo(
    () => mockEncounters.filter((e) => e.patientId === patient?.id).slice(0, 3),
    [patient]
  );

  // Prescription handlers
  const addPrescription = () => setPrescriptions((p) => [...p, emptyPrescription()]);
  const removePrescription = (i: number) => setPrescriptions((p) => p.filter((_, idx) => idx !== i));
  const updatePrescription = (i: number, field: keyof Prescription, value: string) =>
    setPrescriptions((p) => p.map((rx, idx) => (idx === i ? { ...rx, [field]: value } : rx)));

  // Recommendation handlers
  const addRecommendation = () => setRecommendations((r) => [...r, ""]);
  const removeRecommendation = (i: number) => setRecommendations((r) => r.filter((_, idx) => idx !== i));
  const updateRecommendation = (i: number, value: string) =>
    setRecommendations((r) => r.map((rec, idx) => (idx === i ? value : rec)));

  // Lab order handlers
  const addLabOrder = () => setLabOrders((o) => [...o, { test: "" }]);
  const removeLabOrder = (i: number) => setLabOrders((o) => o.filter((_, idx) => idx !== i));
  const updateLabOrder = (i: number, value: string) =>
    setLabOrders((o) => o.map((l, idx) => (idx === i ? { test: value } : l)));

  // Voice helper
  const appendTo = useCallback(
    (setter: React.Dispatch<React.SetStateAction<string>>) => (text: string) => {
      setter((prev) => (prev ? prev + " " + text : text));
    },
    []
  );

  // Save
  const handleSave = () => {
    if (!diagnosis.trim()) {
      toast({ title: "Diagnóstico requerido", description: "Ingrese al menos un diagnóstico.", variant: "destructive" });
      return;
    }

    const today = new Date();
    const dateStr = today.toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" });

    // Filter valid prescriptions & recommendations
    const validPrescriptions = prescriptions.filter((p) => p.medication.trim());
    const validRecommendations = recommendations.filter((r) => r.trim());
    const validLabOrders = labOrders.filter((l) => l.test.trim());

    // 1. Create the consultation encounter
    const consultationEncounter: ConsultationEncounter = {
      type: "consultation",
      patientId: patient!.id,
      date: dateStr,
      doctor: "Dra. María Elena Torres",
      specialty: appointment!.reason.includes("Cardiología") ? "Cardiología" : "Medicina General",
      diagnosis: diagnosis.trim(),
      diagnosisStatus: diagnosisStatus,
      prescriptions: validPrescriptions,
      recommendations: validRecommendations,
      labOrders: validLabOrders.map((l) => l.test),
      notes: [
        chiefComplaint && `Motivo: ${chiefComplaint}`,
        symptoms && `Síntomas: ${symptoms}`,
        physicalExam && `Examen físico: ${physicalExam}`,
        notes,
      ].filter(Boolean).join("\n"),
    };
    addEncounter(consultationEncounter);

    // 2. If there are lab orders, create a pending lab encounter
    if (validLabOrders.length > 0) {
      const labEncounter: LabEncounter = {
        type: "lab",
        patientId: patient!.id,
        date: dateStr,
        lab: "Pendiente",
        orderedBy: "Dra. María Elena Torres",
        labResults: validLabOrders.map((l) => ({
          test: l.test,
          result: "Pendiente",
          referenceRange: "—",
          unit: "—",
          status: "Normal" as const,
        })),
      };
      addEncounter(labEncounter);
    }

    // 3. Mark appointment as completed
    const apt = appointments.find((a) => a.id === appointmentId);
    if (apt) {
      (apt as any).status = "completada";
    }

    toast({ title: "Consulta guardada", description: "El encuentro clínico ha sido registrado exitosamente." });
    setTimeout(() => navigate(`/doctor/portal/pacientes/${patient!.id}`), 800);
  };

  if (!appointment || !patient) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Cita no encontrada.</p>
        <Button variant="ghost" className="mt-4" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Volver
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-4xl mx-auto">
      {/* Back */}
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-1">
        <ArrowLeft className="h-4 w-4" /> Volver a agenda
      </Button>

      {/* Patient Summary Bar */}
      <Card className="border-l-4 border-l-primary">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">
              {patient.name.split(" ").slice(0, 2).map((n) => n[0]).join("")}
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
            {/* Insurance */}
            <Badge variant="secondary" className="gap-1 text-sm">
              <Shield className="h-3.5 w-3.5" /> {patient.insurance}
            </Badge>
          </div>

          {/* Alerts */}
          <div className="mt-3 flex flex-wrap gap-2">
            {patient.allergies && patient.allergies.length > 0 && (
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="h-3 w-3" /> Alergias: {patient.allergies.join(", ")}
              </Badge>
            )}
            {patient.conditions.map((c) => (
              <Badge key={c} variant="outline" className="text-xs">{c}</Badge>
            ))}
          </div>

          {/* Reason */}
          <p className="mt-2 text-sm text-muted-foreground">
            <strong>Motivo de cita:</strong> {appointment.reason}
            {appointment.type === "telemedicina" && (
              <Badge variant="outline" className="ml-2 text-xs">Telemedicina</Badge>
            )}
          </p>
        </CardContent>
      </Card>

      {/* SOAP Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Stethoscope className="h-5 w-5 text-primary" /> Registro de consulta
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Chief complaint */}
          <div className="space-y-2">
            <Label>Motivo de consulta</Label>
            <div className="flex gap-2">
              <Input
                value={chiefComplaint}
                onChange={(e) => setChiefComplaint(e.target.value)}
                placeholder="¿Cuál es el motivo principal de la consulta?"
              />
              <VoiceDictation onTranscript={appendTo(setChiefComplaint)} />
            </div>
          </div>

          {/* Symptoms */}
          <div className="space-y-2">
            <Label>Síntomas / Historia de enfermedad actual</Label>
            <div className="flex gap-2">
              <Textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Describa los síntomas que refiere el paciente..."
                rows={3}
              />
              <VoiceDictation onTranscript={appendTo(setSymptoms)} />
            </div>
          </div>

          {/* Physical exam */}
          <div className="space-y-2">
            <Label>Examen físico</Label>
            <div className="flex gap-2">
              <Textarea
                value={physicalExam}
                onChange={(e) => setPhysicalExam(e.target.value)}
                placeholder="Hallazgos del examen físico..."
                rows={3}
              />
              <VoiceDictation onTranscript={appendTo(setPhysicalExam)} />
            </div>
          </div>

          <Separator />

          {/* Diagnosis */}
          <div className="space-y-2">
            <Label>Diagnóstico</Label>
            <div className="flex gap-2">
              <Input
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="Diagnóstico principal"
              />
              <Select value={diagnosisStatus} onValueChange={(v) => setDiagnosisStatus(v as "Activo" | "Resuelto")}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Activo">Activo</SelectItem>
                  <SelectItem value="Resuelto">Resuelto</SelectItem>
                </SelectContent>
              </Select>
              <VoiceDictation onTranscript={appendTo(setDiagnosis)} />
            </div>
          </div>

          <Separator />

          {/* Prescriptions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Recetas</Label>
              <Button type="button" variant="outline" size="sm" onClick={addPrescription} className="gap-1">
                <Plus className="h-3 w-3" /> Agregar medicamento
              </Button>
            </div>
            {prescriptions.map((rx, i) => (
              <div key={i} className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-2 items-end">
                <Input
                  placeholder="Medicamento"
                  value={rx.medication}
                  onChange={(e) => updatePrescription(i, "medication", e.target.value)}
                />
                <Input
                  placeholder="Dosis"
                  className="w-24"
                  value={rx.dosage}
                  onChange={(e) => updatePrescription(i, "dosage", e.target.value)}
                />
                <Input
                  placeholder="Frecuencia"
                  className="w-32"
                  value={rx.frequency}
                  onChange={(e) => updatePrescription(i, "frequency", e.target.value)}
                />
                <Input
                  placeholder="Duración"
                  className="w-24"
                  value={rx.duration}
                  onChange={(e) => updatePrescription(i, "duration", e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                  onClick={() => removePrescription(i)}
                  disabled={prescriptions.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <Separator />

          {/* Recommendations */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Indicaciones</Label>
              <Button type="button" variant="outline" size="sm" onClick={addRecommendation} className="gap-1">
                <Plus className="h-3 w-3" /> Agregar indicación
              </Button>
            </div>
            {recommendations.map((rec, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  placeholder="Indicación para el paciente"
                  value={rec}
                  onChange={(e) => updateRecommendation(i, e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive shrink-0"
                  onClick={() => removeRecommendation(i)}
                  disabled={recommendations.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <Separator />

          {/* Lab Orders */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold flex items-center gap-2">
                <FlaskConical className="h-4 w-4" /> Órdenes de laboratorio
              </Label>
              <Button type="button" variant="outline" size="sm" onClick={addLabOrder} className="gap-1">
                <Plus className="h-3 w-3" /> Orden de laboratorio
              </Button>
            </div>
            {labOrders.length === 0 && (
              <p className="text-sm text-muted-foreground">Sin órdenes de laboratorio</p>
            )}
            {labOrders.map((order, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  placeholder="Nombre del examen (ej: Hemograma completo)"
                  value={order.test}
                  onChange={(e) => updateLabOrder(i, e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive shrink-0"
                  onClick={() => removeLabOrder(i)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <Separator />

          {/* Surgery referral */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold flex items-center gap-2">
                <Scissors className="h-4 w-4" /> Referencia a cirugía
              </Label>
              {!surgeryReferral && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSurgeryReferral({ procedure: "", urgency: "Electiva", notes: "" })}
                  className="gap-1"
                >
                  <Plus className="h-3 w-3" /> Agregar referencia
                </Button>
              )}
            </div>
            {surgeryReferral ? (
              <div className="space-y-2 p-3 rounded-lg border border-border">
                <Input
                  placeholder="Procedimiento quirúrgico"
                  value={surgeryReferral.procedure}
                  onChange={(e) => setSurgeryReferral({ ...surgeryReferral, procedure: e.target.value })}
                />
                <div className="flex gap-2">
                  <Select
                    value={surgeryReferral.urgency}
                    onValueChange={(v) => setSurgeryReferral({ ...surgeryReferral, urgency: v as "Electiva" | "Urgente" })}
                  >
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Electiva">Electiva</SelectItem>
                      <SelectItem value="Urgente">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Notas adicionales"
                    className="flex-1"
                    value={surgeryReferral.notes}
                    onChange={(e) => setSurgeryReferral({ ...surgeryReferral, notes: e.target.value })}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive shrink-0"
                    onClick={() => setSurgeryReferral(null)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Sin referencia quirúrgica</p>
            )}
          </div>

          <Separator />

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notas adicionales</Label>
            <div className="flex gap-2">
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Observaciones, plan de seguimiento..."
                rows={3}
              />
              <VoiceDictation onTranscript={appendTo(setNotes)} />
            </div>
          </div>

          {/* Save */}
          <Button onClick={handleSave} className="w-full gap-2" size="lg">
            <Save className="h-4 w-4" /> Guardar consulta
          </Button>
        </CardContent>
      </Card>

      {/* Previous history */}
      <Collapsible>
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full justify-between gap-2">
            <span className="flex items-center gap-2">
              <FileText className="h-4 w-4" /> Historial previo del paciente ({previousEncounters.length})
            </span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3 space-y-3">
          {previousEncounters.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Sin historial previo</p>
          ) : (
            previousEncounters.map((enc, i) => (
              <Card key={i} className="bg-muted/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="text-xs">
                      {enc.type === "consultation" ? "Consulta" : enc.type === "lab" ? "Laboratorio" : "Cirugía"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{enc.date}</span>
                  </div>
                  {enc.type === "consultation" && (
                    <div>
                      <p className="font-medium text-sm text-foreground">{enc.diagnosis}</p>
                      <p className="text-xs text-muted-foreground">{enc.doctor} · {enc.specialty}</p>
                      {enc.prescriptions.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Rx: {enc.prescriptions.map((p) => p.medication).join(", ")}
                        </p>
                      )}
                    </div>
                  )}
                  {enc.type === "lab" && (
                    <div>
                      <p className="text-sm text-foreground">{enc.lab}</p>
                      <p className="text-xs text-muted-foreground">
                        {enc.labResults.map((l) => l.test).join(", ")}
                      </p>
                    </div>
                  )}
                  {enc.type === "surgery" && (
                    <div>
                      <p className="font-medium text-sm text-foreground">{enc.procedure}</p>
                      <p className="text-xs text-muted-foreground">{enc.surgeon} · {enc.hospital}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default DoctorConsultation;
