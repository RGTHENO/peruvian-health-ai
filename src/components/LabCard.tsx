import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FlaskConical, FileText, CheckCircle2, AlertTriangle, ChevronDown } from "lucide-react";
import type { LabEncounter, LabResult } from "@/data/encounters";

interface Props {
  encounter: LabEncounter;
  defaultOpen?: boolean;
}

/** Convert technical reference range to friendly Spanish text */
function friendlyRange(ref: string, unit: string): string | null {
  if (ref === "—") return null;
  const ltMatch = ref.match(/^<\s*([\d.]+)/);
  if (ltMatch) return `menor a ${ltMatch[1]} ${unit}`;
  const gtMatch = ref.match(/^>\s*([\d.]+)/);
  if (gtMatch) return `mayor a ${gtMatch[1]} ${unit}`;
  const rangeMatch = ref.match(/([\d.]+)\s*[–-]\s*([\d.]+)/);
  if (rangeMatch) return `entre ${rangeMatch[1]} y ${rangeMatch[2]} ${unit}`;
  return ref;
}

/** Parse range for progress bar calculation */
function parseRange(ref: string): { min: number | null; max: number | null } {
  if (ref === "—") return { min: null, max: null };
  const ltMatch = ref.match(/^<\s*([\d.]+)/);
  if (ltMatch) return { min: 0, max: parseFloat(ltMatch[1]) };
  const gtMatch = ref.match(/^>\s*([\d.]+)/);
  if (gtMatch) return { min: parseFloat(gtMatch[1]), max: parseFloat(gtMatch[1]) * 2 };
  const rangeMatch = ref.match(/([\d.]+)\s*[–-]\s*([\d.]+)/);
  if (rangeMatch) return { min: parseFloat(rangeMatch[1]), max: parseFloat(rangeMatch[2]) };
  return { min: null, max: null };
}

/** Determine if result is HIGH or LOW relative to range */
function getStatusLabel(result: string, ref: string, status: string): string {
  if (status === "Normal") return "BIEN";
  const num = parseFloat(result);
  const { min, max } = parseRange(ref);
  if (isNaN(num) || min === null || max === null) return "ATENCIÓN";
  if (num > max) return "ALTO";
  if (num < min) return "BAJO";
  return "ATENCIÓN";
}

const SimpleProgressBar = ({ result, referenceRange, isNormal }: { result: string; referenceRange: string; isNormal: boolean }) => {
  const num = parseFloat(result);
  const { min, max } = parseRange(referenceRange);
  if (isNaN(num) || min === null || max === null) return null;

  // Calculate fill percentage (clamped 10-100)
  const idealMax = max > 0 ? max : min * 2;
  const pct = Math.min(Math.max((num / idealMax) * 100, 10), 100);

  return (
    <div className="mt-2 h-2.5 w-full rounded-full bg-muted overflow-hidden">
      <div
        className={`h-full rounded-full transition-all ${isNormal ? "bg-primary" : "bg-destructive"}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
};

const LabResultItem = ({ lr }: { lr: LabResult }) => {
  const isNormal = lr.status === "Normal";
  const hasNumeric = lr.unit !== "—" && !isNaN(parseFloat(lr.result));
  const friendly = friendlyRange(lr.referenceRange, lr.unit);
  const statusLabel = hasNumeric ? getStatusLabel(lr.result, lr.referenceRange, lr.status) : (isNormal ? "BIEN" : "ATENCIÓN");

  // Non-numeric simple result (e.g., "Hemograma completo: Normal")
  if (!hasNumeric) {
    return (
      <div className="flex items-center gap-3 py-3 px-4 rounded-lg bg-muted/30">
        <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
        <span className="text-base font-medium text-foreground">{lr.test}</span>
        <span className="text-sm text-muted-foreground">— {lr.result}</span>
      </div>
    );
  }

  return (
    <div className={`rounded-xl p-5 ${!isNormal ? "bg-destructive/5 border-2 border-destructive/20" : "bg-muted/30 border border-border"}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {isNormal ? (
            <CheckCircle2 className="h-6 w-6 text-primary shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="h-6 w-6 text-destructive shrink-0 mt-0.5" />
          )}
          <div>
            <p className="text-lg font-semibold text-foreground">{lr.test}</p>
            <p className="text-base text-foreground mt-1">
              Tu resultado: <span className="font-bold text-lg">{lr.result} {lr.unit}</span>
            </p>
            {friendly && (
              <p className="text-sm text-muted-foreground mt-0.5">
                Lo ideal: {friendly}
              </p>
            )}
          </div>
        </div>
        <span className={`text-sm font-bold px-3 py-1 rounded-full shrink-0 ${
          isNormal 
            ? "bg-primary/10 text-primary" 
            : "bg-destructive/10 text-destructive"
        }`}>
          {statusLabel}
        </span>
      </div>

      <SimpleProgressBar result={lr.result} referenceRange={lr.referenceRange} isNormal={isNormal} />
    </div>
  );
};

const LabCard = ({ encounter, defaultOpen = false }: Props) => {
  const normalCount = encounter.labResults.filter((r) => r.status === "Normal").length;
  const abnormalCount = encounter.labResults.filter((r) => r.status === "Anormal").length;
  const totalCount = encounter.labResults.length;

  return (
    <Collapsible defaultOpen={defaultOpen} className="rounded-xl border bg-card text-card-foreground shadow-sm">
      <CollapsibleTrigger className="flex items-center justify-between w-full p-6 text-left hover:bg-muted/50 transition-colors rounded-xl group">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <FlaskConical className="h-5 w-5 text-primary" />
            <span className="text-lg font-bold text-foreground">{encounter.date}</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-lg font-semibold text-foreground">{encounter.lab}</span>
          </div>
          <p className="text-sm text-muted-foreground mb-2">
            Solicitado por: {encounter.orderedBy} · {totalCount} exámenes
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            {normalCount > 0 && (
              <span className="text-sm text-primary flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="h-4 w-4" />
                {normalCount} bien
              </span>
            )}
            {abnormalCount > 0 && (
              <span className="text-sm text-destructive flex items-center gap-1.5 font-bold">
                <AlertTriangle className="h-4 w-4" />
                {abnormalCount} necesita atención
              </span>
            )}
          </div>
        </div>
        <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0 transition-transform group-data-[state=open]:rotate-180" />
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="px-6 pb-6 space-y-4">
          <Separator />

          {encounter.labResults
            .slice()
            .sort((a, b) => (a.status === "Anormal" ? -1 : 1) - (b.status === "Anormal" ? -1 : 1))
            .map((lr, j) => (
              <LabResultItem key={j} lr={lr} />
            ))}

          <div className="pt-2">
            <Button variant="outline" size="sm" disabled className="gap-1.5">
              <FileText className="h-4 w-4" /> Descargar PDF
            </Button>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default LabCard;
