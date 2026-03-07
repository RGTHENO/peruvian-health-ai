import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ConsultationCard from "@/components/ConsultationCard";
import LabCard from "@/components/LabCard";
import SurgeryCard from "@/components/SurgeryCard";
import { Clock, FileText, FlaskConical, PanelRightClose, PanelRightOpen, Scissors, Stethoscope } from "lucide-react";
import type { ConsultationEncounter, LabEncounter, SurgeryEncounter } from "@/data/encounters";
import type { Patient } from "@/data/appointments";

interface PatientHistoryPanelProps {
  visible: boolean;
  isMobile: boolean;
  patient?: Patient;
  previousConsultations: ConsultationEncounter[];
  previousLabs: LabEncounter[];
  previousSurgeries: SurgeryEncounter[];
  onClose: () => void;
  onOpen: () => void;
}

const getEncounterKey = (
  prefix: string,
  date: string,
  label: string,
  index: number,
) => `${prefix}-${date}-${label}-${index}`;

const PatientHistoryPanel = ({
  visible,
  isMobile,
  patient,
  previousConsultations,
  previousLabs,
  previousSurgeries,
  onClose,
  onOpen,
}: PatientHistoryPanelProps) => {
  if (!visible) {
    return !isMobile ? (
      <Button
        variant="outline"
        size="sm"
        className="fixed right-6 top-20 z-10 gap-1.5"
        onClick={onOpen}
      >
        <PanelRightOpen className="h-4 w-4" /> Historial
      </Button>
    ) : null;
  }

  return (
    <div className="w-full lg:w-[40%] lg:sticky lg:top-4">
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4 text-primary" /> Historial del paciente
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="hidden h-7 w-7 lg:flex"
              aria-label="Ocultar panel de historial"
              onClick={onClose}
            >
              <PanelRightClose className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs defaultValue="consultas">
            <TabsList className="w-full rounded-none border-b bg-transparent px-2 py-2 sm:px-4">
              <TabsTrigger value="consultas" className="flex-1 gap-1 text-xs data-[state=active]:shadow-none">
                <Stethoscope className="h-3 w-3" /> Consultas ({previousConsultations.length})
              </TabsTrigger>
              <TabsTrigger value="laboratorio" className="flex-1 gap-1 text-xs data-[state=active]:shadow-none">
                <FlaskConical className="h-3 w-3" /> Labs ({previousLabs.length})
              </TabsTrigger>
              <TabsTrigger value="cirugias" className="flex-1 gap-1 text-xs data-[state=active]:shadow-none">
                <Scissors className="h-3 w-3" /> Cirugías ({previousSurgeries.length})
              </TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[50vh] min-h-[18rem] overscroll-contain sm:h-[calc(100vh-320px)] sm:min-h-[400px]">
              <div className="p-4">
                <TabsContent value="consultas" className="mt-0 space-y-3">
                  {previousConsultations.length === 0 ? (
                    <p className="py-6 text-center text-sm text-muted-foreground">Sin consultas previas</p>
                  ) : (
                    previousConsultations.map((encounter, index) => (
                      <div key={getEncounterKey("consultation", encounter.date, encounter.doctor, index)}>
                        <p className="mb-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {encounter.date} ·{" "}
                          <span className="font-medium text-foreground">{encounter.doctor}</span>
                        </p>
                        <ConsultationCard encounter={encounter} patient={patient} defaultOpen={index === 0} />
                      </div>
                    ))
                  )}
                </TabsContent>

                <TabsContent value="laboratorio" className="mt-0 space-y-3">
                  {previousLabs.length === 0 ? (
                    <p className="py-6 text-center text-sm text-muted-foreground">Sin resultados de laboratorio</p>
                  ) : (
                    previousLabs.map((encounter, index) => (
                      <div key={getEncounterKey("lab", encounter.date, encounter.lab, index)}>
                        <p className="mb-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {encounter.date} ·{" "}
                          <span className="font-medium text-foreground">{encounter.lab}</span>
                        </p>
                        <LabCard encounter={encounter} defaultOpen={index === 0} />
                      </div>
                    ))
                  )}
                </TabsContent>

                <TabsContent value="cirugias" className="mt-0 space-y-3">
                  {previousSurgeries.length === 0 ? (
                    <p className="py-6 text-center text-sm text-muted-foreground">Sin cirugías previas</p>
                  ) : (
                    previousSurgeries.map((encounter, index) => (
                      <div key={getEncounterKey("surgery", encounter.date, encounter.surgeon, index)}>
                        <p className="mb-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {encounter.date} ·{" "}
                          <span className="font-medium text-foreground">{encounter.surgeon}</span>
                        </p>
                        <SurgeryCard encounter={encounter} defaultOpen={index === 0} />
                      </div>
                    ))
                  )}
                </TabsContent>
              </div>
            </ScrollArea>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientHistoryPanel;
