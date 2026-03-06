import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Star, MapPin, Video, Building2, Clock, Shield, ArrowLeft, Calendar, Globe } from "lucide-react";
import { doctors } from "@/data/doctors";
import { toast } from "sonner";

const timeSlots = ["09:00", "09:30", "10:00", "10:30", "11:00", "14:00", "14:30", "15:00", "15:30", "16:00"];

const DoctorProfile = () => {
  const { id } = useParams();
  const doctor = doctors.find((d) => d.id === id);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedModality, setSelectedModality] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Auto-select modality if doctor only supports one
  useEffect(() => {
    if (doctor && doctor.modality.length === 1) {
      setSelectedModality(doctor.modality[0]);
    }
  }, [doctor]);

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
    const modalityMessage = selectedModality === "presencial"
      ? `Te esperamos en ${doctor.location}. Llega 10 min antes.`
      : "Recibirás el enlace de WhatsApp videollamada 15 min antes de tu cita.";
    toast.success(`¡Cita reservada con ${doctor.name} a las ${selectedSlot}!`, {
      description: modalityMessage,
    });
    setSelectedSlot(null);
    if (doctor.modality.length > 1) setSelectedModality(null);
  };

  const canBook = selectedSlot && selectedModality;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main id="main-content" tabIndex={-1} className="flex-1 container py-6 sm:py-8">
        <Link to="/directorio" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Volver al directorio
        </Link>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Profile info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:gap-5">
                  <Avatar className="h-20 w-20 border-2 border-primary/20">
                    <AvatarFallback className="bg-accent text-accent-foreground text-xl font-semibold">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h1 className="text-xl sm:text-2xl font-bold text-foreground font-serif">{doctor.name}</h1>
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

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
            <Card className="lg:sticky lg:top-24">
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
                        className="h-10 text-xs"
                      >
                        {slot}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Modality selection — shown after selecting a time slot */}
                {selectedSlot && (
                  <div className="space-y-2 pt-2 border-t border-border">
                    <p className="text-sm font-medium text-foreground">Modalidad de consulta</p>
                    {doctor.modality.length === 1 ? (
                      <div className="flex items-center gap-2 rounded-md border border-border p-3 bg-accent/50">
                        {doctor.modality[0] === "presencial" ? (
                          <>
                            <Building2 className="h-4 w-4 text-primary shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-foreground">Presencial</p>
                              <p className="text-xs text-muted-foreground">En consultorio · {doctor.location}</p>
                            </div>
                          </>
                        ) : (
                          <>
                            <Video className="h-4 w-4 text-primary shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-foreground">Virtual</p>
                              <p className="text-xs text-muted-foreground">Videollamada por WhatsApp</p>
                            </div>
                          </>
                        )}
                      </div>
                    ) : (
                      <RadioGroup
                        value={selectedModality || ""}
                        onValueChange={setSelectedModality}
                        className="gap-2"
                      >
                        {doctor.modality.includes("presencial") && (
                          <Label
                            htmlFor="mod-presencial"
                            className={`flex items-center gap-3 rounded-md border p-3 cursor-pointer transition-colors ${
                              selectedModality === "presencial" ? "border-primary bg-accent" : "border-border hover:bg-accent/50"
                            }`}
                          >
                            <RadioGroupItem value="presencial" id="mod-presencial" />
                            <Building2 className="h-4 w-4 text-primary shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-foreground">Presencial</p>
                              <p className="text-xs text-muted-foreground">En consultorio · {doctor.location}</p>
                            </div>
                          </Label>
                        )}
                        {doctor.modality.includes("telemedicina") && (
                          <Label
                            htmlFor="mod-virtual"
                            className={`flex items-center gap-3 rounded-md border p-3 cursor-pointer transition-colors ${
                              selectedModality === "telemedicina" ? "border-primary bg-accent" : "border-border hover:bg-accent/50"
                            }`}
                          >
                            <RadioGroupItem value="telemedicina" id="mod-virtual" />
                            <Video className="h-4 w-4 text-primary shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-foreground">Virtual</p>
                              <p className="text-xs text-muted-foreground">Videollamada por WhatsApp</p>
                            </div>
                          </Label>
                        )}
                      </RadioGroup>
                    )}
                  </div>
                )}

                <Button className="w-full" size="lg" disabled={!canBook} onClick={() => setShowConfirmDialog(true)}>
                  {canBook ? `Reservar a las ${selectedSlot}` : selectedSlot ? "Selecciona la modalidad" : "Selecciona un horario"}
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
            <div className="flex justify-between items-start text-sm">
              <span className="text-muted-foreground">Modalidad</span>
              <span className="font-medium text-foreground text-right flex items-center gap-1.5">
                {selectedModality === "presencial" ? (
                  <>
                    <Building2 className="h-3.5 w-3.5 text-primary" />
                    Presencial
                  </>
                ) : (
                  <>
                    <Video className="h-3.5 w-3.5 text-primary" />
                    Virtual
                  </>
                )}
              </span>
            </div>
            {selectedModality === "presencial" ? (
              <div className="rounded-md bg-accent/50 p-3 text-xs text-muted-foreground flex items-start gap-2">
                <MapPin className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                <span>Consultorio en {doctor.location}. Llega 10 minutos antes de tu cita.</span>
              </div>
            ) : (
              <div className="rounded-md bg-accent/50 p-3 text-xs text-muted-foreground flex items-start gap-2">
                <Video className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                <span>Recibirás un enlace de WhatsApp videollamada al número registrado, 15 minutos antes de tu cita.</span>
              </div>
            )}
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
