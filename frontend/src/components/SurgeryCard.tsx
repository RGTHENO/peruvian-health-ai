import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Scissors, Pill, ClipboardList, Search, FileText, Share2,
  StickyNote, ChevronDown, Clock, Building2, Syringe, CalendarCheck, AlertTriangle
} from "lucide-react";
import type { SurgeryEncounter } from "@/data/encounters";

interface Props {
  encounter: SurgeryEncounter;
  defaultOpen?: boolean;
}

const SectionHeader = ({ icon: Icon, label, count }: { icon: React.ElementType; label: string; count?: number }) => (
  <div className="flex items-center gap-2 mb-2">
    <Icon className="h-4 w-4 text-primary" />
    <span className="text-sm font-semibold text-foreground">
      {label}{count !== undefined ? ` (${count})` : ""}
    </span>
  </div>
);

const SurgeryCard = ({ encounter, defaultOpen = false }: Props) => {
  const typeColor = encounter.procedureType === "Emergencia"
    ? "bg-destructive/10 text-destructive border-destructive/20"
    : encounter.procedureType === "Ambulatoria"
      ? "bg-primary/10 text-primary border-primary/20"
      : "bg-secondary text-secondary-foreground border-border";

  return (
    <Collapsible defaultOpen={defaultOpen} className="rounded-2xl border border-border/60 bg-card overflow-hidden">
      <CollapsibleTrigger className="flex items-center justify-between w-full px-5 py-4 text-left hover:bg-muted/30 transition-colors group">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Scissors className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-foreground">{encounter.procedure}</span>
              <Badge variant="outline" className={`text-xs ${typeColor}`}>
                {encounter.procedureType}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {encounter.surgeon} · {encounter.hospital}
            </p>
          </div>
        </div>
        <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="border-t border-border/60" />
        <div className="px-5 pb-5 pt-4 space-y-4">

          {/* Quick info row */}
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>{encounter.duration}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Syringe className="h-3.5 w-3.5" />
              <span>{encounter.anesthesiaType}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Building2 className="h-3.5 w-3.5" />
              <span>{encounter.hospital}</span>
            </div>
          </div>

          <Separator />

          {/* Diagnosis pre/post */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-xs font-medium text-muted-foreground mb-1">Diagnóstico pre-operatorio</p>
              <p className="text-sm font-medium text-foreground">{encounter.preOpDiagnosis}</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-xs font-medium text-muted-foreground mb-1">Diagnóstico post-operatorio</p>
              <p className="text-sm font-medium text-foreground">{encounter.postOpDiagnosis}</p>
            </div>
          </div>

          {/* Findings */}
          {encounter.findings.length > 0 && (
            <>
              <Separator />
              <div>
                <SectionHeader icon={Search} label="Hallazgos quirúrgicos" count={encounter.findings.length} />
                <ul className="ml-6 space-y-1">
                  {encounter.findings.map((f, j) => (
                    <li key={j} className="text-sm text-foreground flex items-start gap-2">
                      <span className="mt-1.5 h-1 w-1 rounded-full bg-muted-foreground shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {/* Complications */}
          {encounter.complications.length > 0 && (
            <>
              <Separator />
              <div>
                <SectionHeader icon={AlertTriangle} label="Complicaciones" count={encounter.complications.length} />
                <ul className="ml-6 space-y-1">
                  {encounter.complications.map((c, j) => (
                    <li key={j} className="text-sm text-foreground flex items-start gap-2">
                      <span className="mt-1.5 h-1 w-1 rounded-full bg-amber-500 shrink-0" />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {encounter.complications.length === 0 && (
            <>
              <Separator />
              <div className="flex items-center gap-2 text-sm text-primary">
                <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xs">✓</span>
                </div>
                Sin complicaciones
              </div>
            </>
          )}

          {/* Prescriptions */}
          {encounter.prescriptions.length > 0 && (
            <>
              <Separator />
              <div>
                <SectionHeader icon={Pill} label="Medicamentos post-operatorios" count={encounter.prescriptions.length} />
                <div className="ml-6 space-y-1.5">
                  {encounter.prescriptions.map((rx, j) => (
                    <div key={j} className="text-sm">
                      <span className="font-medium text-foreground">{rx.medication}</span>
                      <span className="text-muted-foreground"> · {rx.dosage} · {rx.frequency} · {rx.duration}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Post-op Instructions */}
          {encounter.postOpInstructions.length > 0 && (
            <>
              <Separator />
              <div>
                <SectionHeader icon={ClipboardList} label="Indicaciones post-operatorias" count={encounter.postOpInstructions.length} />
                <ul className="ml-6 space-y-1">
                  {encounter.postOpInstructions.map((inst, j) => (
                    <li key={j} className="text-sm text-foreground flex items-start gap-2">
                      <span className="mt-1.5 h-1 w-1 rounded-full bg-muted-foreground shrink-0" />
                      {inst}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {/* Follow-up */}
          <Separator />
          <div className="flex items-start gap-2">
            <CalendarCheck className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <p className="text-sm text-foreground">
              <span className="font-medium">Seguimiento:</span>{" "}
              <span className="text-muted-foreground">{encounter.followUp}</span>
            </p>
          </div>

          {/* Notes */}
          {encounter.notes && (
            <>
              <Separator />
              <div className="flex items-start gap-2">
                <StickyNote className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <p className="text-sm text-muted-foreground">{encounter.notes}</p>
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-2 pt-1 sm:flex-row">
            <Button variant="outline" size="sm" disabled className="h-10 justify-start gap-1.5">
              <FileText className="h-3.5 w-3.5" /> Descargar PDF
            </Button>
            <Button variant="outline" size="sm" disabled className="h-10 justify-start gap-1.5">
              <Share2 className="h-3.5 w-3.5" /> Compartir
            </Button>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default SurgeryCard;
