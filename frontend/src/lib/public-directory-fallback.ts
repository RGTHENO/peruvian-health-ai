import { doctors as demoDoctors, type Doctor } from "@/data/doctors";
import { isHostedFallbackEnabled } from "@/lib/hosted-fallback";

export interface PublicDirectorySearchParams {
  q?: string;
  especialidad?: string;
  seguro?: string;
  modalidad?: string;
}

interface DirectoryFallbackResponse {
  total: number;
  doctors: Doctor[];
}

const sortDoctorsByName = (items: Doctor[]) =>
  [...items].sort((left, right) => left.name.localeCompare(right.name, "es"));

const normalizeSearchText = (value: string) =>
  value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

const matchesSearch = (doctor: Doctor, query?: string) => {
  if (!query?.trim()) return true;

  const normalizedQuery = normalizeSearchText(query.trim());
  return (
    normalizeSearchText(doctor.name).includes(normalizedQuery) ||
    normalizeSearchText(doctor.specialty).includes(normalizedQuery)
  );
};

export const isPublicDirectoryFallbackEnabled = () => isHostedFallbackEnabled();

export const getFallbackDirectoryResponse = (
  params: PublicDirectorySearchParams,
): DirectoryFallbackResponse => {
  const doctors = sortDoctorsByName(
    demoDoctors.filter((doctor) => {
      if (!matchesSearch(doctor, params.q)) return false;
      if (params.especialidad && doctor.specialty !== params.especialidad) return false;
      if (params.seguro && !doctor.insurance.includes(params.seguro)) return false;
      if (params.modalidad && !doctor.modality.includes(params.modalidad)) return false;
      return true;
    }),
  );

  return {
    total: doctors.length,
    doctors,
  };
};

export const getFallbackDoctorDetail = (doctorId: string) =>
  demoDoctors.find((doctor) => doctor.id === doctorId);
