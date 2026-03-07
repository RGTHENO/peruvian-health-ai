export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviews: number;
  price: number;
  location: string;
  distance: string;
  available: boolean;
  modality: ("presencial" | "telemedicina")[];
  insurance: string[];
  languages: string[];
  bio: string;
  experience: number;
  avatar: string;
}

export const specialties = [
  "Medicina General",
  "Cardiología",
  "Dermatología",
  "Ginecología",
  "Pediatría",
  "Traumatología",
  "Neurología",
  "Oftalmología",
];

export const insurances = ["Rímac", "Pacífico", "Mapfre", "La Positiva", "SIS"];

export const doctors: Doctor[] = [
  {
    id: "1",
    name: "Dra. María Elena Quispe",
    specialty: "Cardiología",
    rating: 4.9,
    reviews: 234,
    price: 120,
    location: "San Isidro, Lima",
    distance: "2.3 km",
    available: true,
    modality: ["presencial", "telemedicina"],
    insurance: ["Rímac", "Pacífico"],
    languages: ["Español", "Quechua"],
    bio: "Cardióloga con 15 años de experiencia en el Instituto Nacional Cardiovascular. Especialista en ecocardiografía y prevención cardiovascular.",
    experience: 15,
    avatar: "",
  },
  {
    id: "2",
    name: "Dr. Carlos Huamán Rojas",
    specialty: "Medicina General",
    rating: 4.7,
    reviews: 189,
    price: 60,
    location: "Miraflores, Lima",
    distance: "1.1 km",
    available: true,
    modality: ["presencial", "telemedicina"],
    insurance: ["Rímac", "Mapfre", "SIS"],
    languages: ["Español"],
    bio: "Médico general dedicado a la atención primaria con enfoque preventivo. Atención integral para toda la familia.",
    experience: 10,
    avatar: "",
  },
  {
    id: "3",
    name: "Dra. Lucía Fernández Paredes",
    specialty: "Dermatología",
    rating: 4.8,
    reviews: 312,
    price: 100,
    location: "Surco, Lima",
    distance: "4.5 km",
    available: false,
    modality: ["presencial"],
    insurance: ["Pacífico", "La Positiva"],
    languages: ["Español", "Inglés"],
    bio: "Dermatóloga certificada con subespecialidad en dermatología estética y oncológica. Formación en Brasil y España.",
    experience: 12,
    avatar: "",
  },
  {
    id: "4",
    name: "Dr. Andrés Villanueva Soto",
    specialty: "Pediatría",
    rating: 4.9,
    reviews: 421,
    price: 80,
    location: "Jesús María, Lima",
    distance: "3.0 km",
    available: true,
    modality: ["presencial", "telemedicina"],
    insurance: ["Rímac", "Pacífico", "Mapfre"],
    languages: ["Español", "Inglés"],
    bio: "Pediatra con amplia experiencia en neonatología y desarrollo infantil. Atención cálida y personalizada para los más pequeños.",
    experience: 18,
    avatar: "",
  },
  {
    id: "5",
    name: "Dra. Rosa Mendoza Chávez",
    specialty: "Ginecología",
    rating: 4.6,
    reviews: 156,
    price: 110,
    location: "San Borja, Lima",
    distance: "5.2 km",
    available: true,
    modality: ["telemedicina"],
    insurance: ["Rímac", "SIS"],
    languages: ["Español", "Quechua", "Inglés"],
    bio: "Ginecóloga obstetra especializada en salud reproductiva y embarazo de alto riesgo. Comprometida con la salud de la mujer peruana.",
    experience: 20,
    avatar: "",
  },
  {
    id: "6",
    name: "Dr. Felipe Torres Luna",
    specialty: "Neurología",
    rating: 4.8,
    reviews: 98,
    price: 150,
    location: "La Molina, Lima",
    distance: "7.8 km",
    available: true,
    modality: ["presencial"],
    insurance: ["Pacífico", "Mapfre"],
    languages: ["Español", "Inglés"],
    bio: "Neurólogo con experiencia en epilepsia y trastornos del sueño. Investigador asociado en neurociencias.",
    experience: 14,
    avatar: "",
  },
];
