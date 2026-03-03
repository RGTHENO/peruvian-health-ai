import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Search, Phone, Mail, Calendar, Activity } from "lucide-react";
import { patients, appointments, type Patient } from "@/data/appointments";

const DoctorPatients = () => {
  const [search, setSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const filtered = useMemo(
    () =>
      patients.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.insurance.toLowerCase().includes(search.toLowerCase()) ||
          p.conditions.some((c) => c.toLowerCase().includes(search.toLowerCase()))
      ),
    [search]
  );

  const patientAppointments = useMemo(
    () =>
      selectedPatient
        ? appointments
            .filter((a) => a.patientId === selectedPatient.id)
            .sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`))
        : [],
    [selectedPatient]
  );

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground font-serif">Pacientes</h1>
        <p className="text-muted-foreground mt-1">
          {patients.length} pacientes registrados
        </p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, seguro o condición..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((patient) => (
          <Card
            key={patient.id}
            className="cursor-pointer hover:border-primary/40 transition-colors"
            onClick={() => setSelectedPatient(patient)}
          >
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                  {patient.name
                    .split(" ")
                    .slice(0, 2)
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground truncate">{patient.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {patient.age} años · {patient.gender === "M" ? "Masculino" : "Femenino"}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {patient.insurance}
                    </Badge>
                  </div>
                </div>
              </div>
              {patient.conditions.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {patient.conditions.map((c) => (
                    <Badge key={c} variant="secondary" className="text-xs">
                      {c}
                    </Badge>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-3">
                Última visita: {patient.lastVisit}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-muted-foreground py-12">
          No se encontraron pacientes con ese criterio
        </p>
      )}

      {/* Patient detail dialog */}
      <Dialog open={!!selectedPatient} onOpenChange={() => setSelectedPatient(null)}>
        <DialogContent className="max-w-lg">
          {selectedPatient && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                    {selectedPatient.name
                      .split(" ")
                      .slice(0, 2)
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  {selectedPatient.name}
                </DialogTitle>
                <DialogDescription>
                  {selectedPatient.age} años · {selectedPatient.gender === "M" ? "Masculino" : "Femenino"} · {selectedPatient.insurance}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    {selectedPatient.phone}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    {selectedPatient.email}
                  </div>
                </div>

                {selectedPatient.conditions.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2 flex items-center gap-1">
                      <Activity className="h-4 w-4" /> Condiciones
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {selectedPatient.conditions.map((c) => (
                        <Badge key={c} variant="secondary">
                          {c}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium text-foreground mb-2 flex items-center gap-1">
                    <Calendar className="h-4 w-4" /> Historial de citas
                  </p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {patientAppointments.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Sin citas registradas</p>
                    ) : (
                      patientAppointments.map((apt) => (
                        <div
                          key={apt.id}
                          className="flex items-center justify-between p-2 rounded border border-border text-sm"
                        >
                          <div>
                            <p className="font-medium text-foreground">
                              {apt.date} — {apt.time}
                            </p>
                            <p className="text-xs text-muted-foreground">{apt.reason}</p>
                          </div>
                          <Badge
                            variant="outline"
                            className="text-xs"
                          >
                            {apt.status}
                          </Badge>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DoctorPatients;
