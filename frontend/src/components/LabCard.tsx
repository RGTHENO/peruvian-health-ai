import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { FlaskConical, FileText, ChevronDown, TrendingUp, TrendingDown, CheckCircle2, AlertCircle } from "lucide-react";
import type { LabEncounter, LabResult } from "@/data/encounters";

interface Props {
  encounter: LabEncounter;
  defaultOpen?: boolean;
}

function friendlyRange(ref: string, unit: string): string | null {
  if (ref === "—") return null;
  const ltMatch = ref.match(/^<\s*([\d.]+)/);
  if (ltMatch) return `ideal < ${ltMatch[1]}`;
  const gtMatch = ref.match(/^>\s*([\d.]+)/);
  if (gtMatch) return `ideal > ${gtMatch[1]}`;
  const rangeMatch = ref.match(/([\d.]+)\s*[–-]\s*([\d.]+)/);
  if (rangeMatch) return `ideal ${rangeMatch[1]} – ${rangeMatch[2]}`;
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

function getStatusInfo(result: string, ref: string, status: string): { label: string; isNormal: boolean; direction: "up" | "down" | "ok" } {
  if (status === "Normal") return { label: "En rango", isNormal: true, direction: "ok" };
  const num = parseFloat(result);
  const { min, max } = parseRange(ref);
  if (isNaN(num) || min === null || max === null) return { label: "Revisar", isNormal: false, direction: "up" };
  if (num > max) return { label: "Elevado", isNormal: false, direction: "up" };
  if (num < min) return { label: "Bajo", isNormal: false, direction: "down" };
  return { label: "Revisar", isNormal: false, direction: "up" };
}

const LabResultRow = ({ lr }: { lr: LabResult }) => {
  const hasNumeric = lr.unit !== "—" && !isNaN(parseFloat(lr.result));
  const { label, isNormal, direction } = hasNumeric
    ? getStatusInfo(lr.result, lr.referenceRange, lr.status)
    : { label: lr.status === "Normal" ? "Normal" : "Revisar", isNormal: lr.status === "Normal", direction: "ok" as const };
  const friendly = friendlyRange(lr.referenceRange, lr.unit);

  return (
    <div className={`relative flex items-center justify-between gap-3 py-3 px-4 transition-colors ${
      !isNormal
        ? "border-l-[3px] border-amber-500 bg-amber-50/60 dark:bg-amber-950/20 pl-[calc(1rem-1px)]"
        : "border-l-[3px] border-transparent"
    }`}>
      {/* Left: name + value */}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground leading-tight">{lr.test}</p>
        {hasNumeric ? (
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-base font-bold text-foreground tabular-nums">{lr.result}</span>
            <span className="text-xs text-muted-foreground">{lr.unit}</span>
            {friendly && (
              <>
                <span className="text-muted-foreground/40 mx-0.5">·</span>
                <span className="text-xs text-muted-foreground">{friendly}</span>
              </>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground mt-0.5">{lr.result}</p>
        )}
      </div>

      {/* Right: status badge */}
      <div className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${
        isNormal
          ? "text-primary bg-primary/10"
          : "text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30"
      }`}>
        {!isNormal && direction === "up" && <TrendingUp className="h-3 w-3" />}
        {!isNormal && direction === "down" && <TrendingDown className="h-3 w-3" />}
        {isNormal && <CheckCircle2 className="h-3 w-3" />}
        {label}
      </div>
    </div>
  );
};

const LabCard = ({ encounter, defaultOpen = false }: Props) => {
  const normalCount = encounter.labResults.filter((r) => r.status === "Normal").length;
  const abnormalCount = encounter.labResults.filter((r) => r.status === "Anormal").length;

  return (
    <Collapsible defaultOpen={defaultOpen} className="rounded-2xl border border-border/60 bg-card overflow-hidden">
      <CollapsibleTrigger className="flex items-center justify-between w-full px-5 py-4 text-left hover:bg-muted/30 transition-colors group">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <FlaskConical className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground leading-tight">{encounter.lab}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {encounter.date} · {encounter.orderedBy}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <div className="hidden sm:flex items-center gap-2 text-xs font-medium">
            {normalCount > 0 && (
              <span className="flex items-center gap-1 text-primary">
                <CheckCircle2 className="h-3.5 w-3.5" />{normalCount}
              </span>
            )}
            {abnormalCount > 0 && (
              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                <AlertCircle className="h-3.5 w-3.5" />{abnormalCount}
              </span>
            )}
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="border-t border-border/60" />
        <div className="divide-y divide-border/60">
          {encounter.labResults
            .slice()
            .sort((a, b) => (a.status === "Anormal" ? -1 : 1) - (b.status === "Anormal" ? -1 : 1))
            .map((lr, j) => (
              <LabResultRow key={j} lr={lr} />
            ))}
        </div>
        <div className="px-4 py-2.5 border-t border-border/60">
          <Button variant="ghost" size="sm" disabled className="gap-1.5 text-muted-foreground text-xs h-8 px-2">
            <FileText className="h-3.5 w-3.5" /> Descargar PDF
          </Button>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default LabCard;
