import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FlaskConical, FileText, CheckCircle2, AlertTriangle, ChevronDown, Calendar } from "lucide-react";
import type { LabEncounter, LabResult } from "@/data/encounters";

interface Props {
  encounter: LabEncounter;
  defaultOpen?: boolean;
}

/** Parse a reference range like "< 130", "> 40", "70 – 100" into min/max numbers */
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

const RangeBar = ({ result, referenceRange, unit }: { result: string; referenceRange: string; unit: string }) => {
  const numResult = parseFloat(result);
  const { min, max } = parseRange(referenceRange);

  if (isNaN(numResult) || min === null || max === null) return null;

  // Create a visual scale with padding on both sides
  const range = max - min;
  const scaleMin = Math.max(0, min - range * 0.4);
  const scaleMax = max + range * 0.4;
  const scaleRange = scaleMax - scaleMin;

  // Positions as percentages
  const normalStart = ((min - scaleMin) / scaleRange) * 100;
  const normalWidth = ((max - min) / scaleRange) * 100;
  const dotPosition = Math.min(Math.max(((numResult - scaleMin) / scaleRange) * 100, 2), 98);
  const isNormal = numResult >= min && numResult <= max;

  return (
    <div className="mt-2">
      <div className="relative h-3 rounded-full bg-destructive/15 overflow-hidden">
        {/* Normal range zone */}
        <div
          className="absolute top-0 bottom-0 bg-primary/20 rounded-full"
          style={{ left: `${normalStart}%`, width: `${normalWidth}%` }}
        />
        {/* Result dot */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 rounded-full border-2 border-background shadow-md ${
            isNormal ? "bg-primary" : "bg-destructive"
          }`}
          style={{ left: `${dotPosition}%`, transform: `translate(-50%, -50%)` }}
        />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-xs text-muted-foreground">{min} {unit}</span>
        <span className="text-xs text-muted-foreground">{max} {unit}</span>
      </div>
    </div>
  );
};

const LabResultItem = ({ lr }: { lr: LabResult }) => {
  const isNormal = lr.status === "Normal";
  const hasNumericResult = lr.unit !== "—" && !isNaN(parseFloat(lr.result));

  return (
    <div className={`rounded-lg border p-4 ${!isNormal ? "border-destructive/30 bg-destructive/5" : "border-border"}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          {isNormal ? (
            <CheckCircle2 className="h-6 w-6 text-primary shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="h-6 w-6 text-destructive shrink-0 mt-0.5" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-base font-semibold text-foreground">{lr.test}</p>
            {lr.unit !== "—" ? (
              <p className="text-lg font-bold text-foreground mt-0.5">
                {lr.result} <span className="text-sm font-normal text-muted-foreground">{lr.unit}</span>
              </p>
            ) : (
              <p className="text-lg font-bold text-foreground mt-0.5">{lr.result}</p>
            )}
            {lr.referenceRange !== "—" && (
              <p className="text-sm text-muted-foreground">Ref: {lr.referenceRange}</p>
            )}
          </div>
        </div>
        <Badge
          variant={isNormal ? "secondary" : "destructive"}
          className="text-sm px-3 py-1 shrink-0"
        >
          {isNormal ? "Normal" : "⚠ Atención"}
        </Badge>
      </div>

      {hasNumericResult && (
        <RangeBar result={lr.result} referenceRange={lr.referenceRange} unit={lr.unit} />
      )}
    </div>
  );
};

const LabCard = ({ encounter, defaultOpen = false }: Props) => {
  const normalCount = encounter.labResults.filter((r) => r.status === "Normal").length;
  const abnormalCount = encounter.labResults.filter((r) => r.status === "Anormal").length;

  return (
    <Collapsible defaultOpen={defaultOpen} className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <CollapsibleTrigger className="flex items-center justify-between w-full p-5 text-left hover:bg-muted/50 transition-colors rounded-lg group">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1.5">
            <Calendar className="h-4 w-4" />
            <span className="font-medium">{encounter.date}</span>
            <span>·</span>
            <FlaskConical className="h-4 w-4" />
            <span className="font-medium text-foreground">{encounter.lab}</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {normalCount > 0 && (
              <span className="text-sm text-primary flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" />
                {normalCount} normal{normalCount !== 1 ? "es" : ""}
              </span>
            )}
            {abnormalCount > 0 && (
              <span className="text-sm text-destructive flex items-center gap-1 font-semibold">
                <AlertTriangle className="h-4 w-4" />
                {abnormalCount} requiere{abnormalCount !== 1 ? "n" : ""} atención
              </span>
            )}
          </div>
          {encounter.orderedBy && (
            <p className="text-xs text-muted-foreground mt-1">Solicitado por: {encounter.orderedBy}</p>
          )}
        </div>
        <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0 transition-transform group-data-[state=open]:rotate-180" />
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="px-5 pb-5 space-y-3">
          <Separator />

          {/* Show abnormal results first for quick visibility */}
          {encounter.labResults
            .slice()
            .sort((a, b) => (a.status === "Anormal" ? -1 : 1) - (b.status === "Anormal" ? -1 : 1))
            .map((lr, j) => (
              <LabResultItem key={j} lr={lr} />
            ))}

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
