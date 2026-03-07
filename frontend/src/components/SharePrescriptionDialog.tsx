import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Mail, Copy, Check, Phone } from "lucide-react";
import type { ConsultationEncounter } from "@/data/encounters";
import type { Patient } from "@/data/appointments";
import { useToast } from "@/hooks/use-toast";

interface Props {
  encounter: ConsultationEncounter;
  patient?: Patient;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function buildPrescriptionText(encounter: ConsultationEncounter, patient?: Patient): string {
  const lines: string[] = [];

  lines.push("*Receta Medica -- SaludPe*");
  lines.push("");
  lines.push(`*Doctor:* ${encounter.doctor} (${encounter.specialty})`);
  lines.push(`*Fecha:* ${encounter.date}`);
  if (patient) {
    lines.push(`*Paciente:* ${patient.name}`);
  }
  lines.push(`*Diagnóstico:* ${encounter.diagnosis}`);
  lines.push("");

  if (encounter.prescriptions.length > 0) {
    lines.push("*Medicamentos:*");
    encounter.prescriptions.forEach((rx, i) => {
      lines.push(`${i + 1}. ${rx.medication} -- ${rx.dosage}, ${rx.frequency}, ${rx.duration}`);
    });
    lines.push("");
  }

  if (encounter.recommendations.length > 0) {
    lines.push("*Indicaciones:*");
    encounter.recommendations.forEach((r) => {
      lines.push(`- ${r}`);
    });
    lines.push("");
  }

  if (encounter.labOrders.length > 0) {
    lines.push("*Examenes solicitados:*");
    encounter.labOrders.forEach((o) => {
      lines.push(`- ${o}`);
    });
    lines.push("");
  }

  if (encounter.notes) {
    lines.push(`*Notas:* ${encounter.notes}`);
    lines.push("");
  }

  lines.push("_Documento generado por SaludPe_");

  return lines.join("\n");
}

function buildEmailBody(encounter: ConsultationEncounter, patient?: Patient): string {
  // Plain text for email (no markdown bold)
  return buildPrescriptionText(encounter, patient)
    .replace(/\*/g, "")
    .replace(/_/g, "");
}

const SharePrescriptionDialog = ({ encounter, patient, open, onOpenChange }: Props) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const phoneNumber = patient?.phone?.replace(/\s+/g, "").replace("+", "") || "";
  const email = patient?.email || "";
  const text = buildPrescriptionText(encounter, patient);

  const handleWhatsApp = async () => {
    const plainText = text.replace(/\*/g, "").replace(/_/g, "");
    // Try native share (mobile) — keeps text out of URL
    if (navigator.share) {
      try {
        await navigator.share({ title: "Receta Médica", text: plainText });
        onOpenChange(false);
        return;
      } catch {
        // User cancelled or share failed — fall back
      }
    }
    // Fallback: open WhatsApp with text in URL
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
    onOpenChange(false);
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(`Receta Médica — ${encounter.doctor} — ${encounter.date}`);
    const body = encodeURIComponent(buildEmailBody(encounter, patient));
    window.open(`mailto:${email}?subject=${subject}&body=${body}`, "_blank");
    onOpenChange(false);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text.replace(/\*/g, "").replace(/_/g, ""));
      setCopied(true);
      toast({ title: "Copiado", description: "Receta copiada al portapapeles." });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Error", description: "No se pudo copiar.", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            Compartir receta
          </DialogTitle>
          <DialogDescription>
            Envía la receta médica directamente al paciente por WhatsApp o correo electrónico.
          </DialogDescription>
        </DialogHeader>

        {/* Patient info */}
        {patient && (
          <div className="rounded-lg border border-border p-3 space-y-1.5">
            <p className="text-sm font-medium text-foreground">{patient.name}</p>
            <div className="flex flex-wrap gap-2">
              {patient.phone && (
                <Badge variant="outline" className="text-xs gap-1">
                  <Phone className="h-3 w-3" /> {patient.phone}
                </Badge>
              )}
              {patient.email && (
                <Badge variant="outline" className="text-xs gap-1">
                  <Mail className="h-3 w-3" /> {patient.email}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Preview */}
        <div className="rounded-lg bg-muted/40 p-3 max-h-48 overflow-y-auto">
          <p className="text-xs font-semibold text-foreground mb-1">Vista previa del mensaje:</p>
          <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-sans leading-relaxed">
            {text.replace(/\*/g, "").replace(/_/g, "")}
          </pre>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 gap-2">
          <Button
            onClick={handleWhatsApp}
            className="gap-2 bg-[hsl(142,70%,45%)] hover:bg-[hsl(142,70%,38%)] text-white"
            disabled={!phoneNumber}
          >
            <MessageCircle className="h-4 w-4" />
            Enviar por WhatsApp
            {!phoneNumber && <span className="text-xs opacity-70">(sin teléfono)</span>}
          </Button>

          <Button
            onClick={handleEmail}
            variant="outline"
            className="gap-2"
            disabled={!email}
          >
            <Mail className="h-4 w-4" />
            Enviar por correo electrónico
            {!email && <span className="text-xs opacity-70">(sin email)</span>}
          </Button>

          <Button
            onClick={handleCopy}
            variant="ghost"
            className="gap-2"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "¡Copiado!" : "Copiar al portapapeles"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SharePrescriptionDialog;
