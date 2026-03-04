import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Stethoscope, Pill, ClipboardList, FlaskConical, FileText, Share2, StickyNote, ChevronDown } from "lucide-react";
import type { ConsultationEncounter } from "@/data/encounters";

interface Props {
  encounter: ConsultationEncounter;
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

const ConsultationCard = ({ encounter, defaultOpen = false }: Props) => {
  return (
    <Collapsible defaultOpen={defaultOpen} className="rounded-2xl border border-border/60 bg-card overflow-hidden">
      <CollapsibleTrigger className="flex items-center justify-between w-full px-5 py-4 text-left hover:bg-muted/30 transition-colors group">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Stethoscope className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-foreground">{encounter.diagnosis}</span>
              <Badge variant={encounter.diagnosisStatus === "Activo" ? "default" : "secondary"} className="text-xs">
                {encounter.diagnosisStatus}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {encounter.prescriptions.length} medicamento{encounter.prescriptions.length !== 1 ? "s" : ""}
              {encounter.recommendations.length > 0 && ` · ${encounter.recommendations.length} indicacion${encounter.recommendations.length !== 1 ? "es" : ""}`}
              {encounter.labOrders.length > 0 && ` · ${encounter.labOrders.length} examen${encounter.labOrders.length !== 1 ? "es" : ""}`}
            </p>
          </div>
        </div>
        <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="border-t border-border/60" />
        <div className="px-5 pb-5 pt-4 space-y-4">

          {/* Prescriptions */}
          {encounter.prescriptions.length > 0 && (
            <div>
              <SectionHeader icon={Pill} label="Medicamentos" count={encounter.prescriptions.length} />
              <div className="ml-6 space-y-1.5">
                {encounter.prescriptions.map((rx, j) => (
                  <div key={j} className="text-sm">
                    <span className="font-medium text-foreground">{rx.medication}</span>
                    <span className="text-muted-foreground"> · {rx.dosage} · {rx.frequency} · {rx.duration}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {encounter.recommendations.length > 0 && (
            <>
              <div className="border-t border-border/60" />
              <div>
                <SectionHeader icon={ClipboardList} label="Indicaciones" count={encounter.recommendations.length} />
                <ul className="ml-6 space-y-1">
                  {encounter.recommendations.map((rec, j) => (
                    <li key={j} className="text-sm text-foreground flex items-start gap-2">
                      <span className="mt-1.5 h-1 w-1 rounded-full bg-muted-foreground shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {/* Lab Orders */}
          {encounter.labOrders.length > 0 && (
            <>
              <div className="border-t border-border/60" />
              <div>
                <SectionHeader icon={FlaskConical} label="Exámenes solicitados" count={encounter.labOrders.length} />
                <ul className="ml-6 space-y-1">
                  {encounter.labOrders.map((order, j) => (
                    <li key={j} className="text-sm text-foreground flex items-start gap-2">
                      <span className="mt-1.5 h-1 w-1 rounded-full bg-muted-foreground shrink-0" />
                      {order}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {/* Notes */}
          {encounter.notes && (
            <>
              <div className="border-t border-border/60" />
              <div className="flex items-start gap-2">
                <StickyNote className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <p className="text-sm text-muted-foreground">{encounter.notes}</p>
              </div>
            </>
          )}

          {/* Actions */}
          <div className="border-t border-border/60" />
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" disabled className="gap-1.5 text-muted-foreground text-xs h-8 px-2">
              <FileText className="h-3.5 w-3.5" /> Descargar PDF
            </Button>
            <Button variant="ghost" size="sm" disabled className="gap-1.5 text-muted-foreground text-xs h-8 px-2">
              <Share2 className="h-3.5 w-3.5" /> Compartir
            </Button>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default ConsultationCard;
