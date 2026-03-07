import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { addDays, format, subDays } from "date-fns";
import { es } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  MapPin,
  Stethoscope,
  Video,
} from "lucide-react";
import { fetchDoctorAgenda } from "@/lib/api";

const statusColors: Record<string, string> = {
  confirmada: "border-l-primary bg-primary/5",
  "en-espera": "border-l-chart-4 bg-chart-4/5",
  cancelada: "border-l-destructive bg-destructive/5 opacity-60",
  completada: "border-l-muted bg-muted/10",
};

const statusBadge: Record<string, string> = {
  confirmada: "bg-primary/10 text-primary border-primary/20",
  "en-espera": "bg-chart-4/10 text-chart-4 border-chart-4/20",
  cancelada: "bg-destructive/10 text-destructive border-destructive/20",
  completada: "bg-muted/20 text-muted-foreground border-border",
};

const statusLabels: Record<string, string> = {
  confirmada: "Confirmada",
  "en-espera": "En espera",
  cancelada: "Cancelada",
  completada: "Completada",
};

const timeSlots = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
];

const toAppointmentDate = (value: string) => new Date(`${value}T12:00:00`);

const pickInitialAgendaDate = (appointments?: Array<{ date: string }>) => {
  if (!appointments?.length) return new Date();

  const today = format(new Date(), "yyyy-MM-dd");
  const uniqueDates = [...new Set(appointments.map((appointment) => appointment.date))].sort();
  const nextRelevantDate = uniqueDates.find((date) => date >= today) ?? uniqueDates[uniqueDates.length - 1];
  return toAppointmentDate(nextRelevantDate);
};

const DoctorAgenda = () => {
  const agendaQuery = useQuery({
    queryKey: ["doctor-agenda"],
    queryFn: () => fetchDoctorAgenda(),
  });

  const fallbackDate = useMemo(
    () => pickInitialAgendaDate(agendaQuery.data),
    [agendaQuery.data],
  );

  const [selectedDate, setSelectedDate] = useState<Date>(fallbackDate);

  useEffect(() => {
    if (!agendaQuery.data?.length) {
      setSelectedDate(fallbackDate);
      return;
    }

    const selectedDateKey = format(selectedDate, "yyyy-MM-dd");
    const hasSelectedDate = agendaQuery.data.some(
      (appointment) => appointment.date === selectedDateKey,
    );

    if (!hasSelectedDate) {
      setSelectedDate(fallbackDate);
    }
  }, [agendaQuery.data, fallbackDate, selectedDate]);

  if (agendaQuery.isLoading) {
    return <div className="p-4 lg:p-8 text-muted-foreground">Cargando agenda…</div>;
  }

  if (agendaQuery.isError || !agendaQuery.data) {
    return (
      <div className="p-4 lg:p-8 text-destructive">
        No se pudo cargar la agenda del médico.
      </div>
    );
  }

  const appointmentList = agendaQuery.data;
  const dateStr = format(selectedDate, "yyyy-MM-dd");
  const dateLabel = format(selectedDate, "EEEE d 'de' MMMM, yyyy", { locale: es });

  const dayAppointments = appointmentList
    .filter((appointment) => appointment.date === dateStr)
    .sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground font-serif">
          Agenda
        </h1>
        <p className="text-muted-foreground mt-1">Gestiona tu horario de consultas</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
        <Card className="h-fit">
          <CardContent className="p-3">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="pointer-events-auto"
            />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-11 w-11"
                aria-label="Ver día anterior"
                onClick={() => setSelectedDate((date) => subDays(date, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-base sm:text-lg font-semibold text-foreground capitalize">
                {dateLabel}
              </h2>
              <Button
                variant="outline"
                size="icon"
                className="h-11 w-11"
                aria-label="Ver día siguiente"
                onClick={() => setSelectedDate((date) => addDays(date, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Badge variant="secondary">
              {dayAppointments.filter((appointment) => appointment.status !== "cancelada").length} citas
            </Badge>
          </div>

          <Card>
            <CardContent className="p-0 divide-y divide-border">
              {timeSlots.map((slot) => {
                const appointment = dayAppointments.find((item) => item.time === slot);
                return (
                  <div
                    key={slot}
                    className={`flex min-h-[72px] flex-col sm:flex-row ${
                      appointment ? `border-l-4 ${statusColors[appointment.status]}` : ""
                    }`}
                  >
                    <div className="flex w-full flex-shrink-0 items-center justify-center border-b border-border py-2 sm:w-20 sm:border-b-0 sm:border-r sm:py-0">
                      <span className="text-sm font-mono text-muted-foreground">{slot}</span>
                    </div>
                    <div className="flex-1 p-3">
                      {appointment ? (
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div className="min-w-0">
                            <p className="font-medium text-foreground text-sm truncate">
                              {appointment.patientName}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {appointment.reason}
                            </p>
                            {appointment.notes && (
                              <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                                <FileText className="h-3 w-3" />
                                <span className="truncate">{appointment.notes}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {appointment.duration}m
                            </div>
                            {appointment.type === "telemedicina" ? (
                              <Video className="h-4 w-4 text-primary" />
                            ) : (
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                            )}
                            <Badge
                              variant="outline"
                              className={`text-xs ${statusBadge[appointment.status]}`}
                            >
                              {statusLabels[appointment.status]}
                            </Badge>
                            {appointment.status !== "cancelada" &&
                              appointment.status !== "completada" && (
                                <Button asChild size="sm" variant="default" className="h-9 gap-1 text-xs">
                                  <Link to={`/doctor/portal/consulta/${appointment.id}`}>
                                    <Stethoscope className="h-3 w-3" /> Atender
                                  </Link>
                                </Button>
                              )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center h-full">
                          <span className="text-xs text-muted-foreground/50">Disponible</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DoctorAgenda;
