import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Brain, ShieldCheck, MessageCircle, Stethoscope, CalendarCheck } from "lucide-react";
import heroImage from "@/assets/hero-health.jpg";

const features = [
  {
    icon: Search,
    title: "Directorio Inteligente",
    desc: "Encuentra médicos por especialidad, seguro, ubicación y disponibilidad en tiempo real.",
  },
  {
    icon: Brain,
    title: "IA Clínica Ambient",
    desc: "Transcripción automática de consultas con IA para que el médico se enfoque en ti.",
  },
  {
    icon: MessageCircle,
    title: "Chatbot WhatsApp & Telegram",
    desc: "Agenda citas, recibe recordatorios y pre-triaje inteligente por mensajería.",
  },
  {
    icon: Stethoscope,
    title: "Historial Médico Portátil",
    desc: "Tu expediente clínico digital con estándar FHIR, accesible desde cualquier lugar.",
  },
  {
    icon: CalendarCheck,
    title: "Citas y Pagos en Línea",
    desc: "Reserva y paga con Culqi, Yape o Plin de forma rápida y segura.",
  },
  {
    icon: ShieldCheck,
    title: "Cumplimiento Legal",
    desc: "Datos protegidos bajo la Ley 29733, cifrado de extremo a extremo.",
  },
];

const Index = () => {
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
            <div className="flex flex-wrap gap-3 mt-8">
              <Link to="/directorio">
                <Button size="lg">
                  Buscar Médico
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                Soy Médico
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container py-20">
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
