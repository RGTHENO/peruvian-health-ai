import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DoctorCard from "@/components/DoctorCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { specialties, insurances } from "@/data/doctors";
import { fetchDirectoryDoctors } from "@/lib/api";

const Directory = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("q") || "";
  const specialty = searchParams.get("especialidad") || "all";
  const insurance = searchParams.get("seguro") || "all";
  const modality = searchParams.get("modalidad") || "all";

  const updateSearchParam = (key: string, value: string) => {
    const nextParams = new URLSearchParams(searchParams);

    if (!value || value === "all") {
      nextParams.delete(key);
    } else {
      nextParams.set(key, value);
    }

    setSearchParams(nextParams, { replace: true });
  };

  const directoryQuery = useQuery({
    queryKey: ["directory", search, specialty, insurance, modality],
    queryFn: () =>
      fetchDirectoryDoctors({
        q: search || undefined,
        especialidad: specialty !== "all" ? specialty : undefined,
        seguro: insurance !== "all" ? insurance : undefined,
        modalidad: modality !== "all" ? modality : undefined,
      }),
  });

  const filtered = useMemo(() => directoryQuery.data?.doctors ?? [], [directoryQuery.data]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main id="main-content" tabIndex={-1} className="flex-1">
        <div className="bg-card border-b border-border py-8">
          <div className="container">
            <h1 className="text-3xl font-bold text-foreground font-serif mb-2">Directorio Médico</h1>
            <p className="text-muted-foreground">Encuentra al mejor especialista cerca de ti</p>

            <div className="grid grid-cols-1 gap-3 mt-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="relative">
                <Search aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  name="q"
                  type="search"
                  autoComplete="off"
                  spellCheck={false}
                  aria-label="Buscar por nombre o especialidad"
                  placeholder="Buscar por nombre o especialidad…"
                  className="pl-9"
                  value={search}
                  onChange={(e) => updateSearchParam("q", e.target.value)}
                />
              </div>
              <Select value={specialty} onValueChange={(value) => updateSearchParam("especialidad", value)}>
                <SelectTrigger aria-label="Filtrar por especialidad"><SelectValue placeholder="Especialidad" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las especialidades</SelectItem>
                  {specialties.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={insurance} onValueChange={(value) => updateSearchParam("seguro", value)}>
                <SelectTrigger aria-label="Filtrar por seguro"><SelectValue placeholder="Seguro" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los seguros</SelectItem>
                  {insurances.map((insuranceOption) => (
                    <SelectItem key={insuranceOption} value={insuranceOption}>{insuranceOption}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={modality} onValueChange={(value) => updateSearchParam("modalidad", value)}>
                <SelectTrigger aria-label="Filtrar por modalidad"><SelectValue placeholder="Modalidad" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las modalidades</SelectItem>
                  <SelectItem value="presencial">Presencial</SelectItem>
                  <SelectItem value="telemedicina">Telemedicina</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="container py-8">
          <p className="text-sm text-muted-foreground mb-4">
            {new Intl.NumberFormat("es-PE").format(filtered.length)} médicos encontrados
          </p>
          {directoryQuery.isLoading ? (
            <div className="py-16 text-center text-muted-foreground">Cargando directorio…</div>
          ) : directoryQuery.isError ? (
            <div className="py-16 text-center text-destructive">
              No se pudo cargar el directorio médico.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((d) => (
                <DoctorCard key={d.id} doctor={d} />
              ))}
            </div>
          )}
          {!directoryQuery.isLoading && !directoryQuery.isError && filtered.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              No se encontraron médicos con los filtros seleccionados.
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Directory;
