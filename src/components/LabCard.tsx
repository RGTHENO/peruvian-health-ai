import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FlaskConical, FileText, CheckCircle2, AlertTriangle } from "lucide-react";
import type { LabEncounter } from "@/data/encounters";

interface Props {
  encounter: LabEncounter;
}

const LabCard = ({ encounter }: Props) => {
  const abnormalCount = encounter.labResults.filter((r) => r.status === "Anormal").length;

  return (
    <Card>
      <CardContent className="p-5 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <FlaskConical className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">
            Resultados ({encounter.labResults.length} exámenes)
          </span>
          {abnormalCount > 0 && (
            <Badge variant="destructive" className="text-xs ml-auto">
              {abnormalCount} anormal{abnormalCount > 1 ? "es" : ""}
            </Badge>
          )}
        </div>

        {encounter.orderedBy && (
          <p className="text-xs text-muted-foreground">Solicitado por: {encounter.orderedBy}</p>
        )}

        <div className="space-y-2">
          {encounter.labResults.map((lr, j) => (
            <div key={j} className="flex items-start gap-3 text-sm">
              {lr.status === "Normal" ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
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
      </CardContent>

      <CardFooter className="px-5 pb-4 pt-0 gap-2">
        <Button variant="outline" size="sm" disabled className="gap-1.5">
          <FileText className="h-3.5 w-3.5" /> Descargar PDF
        </Button>
      </CardFooter>
    </Card>
  );
};

export default LabCard;
