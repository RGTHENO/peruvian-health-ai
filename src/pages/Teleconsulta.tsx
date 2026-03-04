import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Video, Shield, Clock, MessageCircle } from "lucide-react";

const benefits = [
  { icon: Video, title: "Consulta desde casa", desc: "Conéctate con tu médico por videollamada HD sin salir de tu hogar." },
  { icon: Clock, title: "Disponibilidad inmediata", desc: "Horarios flexibles, incluyendo noches y fines de semana." },
  { icon: Shield, title: "Segura y privada", desc: "Cifrado de extremo a extremo y cumplimiento de la Ley 29733." },
  { icon: MessageCircle, title: "Chat integrado", desc: "Envía fotos, documentos y recibe recetas digitales al instante." },
];

const Teleconsulta = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-primary py-16">
          <div className="container text-center">
            <Video className="h-12 w-12 text-primary-foreground mx-auto mb-4" />
            <h1 className="text-4xl font-bold font-serif text-primary-foreground">Teleconsulta Médica</h1>
            <p className="mt-4 text-lg text-primary-foreground/80 max-w-2xl mx-auto">
              Consulta con los mejores especialistas del Perú desde la comodidad de tu hogar. 
              Atención médica de calidad, sin filas ni desplazamientos.
            </p>
            <Link to="/directorio?modalidad=telemedicina" className="inline-block mt-8">
              <Button size="lg" variant="secondary">
                Ver médicos con telemedicina
              </Button>
            </Link>
          </div>
        </section>

        {/* Benefits */}
        <section className="container py-20">
          <h2 className="text-3xl font-bold font-serif text-foreground text-center mb-12">
            ¿Por qué elegir teleconsulta?
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((b) => (
              <Card key={b.title} className="text-center">
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-lg bg-accent flex items-center justify-center mx-auto mb-4">
                    <b.icon className="h-6 w-6 text-accent-foreground" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{b.title}</h3>
                  <p className="text-sm text-muted-foreground">{b.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="bg-muted/50 py-16">
          <div className="container">
            <h2 className="text-3xl font-bold font-serif text-foreground text-center mb-12">
              ¿Cómo funciona?
            </h2>
            <div className="grid gap-8 md:grid-cols-3 max-w-3xl mx-auto">
              {[
                { step: "1", title: "Elige tu médico", desc: "Busca por especialidad y selecciona un doctor con modalidad telemedicina." },
                { step: "2", title: "Reserva tu cita", desc: "Escoge el horario que más te convenga y realiza el pago en línea." },
                { step: "3", title: "Conéctate", desc: "Recibe el enlace de videollamada y consulta con tu médico al instante." },
              ].map((s) => (
                <div key={s.step} className="text-center">
                  <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold mx-auto mb-3">
                    {s.step}
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{s.title}</h3>
                  <p className="text-sm text-muted-foreground">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Teleconsulta;
