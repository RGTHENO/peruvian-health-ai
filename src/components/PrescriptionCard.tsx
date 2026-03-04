import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Pill, ClipboardList, Calendar, ChevronDown } from "lucide-react";
import type { ConsultationEncounter } from "@/data/encounters";

interface Props {
  encounter: ConsultationEncounter;
  defaultOpen?: boolean;
}

const PrescriptionCard = ({ encounter, defaultOpen = false }: Props) => {
  return (
    <Collapsible defaultOpen={defaultOpen} className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <CollapsibleTrigger className="flex items-center justify-between w-full p-4 text-left hover:bg-muted/50 transition-colors rounded-lg group">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Calendar className="h-3 w-3" />
            <span>{encounter.date}</span>
            <span>·</span>
            <span className="font-medium text-foreground">{encounter.doctor}</span>
            <Badge variant="outline" className="text-xs">{encounter.specialty}</Badge>
          </div>
          <span className="text-xs text-muted-foreground">
            {encounter.prescriptions.length} medicamento{encounter.prescriptions.length !== 1 ? "s" : ""}
            {encounter.recommendations.length > 0 && ` · ${encounter.recommendations.length} indicacion${encounter.recommendations.length !== 1 ? "es" : ""}`}
          </span>
        </div>
        <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 transition-transform group-data-[state=open]:rotate-180" />
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="px-5 pb-5 space-y-4">
          <Separator />

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
              <Separator />
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <ClipboardList className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">Indicaciones</span>
                </div>
                <ul className="ml-6 space-y-1">
                  {encounter.recommendations.map((rec, j) => (
                    <li key={j} className="text-sm text-foreground flex items-start gap-2">
                      <span className="text-muted-foreground mt-1.5 h-1 w-1 rounded-full bg-muted-foreground shrink-0" />
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
