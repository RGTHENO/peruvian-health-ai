import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DoctorCard from "@/components/DoctorCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { doctors, specialties, insurances } from "@/data/doctors";

const Directory = () => {
  const [searchParams] = useSearchParams();
  const initialModality = searchParams.get("modalidad") || "all";

  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("all");
  const [insurance, setInsurance] = useState("all");
  const [modality, setModality] = useState(initialModality);

  const filtered = useMemo(() => {
    return doctors.filter((d) => {
      if (search && !d.name.toLowerCase().includes(search.toLowerCase()) && !d.specialty.toLowerCase().includes(search.toLowerCase())) return false;
      if (specialty !== "all" && d.specialty !== specialty) return false;
      if (insurance !== "all" && !d.insurance.includes(insurance)) return false;
      if (modality !== "all" && !d.modality.includes(modality as any)) return false;
      return true;
    });
  }, [search, specialty, insurance, modality]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <div className="bg-card border-b border-border py-8">
          <div className="container">
            <h1 className="text-3xl font-bold text-foreground font-serif mb-2">Directorio Médico</h1>
            <p className="text-muted-foreground">Encuentra al mejor especialista cerca de ti</p>

            <div className="grid grid-cols-1 gap-3 mt-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre o especialidad..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={specialty} onValueChange={setSpecialty}>
                <SelectTrigger><SelectValue placeholder="Especialidad" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las especialidades</SelectItem>
                  {specialties.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={insurance} onValueChange={setInsurance}>
                <SelectTrigger><SelectValue placeholder="Seguro" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los seguros</SelectItem>
                  {insurances.map((i) => (
                    <SelectItem key={i} value={i}>{i}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={modality} onValueChange={setModality}>
                <SelectTrigger><SelectValue placeholder="Modalidad" /></SelectTrigger>
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
          <p className="text-sm text-muted-foreground mb-4">{filtered.length} médicos encontrados</p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((d) => (
              <DoctorCard key={d.id} doctor={d} />
            ))}
          </div>
          {filtered.length === 0 && (
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
