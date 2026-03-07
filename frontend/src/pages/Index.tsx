import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Brain, ShieldCheck, MessageCircle, Stethoscope, CalendarCheck, Star, Users, UserCheck, ArrowRight } from "lucide-react";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import heroImage from "@/assets/hero-health.jpg";
import heroImageWebp768 from "@/assets/hero-health-768.webp";
import heroImageWebp1280 from "@/assets/hero-health-1280.webp";
import heroImageWebp1920 from "@/assets/hero-health-1920.webp";

const features = [
  {
    icon: Search,
    title: "Directorio Inteligente",
    desc: "Encuentra médicos por especialidad, seguro y disponibilidad en tiempo real.",
    href: "/directorio",
    cta: "Explorar médicos",
    featured: true,
  },
  {
    icon: Brain,
    title: "IA Clínica Ambient",
    desc: "Transcripción automática para consultas más precisas y menos carga operativa.",
    href: "/doctor/portal",
    cta: "Ver portal médico",
    featured: true,
  },
  {
    icon: MessageCircle,
    title: "Chatbot WhatsApp & Telegram",
    desc: "Agenda citas y recibe recordatorios por mensajería con pre-triaje inteligente.",
    href: "/teleconsulta",
    cta: "Ver teleconsulta",
  },
  {
    icon: Stethoscope,
    title: "Historial Médico Portátil",
    desc: "Tu expediente digital FHIR, disponible en cualquier momento y dispositivo.",
    href: "/historial",
    cta: "Ver historial",
  },
  {
    icon: CalendarCheck,
    title: "Citas y Pagos en Línea",
    desc: "Reserva y paga en minutos con Culqi, Yape o Plin.",
    href: "/directorio",
    cta: "Reservar cita",
  },
  {
    icon: ShieldCheck,
    title: "Cumplimiento Legal",
    desc: "Protección de datos bajo Ley 29733 y cifrado de extremo a extremo.",
    href: "/privacidad",
    cta: "Revisar privacidad",
  },
];

const stats = [
  { icon: UserCheck, value: "+500", label: "Médicos verificados" },
  { icon: Users, value: "+10,000", label: "Pacientes atendidos" },
  { icon: Star, value: "4.8", label: "Estrellas promedio" },
];

const heroFetchPriority = { fetchpriority: "high" } as const;

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const featuresRef = useScrollReveal();
  const statsRef = useScrollReveal();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/directorio?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate("/directorio");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main id="main-content" tabIndex={-1} className="flex-1">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0">
            <picture className="block h-full w-full">
              <source
                type="image/webp"
                srcSet={`${heroImageWebp768} 768w, ${heroImageWebp1280} 1280w, ${heroImageWebp1920} 1920w`}
                sizes="100vw"
              />
              <img
                src={heroImage}
                alt="Doctora peruana consultando con paciente"
                width={1920}
                height={1088}
                decoding="async"
                loading="eager"
                sizes="100vw"
                className="h-full w-full object-cover"
                {...heroFetchPriority}
              />
            </picture>
            <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/60 to-foreground/30" />
          </div>
          <div className="relative container py-16 sm:py-20 md:py-36">
            <div className="max-w-xl">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif text-primary-foreground leading-tight text-pretty">
                Tu salud, conectada con los mejores médicos del Perú
              </h1>
              <p className="mt-4 text-base sm:text-lg text-primary-foreground/80">
                Encuentra especialistas, agenda citas al instante y accede a tu historial médico desde cualquier dispositivo.
              </p>

              <form onSubmit={handleSearch} className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-2">
                <div className="relative flex-1">
                  <label htmlFor="home-search" className="sr-only">
                    Buscar por especialidad o nombre
                  </label>
                  <Search aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="home-search"
                    name="q"
                    type="search"
                    autoComplete="off"
                    spellCheck={false}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar por especialidad o nombre…"
                    className="pl-10 h-12 bg-background/95 border-background/20"
                  />
                </div>
                <Button type="submit" size="lg" className="h-12 w-full px-6 sm:w-auto">
                  Buscar
                </Button>
              </form>
            </div>
          </div>
        </section>

        <section ref={statsRef} className="border-b border-border bg-card reveal-on-scroll">
          <div className="container py-12">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
              {stats.map((stat) => (
                <div key={stat.label} className="flex flex-col items-center gap-2">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <stat.icon className="h-6 w-6 text-primary" />
                  </div>
                  <span className="text-3xl font-bold text-foreground">{stat.value}</span>
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section ref={featuresRef} className="container py-14 sm:py-20 reveal-on-scroll" aria-labelledby="features-title">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">Funcionalidades clave</p>
            <h2 id="features-title" className="mt-3 text-2xl sm:text-3xl font-bold font-serif text-foreground text-pretty">
              Una plataforma integral para la salud
            </h2>
            <p className="mt-3 text-muted-foreground text-pretty">
              Tecnología de punta con IA, interoperabilidad y pagos locales para transformar la atención médica en el Perú.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <Link
                key={f.title}
                to={f.href}
                className="group block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-label={`${f.cta}: ${f.title}`}
              >
                <Card className={`h-full border transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-lg ${
                  f.featured ? "border-primary/30 bg-accent/20" : "border-border"
                }`}>
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-accent">
                      <f.icon className="h-5 w-5 text-accent-foreground" />
                    </div>
                    <h3 className="mb-2 font-semibold text-foreground">{f.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary transition-transform group-hover:translate-x-0.5">
                      {f.cta}
                      <ArrowRight aria-hidden="true" className="h-4 w-4" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <section className="bg-primary py-12 sm:py-16">
          <div className="container text-center">
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-primary-foreground">
              Encuentra tu médico ideal
            </h2>
            <p className="mt-3 text-primary-foreground/80 max-w-lg mx-auto">
              Más de 500 especialistas verificados listos para atenderte.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button asChild size="lg" variant="secondary" className="h-12 w-full sm:w-auto">
                <Link to="/directorio">
                  <Search className="h-4 w-4" />
                  Buscar Especialista
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary" className="h-12 w-full sm:w-auto">
                <Link to="/doctor/portal">
                  <Stethoscope className="h-4 w-4" />
                  Soy Médico
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
