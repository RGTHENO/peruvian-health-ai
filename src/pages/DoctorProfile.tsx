import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Star, MapPin, Video, Building2, Clock, Shield, ArrowLeft, Calendar, Globe } from "lucide-react";
import { doctors } from "@/data/doctors";
import { toast } from "sonner";

const timeSlots = ["09:00", "09:30", "10:00", "10:30", "11:00", "14:00", "14:30", "15:00", "15:30", "16:00"];

const DoctorProfile = () => {
  const { id } = useParams();
  const doctor = doctors.find((d) => d.id === id);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  if (!doctor) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Médico no encontrado.</p>
        </div>
        <Footer />
      </div>
    );
  }

  const initials = doctor.name.split(" ").filter((_, i) => i === 0 || i === 2).map((n) => n[0]).join("");

  const handleConfirmBooking = () => {
    setShowConfirmDialog(false);
    toast.success(`¡Cita reservada con ${doctor.name} a las ${selectedSlot}!`, {
      description: "Recibirás un correo de confirmación con los detalles.",
    });
    setSelectedSlot(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container py-8">
        <Link to="/directorio" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Volver al directorio
        </Link>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Profile info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex gap-5">
                  <Avatar className="h-20 w-20 border-2 border-primary/20">
                    <AvatarFallback className="bg-accent text-accent-foreground text-xl font-semibold">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold text-foreground font-serif">{doctor.name}</h1>
                    <p className="text-primary font-medium">{doctor.specialty}</p>
                    <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Star className="h-4 w-4 text-primary fill-primary" /> {doctor.rating} ({doctor.reviews} reseñas)</span>
                      <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {doctor.location}</span>
                      <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {doctor.experience} años de exp.</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {doctor.modality.includes("presencial") && (
                        <Badge variant="outline" className="gap-1"><Building2 className="h-3 w-3" /> Presencial</Badge>
                      )}
                      {doctor.modality.includes("telemedicina") && (
                        <Badge variant="outline" className="gap-1"><Video className="h-3 w-3" /> Telemedicina</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-lg">Acerca del Doctor</CardTitle></CardHeader>
              <CardContent><p className="text-muted-foreground leading-relaxed">{doctor.bio}</p></CardContent>
            </Card>

            <div className="grid gap-4 sm:grid-cols-2">
              <Card>
                <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Shield className="h-4 w-4 text-primary" /> Seguros Aceptados</CardTitle></CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {doctor.insurance.map((ins) => (
                    <Badge key={ins} variant="secondary">{ins}</Badge>
                  ))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Globe className="h-4 w-4 text-primary" /> Idiomas</CardTitle></CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {doctor.languages.map((lang) => (
                    <Badge key={lang} variant="secondary">{lang}</Badge>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Booking sidebar */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="h-5 w-5 text-primary" /> Reservar Cita
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">Precio de consulta</p>
                  <p className="text-3xl font-bold text-foreground">S/ {doctor.price}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Horarios disponibles — Hoy</p>
                  <div className="grid grid-cols-2 gap-2">
                    {timeSlots.map((slot) => (
                      <Button
                        key={slot}
                        variant={selectedSlot === slot ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedSlot(slot)}
                        className="text-xs"
                      >
                        {slot}
                      </Button>
                    ))}
                  </div>
                </div>

                <Button className="w-full" size="lg" disabled={!selectedSlot} onClick={() => setShowConfirmDialog(true)}>
                  {selectedSlot ? `Reservar a las ${selectedSlot}` : "Selecciona un horario"}
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  Pago seguro con Culqi, Yape o Plin
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Booking Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif">Confirmar Reserva</DialogTitle>
            <DialogDescription>Revisa los detalles de tu cita antes de confirmar.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Médico</span>
              <span className="font-medium text-foreground">{doctor.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Especialidad</span>
              <span className="font-medium text-foreground">{doctor.specialty}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Horario</span>
              <span className="font-medium text-foreground">Hoy a las {selectedSlot}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Precio</span>
              <span className="font-bold text-foreground">S/ {doctor.price}</span>
            </div>
            <div className="border-t border-border pt-3">
              <p className="text-xs text-muted-foreground">Métodos de pago: Culqi · Yape · Plin</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>Cancelar</Button>
            <Button onClick={handleConfirmBooking}>Confirmar Reserva</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default DoctorProfile;
