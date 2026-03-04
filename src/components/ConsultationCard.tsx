import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Stethoscope, Pill, ClipboardList, FlaskConical, FileText, Share2, StickyNote } from "lucide-react";
import type { ConsultationEncounter } from "@/data/encounters";

interface Props {
  encounter: ConsultationEncounter;
}

const SectionHeader = ({ icon: Icon, label, count }: { icon: React.ElementType; label: string; count?: number }) => (
  <div className="flex items-center gap-2 mb-2">
    <Icon className="h-4 w-4 text-primary" />
    <span className="text-sm font-semibold text-foreground">
      {label}{count !== undefined ? ` (${count})` : ""}
    </span>
  </div>
);

const ConsultationCard = ({ encounter }: Props) => {
  return (
    <Card>
      <CardContent className="p-5 space-y-4">
        {/* Diagnosis */}
        <div>
          <SectionHeader icon={Stethoscope} label="Diagnóstico" />
          <div className="flex items-center gap-2 flex-wrap ml-6">
            <span className="text-sm text-foreground">{encounter.diagnosis}</span>
            <Badge variant={encounter.diagnosisStatus === "Activo" ? "default" : "secondary"} className="text-xs">
              {encounter.diagnosisStatus}
            </Badge>
          </div>
        </div>

        {/* Prescriptions */}
        {encounter.prescriptions.length > 0 && (
          <>
            <Separator />
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
          </>
        )}

        {/* Recommendations */}
        {encounter.recommendations.length > 0 && (
          <>
            <Separator />
            <div>
              <SectionHeader icon={ClipboardList} label="Indicaciones" count={encounter.recommendations.length} />
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

        {/* Lab Orders */}
        {encounter.labOrders.length > 0 && (
          <>
            <Separator />
            <div>
              <SectionHeader icon={FlaskConical} label="Exámenes solicitados" count={encounter.labOrders.length} />
              <ul className="ml-6 space-y-1">
                {encounter.labOrders.map((order, j) => (
                  <li key={j} className="text-sm text-foreground flex items-start gap-2">
                    <span className="text-muted-foreground mt-1.5 h-1 w-1 rounded-full bg-muted-foreground shrink-0" />
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
            <Separator />
            <div className="flex items-start gap-2 ml-0">
              <StickyNote className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <p className="text-sm text-muted-foreground">{encounter.notes}</p>
            </div>
          </>
        )}
      </CardContent>

      <CardFooter className="px-5 pb-4 pt-0 gap-2">
        <Button variant="outline" size="sm" disabled className="gap-1.5">
          <FileText className="h-3.5 w-3.5" /> Descargar PDF
        </Button>
        <Button variant="outline" size="sm" disabled className="gap-1.5">
          <Share2 className="h-3.5 w-3.5" /> Compartir
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ConsultationCard;
