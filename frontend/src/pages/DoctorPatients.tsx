import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { fetchDoctorPatients } from "@/lib/api";

const DoctorPatients = () => {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const patientsQuery = useQuery({
    queryKey: ["doctor-patients", search],
    queryFn: () => fetchDoctorPatients(search || undefined),
  });

  const patients = patientsQuery.data ?? [];

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground font-serif">
          Pacientes
        </h1>
        <p className="text-muted-foreground mt-1">{patients.length} pacientes registrados</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, seguro o condición..."
          className="pl-10"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      {patientsQuery.isLoading ? (
        <p className="py-12 text-center text-muted-foreground">Cargando pacientes…</p>
      ) : patientsQuery.isError ? (
        <p className="py-12 text-center text-destructive">
          No se pudo cargar la lista de pacientes.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {patients.map((patient) => (
            <Card
              key={patient.id}
              className="cursor-pointer hover:border-primary/40 transition-colors"
              onClick={() => navigate(`/doctor/portal/pacientes/${patient.id}`)}
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                    {patient.name
                      .split(" ")
                      .slice(0, 2)
                      .map((part) => part[0])
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
                    {patient.conditions.map((condition) => (
                      <Badge key={condition} variant="secondary" className="text-xs">
                        {condition}
                      </Badge>
                    ))}
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-3">
                  Última visita: {patient.lastVisit || "Sin registro"}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!patientsQuery.isLoading && !patientsQuery.isError && patients.length === 0 && (
        <p className="text-center text-muted-foreground py-12">
          No se encontraron pacientes con ese criterio
        </p>
      )}
    </div>
  );
};

export default DoctorPatients;
