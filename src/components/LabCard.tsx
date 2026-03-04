import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FlaskConical, FileText, Check, AlertCircle, ChevronDown } from "lucide-react";
import type { LabEncounter, LabResult } from "@/data/encounters";

interface Props {
  encounter: LabEncounter;
  defaultOpen?: boolean;
}

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

function getStatusInfo(result: string, ref: string, status: string): { label: string; isNormal: boolean } {
  if (status === "Normal") return { label: "Normal", isNormal: true };
  const num = parseFloat(result);
  const { min, max } = parseRange(ref);
  if (isNaN(num) || min === null || max === null) return { label: "Revisar", isNormal: false };
  if (num > max) return { label: "Alto", isNormal: false };
  if (num < min) return { label: "Bajo", isNormal: false };
  return { label: "Revisar", isNormal: false };
}

const MiniBar = ({ result, referenceRange, isNormal }: { result: string; referenceRange: string; isNormal: boolean }) => {
  const num = parseFloat(result);
  const { min, max } = parseRange(referenceRange);
  if (isNaN(num) || min === null || max === null) return null;

  const idealMax = max > 0 ? max : min * 2;
  const pct = Math.min(Math.max((num / (idealMax * 1.4)) * 100, 5), 100);

  return (
    <div className="mt-3 relative">
      <div className="h-1.5 w-full rounded-full bg-border/60 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${isNormal ? "bg-primary" : "bg-destructive"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

const LabResultItem = ({ lr }: { lr: LabResult }) => {
  const hasNumeric = lr.unit !== "—" && !isNaN(parseFloat(lr.result));
  const { label, isNormal } = hasNumeric
    ? getStatusInfo(lr.result, lr.referenceRange, lr.status)
    : { label: lr.status === "Normal" ? "Normal" : "Revisar", isNormal: lr.status === "Normal" };
  const friendly = friendlyRange(lr.referenceRange, lr.unit);

  if (!hasNumeric) {
    return (
      <div className="flex items-center gap-3 py-3 px-4 rounded-lg border border-border/50 bg-card">
        <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <Check className="h-3.5 w-3.5 text-primary" />
        </div>
        <span className="text-sm font-medium text-foreground">{lr.test}</span>
        <span className="text-sm text-muted-foreground ml-auto">{lr.result}</span>
      </div>
    );
  }

  return (
    <div className={`rounded-xl p-5 border transition-colors ${
      !isNormal 
        ? "border-destructive/30 bg-destructive/[0.03]" 
        : "border-border/50 bg-card"
    }`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
            isNormal ? "bg-primary/10" : "bg-destructive/10"
          }`}>
            {isNormal ? (
              <Check className="h-4 w-4 text-primary" />
            ) : (
              <AlertCircle className="h-4 w-4 text-destructive" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-base font-semibold text-foreground">{lr.test}</p>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-bold text-foreground tracking-tight">{lr.result}</span>
              <span className="text-sm text-muted-foreground">{lr.unit}</span>
            </div>
            {friendly && (
              <p className="text-xs text-muted-foreground mt-1">
                Rango ideal: {friendly}
              </p>
            )}
          </div>
        </div>
        <span className={`text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md shrink-0 ${
          isNormal 
            ? "bg-primary/10 text-primary" 
            : "bg-destructive/10 text-destructive"
        }`}>
          {label}
        </span>
      </div>

      <MiniBar result={lr.result} referenceRange={lr.referenceRange} isNormal={isNormal} />
    </div>
  );
};

const LabCard = ({ encounter, defaultOpen = false }: Props) => {
  const normalCount = encounter.labResults.filter((r) => r.status === "Normal").length;
  const abnormalCount = encounter.labResults.filter((r) => r.status === "Anormal").length;
  const totalCount = encounter.labResults.length;

  return (
    <Collapsible defaultOpen={defaultOpen} className="rounded-xl border border-border/60 bg-card text-card-foreground shadow-sm overflow-hidden">
      <CollapsibleTrigger className="flex items-center justify-between w-full p-5 sm:p-6 text-left hover:bg-accent/30 transition-colors group">
        <div className="min-w-0 space-y-1.5">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <FlaskConical className="h-4.5 w-4.5 text-primary" />
            </div>
            <div>
              <p className="text-base font-bold text-foreground leading-tight">{encounter.date}</p>
              <p className="text-sm text-muted-foreground">{encounter.lab}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 pl-[46px] text-xs">
            <span className="text-muted-foreground">
              Dr. {encounter.orderedBy.replace("Dr. ", "")} · {totalCount} análisis
            </span>
            <div className="flex items-center gap-3">
              {normalCount > 0 && (
                <span className="text-primary font-medium flex items-center gap-1">
                  <Check className="h-3 w-3" />
                  {normalCount}
                </span>
              )}
              {abnormalCount > 0 && (
                <span className="text-destructive font-medium flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {abnormalCount}
                </span>
              )}
            </div>
          </div>
        </div>
        <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="px-5 sm:px-6 pb-5 sm:pb-6">
          <Separator className="mb-5" />
          <div className="space-y-3">
            {encounter.labResults
              .slice()
              .sort((a, b) => (a.status === "Anormal" ? -1 : 1) - (b.status === "Anormal" ? -1 : 1))
              .map((lr, j) => (
                <LabResultItem key={j} lr={lr} />
              ))}
          </div>
          <div className="pt-4">
            <Button variant="ghost" size="sm" disabled className="gap-1.5 text-muted-foreground text-xs">
              <FileText className="h-3.5 w-3.5" /> Descargar PDF
            </Button>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default LabCard;
