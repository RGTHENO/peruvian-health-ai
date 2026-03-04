import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FlaskConical, FileText, CheckCircle2, AlertTriangle, ChevronDown } from "lucide-react";
import type { LabEncounter } from "@/data/encounters";

interface Props {
  encounter: LabEncounter;
  defaultOpen?: boolean;
}

const LabCard = ({ encounter, defaultOpen = false }: Props) => {
  const abnormalCount = encounter.labResults.filter((r) => r.status === "Anormal").length;

  return (
    <Collapsible defaultOpen={defaultOpen} className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <CollapsibleTrigger className="flex items-center justify-between w-full p-4 text-left hover:bg-muted/50 transition-colors rounded-lg group">
        <div className="flex items-center gap-3 min-w-0">
          <FlaskConical className="h-4 w-4 text-primary shrink-0" />
          <div className="min-w-0">
            <span className="text-sm font-medium text-foreground">
              {encounter.labResults.length} exámenes realizados
            </span>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              {abnormalCount > 0 ? (
                <Badge variant="destructive" className="text-xs">
                  {abnormalCount} anormal{abnormalCount > 1 ? "es" : ""}
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-xs">Todos normales</Badge>
              )}
              {encounter.orderedBy && (
                <span className="text-xs text-muted-foreground">Solicitado por: {encounter.orderedBy}</span>
              )}
            </div>
          </div>
        </div>
        <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 transition-transform group-data-[state=open]:rotate-180" />
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="px-5 pb-5 space-y-3">
          <div className="border-t border-border" />
          <div className="space-y-2">
            {encounter.labResults.map((lr, j) => (
              <div key={j} className="flex items-start gap-3 text-sm">
                {lr.status === "Normal" ? (
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-foreground">{lr.test}</span>
                    <Badge variant={lr.status === "Normal" ? "secondary" : "destructive"} className="text-xs">
                      {lr.status}
                    </Badge>
                  </div>
                  {lr.unit !== "—" && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {lr.result} {lr.unit} (ref: {lr.referenceRange})
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-1">
            <Button variant="outline" size="sm" disabled className="gap-1.5">
              <FileText className="h-3.5 w-3.5" /> Descargar PDF
            </Button>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default LabCard;
