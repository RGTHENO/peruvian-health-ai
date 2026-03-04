import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Brain, ShieldCheck, MessageCircle, Stethoscope, CalendarCheck, Star, Users, UserCheck } from "lucide-react";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import heroImage from "@/assets/hero-health.jpg";

const features = [
  { icon: Search, title: "Directorio Inteligente", desc: "Encuentra médicos por especialidad, seguro, ubicación y disponibilidad en tiempo real." },
  { icon: Brain, title: "IA Clínica Ambient", desc: "Transcripción automática de consultas con IA para que el médico se enfoque en ti." },
  { icon: MessageCircle, title: "Chatbot WhatsApp & Telegram", desc: "Agenda citas, recibe recordatorios y pre-triaje inteligente por mensajería." },
  { icon: Stethoscope, title: "Historial Médico Portátil", desc: "Tu expediente clínico digital con estándar FHIR, accesible desde cualquier lugar." },
  { icon: CalendarCheck, title: "Citas y Pagos en Línea", desc: "Reserva y paga con Culqi, Yape o Plin de forma rápida y segura." },
  { icon: ShieldCheck, title: "Cumplimiento Legal", desc: "Datos protegidos bajo la Ley 29733, cifrado de extremo a extremo." },
];

const stats = [
  { icon: UserCheck, value: "+500", label: "Médicos verificados" },
  { icon: Users, value: "+10,000", label: "Pacientes atendidos" },
  { icon: Star, value: "4.8", label: "Estrellas promedio" },
];

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

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Doctora peruana consultando con paciente" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/60 to-foreground/30" />
        </div>
        <div className="relative container py-24 md:py-36">
          <div className="max-w-xl">
            <h1 className="text-4xl md:text-5xl font-bold font-serif text-primary-foreground leading-tight">
              Tu salud, conectada con los mejores médicos del Perú
            </h1>
            <p className="mt-4 text-lg text-primary-foreground/80">
              Encuentra especialistas, agenda citas al instante y accede a tu historial médico desde cualquier dispositivo.
            </p>

            {/* Quick Search */}
            <form onSubmit={handleSearch} className="mt-8 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por especialidad o nombre..."
                  className="pl-10 h-12 bg-background/95 border-background/20"
                />
              </div>
              <Button type="submit" size="lg" className="h-12 px-6">
                Buscar
              </Button>
            </form>

            <div className="flex flex-wrap gap-3 mt-4">
              <Link to="/iniciar-sesion">
                <Button size="lg" className="bg-primary-foreground text-foreground hover:bg-primary-foreground/90">
                  Soy Médico
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Stats */}
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

      {/* Features */}
      <section ref={featuresRef} className="container py-20 reveal-on-scroll">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-bold font-serif text-foreground">
            Una plataforma integral para la salud
          </h2>
          <p className="mt-3 text-muted-foreground">
            Tecnología de punta con IA, interoperabilidad y pagos locales para transformar la atención médica en el Perú.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <Card key={f.title} className="group hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="h-11 w-11 rounded-lg bg-accent flex items-center justify-center mb-4">
                  <f.icon className="h-5 w-5 text-accent-foreground" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-16">
        <div className="container text-center">
          <h2 className="text-3xl font-bold font-serif text-primary-foreground">
            ¿Listo para una mejor atención médica?
          </h2>
          <p className="mt-3 text-primary-foreground/80 max-w-lg mx-auto">
            Únete a miles de peruanos que ya confían en SaludPe para cuidar su salud.
          </p>
          <div className="flex justify-center gap-3 mt-8">
            <Link to="/directorio">
              <Button size="lg" variant="secondary">
                Explorar Directorio
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
