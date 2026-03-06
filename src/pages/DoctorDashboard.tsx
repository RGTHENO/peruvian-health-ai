import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, Users, Clock, CheckCircle, Video, MapPin, ArrowRight, Stethoscope } from "lucide-react";
import { patients } from "@/data/appointments";
import { getPreferredAppointmentDate, toAppointmentDate, useAppointments } from "@/lib/appointments-store";

const statusColors: Record<string, string> = {
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

const DoctorDashboard = () => {
  const appointmentList = useAppointments();
  const activeDate = useMemo(() => getPreferredAppointmentDate(appointmentList), [appointmentList]);
  const activeDateLabel = useMemo(() => {
    const formattedDate = new Intl.DateTimeFormat("es-PE", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(toAppointmentDate(activeDate));

    return formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
  }, [activeDate]);

  const todayAppointments = useMemo(
    () => appointmentList.filter((appointment) => appointment.date === activeDate),
    [activeDate, appointmentList]
  );

  const confirmed = todayAppointments.filter((a) => a.status === "confirmada").length;
  const pending = todayAppointments.filter((a) => a.status === "en-espera").length;
  const cancelled = todayAppointments.filter((a) => a.status === "cancelada").length;

  const stats = [
    { label: "Citas hoy", value: todayAppointments.length, icon: CalendarDays, color: "text-primary" },
    { label: "Confirmadas", value: confirmed, icon: CheckCircle, color: "text-primary" },
    { label: "En espera", value: pending, icon: Clock, color: "text-chart-4" },
    { label: "Total pacientes", value: patients.length, icon: Users, color: "text-accent-foreground" },
  ];

  const upcomingToday = todayAppointments
    .filter((a) => a.status !== "cancelada" && a.status !== "completada")
    .sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground font-serif">
          Buenos días, Dra. María Elena 👋
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          {activeDateLabel} · Tienes {todayAppointments.length} citas programadas
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-3 sm:p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-accent ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Upcoming appointments */}
      <Card>
        <CardHeader className="flex flex-col items-start gap-2 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-lg">Próximas citas de hoy</CardTitle>
          <Button asChild variant="ghost" size="sm" className="gap-1">
            <Link to="/doctor/portal/agenda">
              Ver agenda <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {upcomingToday.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">
              No hay más citas pendientes hoy
            </p>
          ) : (
            upcomingToday.map((apt) => (
              <div
                key={apt.id}
                className="flex flex-col gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-accent/50 sm:flex-row sm:items-center sm:gap-4"
              >
                <div className="min-w-[60px] text-left sm:text-center">
                  <p className="text-lg font-bold text-foreground">{apt.time}</p>
                  <p className="text-xs text-muted-foreground">{apt.duration} min</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{apt.patientName}</p>
                  <p className="text-sm text-muted-foreground truncate">{apt.reason}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {apt.type === "telemedicina" ? (
                    <Badge variant="outline" className="gap-1 text-xs">
                      <Video className="h-3 w-3" /> Virtual
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="gap-1 text-xs">
                      <MapPin className="h-3 w-3" /> Presencial
                    </Badge>
                  )}
                  <Badge variant="outline" className={`text-xs ${statusColors[apt.status]}`}>
                    {statusLabels[apt.status]}
                  </Badge>
                  <Button asChild size="sm" className="h-9 gap-1">
                    <Link to={`/doctor/portal/consulta/${apt.id}`}>
                      <Stethoscope className="h-3 w-3" /> Atender
                    </Link>
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Recent patients */}
      <Card>
        <CardHeader className="flex flex-col items-start gap-2 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-lg">Pacientes recientes</CardTitle>
          <Button asChild variant="ghost" size="sm" className="gap-1">
            <Link to="/doctor/portal/pacientes">
              Ver todos <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {patients.slice(0, 4).map((patient) => (
              <div
                key={patient.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-border"
              >
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                  {patient.name
                    .split(" ")
                    .slice(0, 2)
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm truncate">{patient.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {patient.age} años · {patient.insurance}
                  </p>
                </div>
                {patient.conditions.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {patient.conditions[0]}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorDashboard;
