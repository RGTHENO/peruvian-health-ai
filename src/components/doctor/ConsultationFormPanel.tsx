import type { Dispatch } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import VoiceDictation from "@/components/VoiceDictation";
import { FlaskConical, Pill, Plus, Save, Scissors, Stethoscope, Trash2 } from "lucide-react";
import type {
  ConsultationFormAction,
  ConsultationFormState,
  ConsultationTextField,
} from "@/lib/doctor-consultation";

interface ConsultationFormPanelProps {
  state: ConsultationFormState;
  dispatch: Dispatch<ConsultationFormAction>;
  onAppendField: (field: ConsultationTextField) => (text: string) => void;
  onSave: () => void;
}

const ConsultationFormPanel = ({
  state,
  dispatch,
  onAppendField,
  onSave,
}: ConsultationFormPanelProps) => (
  <Card>
    <CardHeader className="pb-4">
      <CardTitle className="flex items-center gap-2 text-lg">
        <Stethoscope className="h-5 w-5 text-primary" /> Registro de consulta
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="chief-complaint">Motivo de consulta</Label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            id="chief-complaint"
            name="chief_complaint"
            value={state.chiefComplaint}
            onChange={(event) =>
              dispatch({
                type: "setTextField",
                field: "chiefComplaint",
                value: event.target.value,
              })
            }
            placeholder="¿Cuál es el motivo principal de la consulta?"
          />
          <VoiceDictation onTranscript={onAppendField("chiefComplaint")} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="symptoms">Síntomas / Historia de enfermedad actual</Label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Textarea
            id="symptoms"
            name="symptoms"
            value={state.symptoms}
            onChange={(event) =>
              dispatch({
                type: "setTextField",
                field: "symptoms",
                value: event.target.value,
              })
            }
            placeholder="Describa los síntomas que refiere el paciente…"
            rows={3}
          />
          <VoiceDictation onTranscript={onAppendField("symptoms")} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="physical-exam">Examen físico</Label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Textarea
            id="physical-exam"
            name="physical_exam"
            value={state.physicalExam}
            onChange={(event) =>
              dispatch({
                type: "setTextField",
                field: "physicalExam",
                value: event.target.value,
              })
            }
            placeholder="Hallazgos del examen físico…"
            rows={3}
          />
          <VoiceDictation onTranscript={onAppendField("physicalExam")} />
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <Label htmlFor="diagnosis">Diagnóstico</Label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            id="diagnosis"
            name="diagnosis"
            value={state.diagnosis}
            onChange={(event) =>
              dispatch({
                type: "setTextField",
                field: "diagnosis",
                value: event.target.value,
              })
            }
            placeholder="Diagnóstico principal"
          />
          <Select
            value={state.diagnosisStatus}
            onValueChange={(value) =>
              dispatch({
                type: "setDiagnosisStatus",
                value: value as ConsultationFormState["diagnosisStatus"],
              })
            }
          >
            <SelectTrigger className="w-full sm:w-32" aria-label="Estado del diagnóstico">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Activo">Activo</SelectItem>
              <SelectItem value="Resuelto">Resuelto</SelectItem>
            </SelectContent>
          </Select>
          <VoiceDictation onTranscript={onAppendField("diagnosis")} />
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2 text-base font-semibold">
            <Pill className="h-4 w-4" /> Recetas
          </Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => dispatch({ type: "addPrescription" })}
            className="gap-1"
          >
            <Plus className="h-3 w-3" /> Medicamento
          </Button>
        </div>
        {state.prescriptions.map((prescription) => (
          <div
            key={prescription.id}
            className="grid grid-cols-1 items-end gap-2 sm:grid-cols-[1fr_auto_auto_auto_auto]"
          >
            <Input
              name={`prescription_medication_${prescription.id}`}
              placeholder="Medicamento"
              value={prescription.medication}
              onChange={(event) =>
                dispatch({
                  type: "updatePrescription",
                  id: prescription.id,
                  field: "medication",
                  value: event.target.value,
                })
              }
            />
            <Input
              name={`prescription_dosage_${prescription.id}`}
              placeholder="Dosis"
              className="sm:w-24"
              value={prescription.dosage}
              onChange={(event) =>
                dispatch({
                  type: "updatePrescription",
                  id: prescription.id,
                  field: "dosage",
                  value: event.target.value,
                })
              }
            />
            <Input
              name={`prescription_frequency_${prescription.id}`}
              placeholder="Frecuencia"
              className="sm:w-32"
              value={prescription.frequency}
              onChange={(event) =>
                dispatch({
                  type: "updatePrescription",
                  id: prescription.id,
                  field: "frequency",
                  value: event.target.value,
                })
              }
            />
            <Input
              name={`prescription_duration_${prescription.id}`}
              placeholder="Duración"
              className="sm:w-24"
              value={prescription.duration}
              onChange={(event) =>
                dispatch({
                  type: "updatePrescription",
                  id: prescription.id,
                  field: "duration",
                  value: event.target.value,
                })
              }
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-10 w-10 text-destructive"
              aria-label={`Eliminar receta ${prescription.medication || "sin nombre"}`}
              onClick={() => dispatch({ type: "removePrescription", id: prescription.id })}
              disabled={state.prescriptions.length === 1}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <Separator />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">Indicaciones</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => dispatch({ type: "addRecommendation" })}
            className="gap-1"
          >
            <Plus className="h-3 w-3" /> Indicación
          </Button>
        </div>
        {state.recommendations.map((recommendation) => (
          <div key={recommendation.id} className="flex gap-2">
            <Input
              name={`recommendation_${recommendation.id}`}
              placeholder="Indicación para el paciente"
              value={recommendation.value}
              onChange={(event) =>
                dispatch({
                  type: "updateRecommendation",
                  id: recommendation.id,
                  value: event.target.value,
                })
              }
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-10 w-10 shrink-0 text-destructive"
              aria-label={`Eliminar indicación ${recommendation.value || "sin texto"}`}
              onClick={() => dispatch({ type: "removeRecommendation", id: recommendation.id })}
              disabled={state.recommendations.length === 1}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <Separator />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2 text-base font-semibold">
            <FlaskConical className="h-4 w-4" /> Órdenes de laboratorio
          </Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => dispatch({ type: "addLabOrder" })}
            className="gap-1"
          >
            <Plus className="h-3 w-3" /> Orden
          </Button>
        </div>
        {state.labOrders.length === 0 && (
          <p className="text-sm text-muted-foreground">Sin órdenes de laboratorio</p>
        )}
        {state.labOrders.map((order) => (
          <div key={order.id} className="flex gap-2">
            <Input
              name={`lab_order_${order.id}`}
              placeholder="Nombre del examen (ej: Hemograma completo)"
              value={order.test}
              onChange={(event) =>
                dispatch({
                  type: "updateLabOrder",
                  id: order.id,
                  value: event.target.value,
                })
              }
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-10 w-10 shrink-0 text-destructive"
              aria-label={`Eliminar orden ${order.test || "sin nombre"}`}
              onClick={() => dispatch({ type: "removeLabOrder", id: order.id })}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <Separator />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2 text-base font-semibold">
            <Scissors className="h-4 w-4" /> Referencia a cirugía
          </Label>
          {!state.surgeryReferral && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => dispatch({ type: "enableSurgeryReferral" })}
              className="gap-1"
            >
              <Plus className="h-3 w-3" /> Referencia
            </Button>
          )}
        </div>
        {state.surgeryReferral ? (
          <div className="space-y-2 rounded-lg border border-border p-3">
            <Input
              name="surgery_procedure"
              placeholder="Procedimiento quirúrgico"
              value={state.surgeryReferral.procedure}
              onChange={(event) =>
                dispatch({
                  type: "setSurgeryReferralField",
                  field: "procedure",
                  value: event.target.value,
                })
              }
            />
            <div className="flex flex-col gap-2 sm:flex-row">
              <Select
                value={state.surgeryReferral.urgency}
                onValueChange={(value) =>
                  dispatch({
                    type: "setSurgeryReferralField",
                    field: "urgency",
                    value,
                  })
                }
              >
                <SelectTrigger className="w-full sm:w-36" aria-label="Urgencia de cirugía">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Electiva">Electiva</SelectItem>
                  <SelectItem value="Urgente">Urgente</SelectItem>
                </SelectContent>
              </Select>
              <Input
                name="surgery_notes"
                placeholder="Notas"
                className="flex-1"
                value={state.surgeryReferral.notes}
                onChange={(event) =>
                  dispatch({
                    type: "setSurgeryReferralField",
                    field: "notes",
                    value: event.target.value,
                  })
                }
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-10 w-10 shrink-0 text-destructive"
                aria-label="Eliminar referencia quirúrgica"
                onClick={() => dispatch({ type: "clearSurgeryReferral" })}
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

      <div className="space-y-2">
        <Label htmlFor="consultation-notes">Notas adicionales</Label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Textarea
            id="consultation-notes"
            name="consultation_notes"
            value={state.notes}
            onChange={(event) =>
              dispatch({
                type: "setTextField",
                field: "notes",
                value: event.target.value,
              })
            }
            placeholder="Observaciones y plan de seguimiento…"
            rows={3}
          />
          <VoiceDictation onTranscript={onAppendField("notes")} />
        </div>
      </div>

      <Button onClick={onSave} className="w-full gap-2" size="lg">
        <Save className="h-4 w-4" /> Guardar consulta
      </Button>
    </CardContent>
  </Card>
);

export default ConsultationFormPanel;
