import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Pill, ClipboardList, Calendar, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ConsultationEncounter } from "@/data/encounters";

interface Props {
  encounter: ConsultationEncounter;
  defaultOpen?: boolean;
}

const PrescriptionCard = ({ encounter, defaultOpen = false }: Props) => {
  return (
    <Collapsible defaultOpen={defaultOpen} className="rounded-2xl border border-border/60 bg-card overflow-hidden">
      <CollapsibleTrigger className="flex items-center justify-between w-full px-5 py-4 text-left hover:bg-muted/30 transition-colors group">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Pill className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-foreground">{encounter.doctor}</span>
              <Badge variant="outline" className="text-xs">{encounter.specialty}</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              <Calendar className="inline h-3 w-3 mr-1 -mt-0.5" />
              {encounter.date} · {encounter.prescriptions.length} medicamento{encounter.prescriptions.length !== 1 ? "s" : ""}
              {encounter.recommendations.length > 0 && ` · ${encounter.recommendations.length} indicacion${encounter.recommendations.length !== 1 ? "es" : ""}`}
            </p>
          </div>
        </div>
        <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="border-t border-border/60" />
        <div className="px-5 pb-5 pt-4 space-y-4">

          {encounter.prescriptions.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Pill className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">Medicamentos</span>
              </div>
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

          {encounter.recommendations.length > 0 && (
            <>
              <div className="border-t border-border/60" />
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <ClipboardList className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">Indicaciones</span>
                </div>
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
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default PrescriptionCard;
