import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Copy,
  Globe,
  Mail,
  MapPin,
  MessageCircle,
  Send,
  Shield,
  Star,
  Video,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { ApiError } from "@/lib/api-client";
import type { Appointment } from "@/data/appointments";
import {
  createAppointment,
  fetchDoctorAvailability,
  fetchDoctorDetail,
} from "@/lib/api";
import { getDoctorAvatarUrl } from "@/lib/doctor-avatar";

const DoctorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [selectedDate, setSelectedDate] = useState<string | null>(() => searchParams.get("date"));
  const [selectedSlot, setSelectedSlot] = useState<string | null>(() => searchParams.get("slot"));
  const [selectedModality, setSelectedModality] = useState<string | null>(() =>
    searchParams.get("modality"),
  );
  const [bookingReason, setBookingReason] = useState(() => searchParams.get("reason") ?? "");
  const [bookingNotes, setBookingNotes] = useState(() => searchParams.get("notes") ?? "");
  const [showConfirmDialog, setShowConfirmDialog] = useState(() =>
    searchParams.get("confirm") === "1",
  );
  const [bookingReceipt, setBookingReceipt] = useState<Appointment | null>(null);

  const doctorQuery = useQuery({
    queryKey: ["doctor", id],
    queryFn: () => fetchDoctorDetail(id!),
    enabled: Boolean(id),
  });

  const availabilityQuery = useQuery({
    queryKey: ["doctor-availability", id],
    queryFn: () => fetchDoctorAvailability(id!),
    enabled: Boolean(id),
  });

  const doctor = doctorQuery.data;
  const availability = useMemo(
    () => availabilityQuery.data ?? [],
    [availabilityQuery.data],
  );

  useEffect(() => {
    if (!doctor || selectedModality) return;
    if (doctor.modality.length === 1) {
      setSelectedModality(doctor.modality[0]);
    }
  }, [doctor, selectedModality]);

  useEffect(() => {
    if (!availability.length) return;

    const selectedDateExists = selectedDate
      ? availability.some((slot) => slot.date === selectedDate)
      : false;

    if (!selectedDate || !selectedDateExists) {
      setSelectedDate(availability[0].date);
    }
  }, [availability, selectedDate]);

  const selectedAvailability = useMemo(
    () => availability.find((slot) => slot.date === selectedDate) ?? null,
    [availability, selectedDate],
  );

  useEffect(() => {
    if (availabilityQuery.isLoading) return;

    if (!availability.length) {
      setSelectedSlot(null);
      return;
    }

    if (!selectedAvailability) {
      setSelectedSlot(null);
      return;
    }

    if (selectedSlot && !selectedAvailability.slots.includes(selectedSlot)) {
      setSelectedSlot(null);
    }
  }, [availability.length, availabilityQuery.isLoading, selectedAvailability, selectedSlot]);

  const bookingMutation = useMutation({
    mutationFn: createAppointment,
    onSuccess: (appointment) => {
      queryClient.invalidateQueries({ queryKey: ["doctor-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["doctor-agenda"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success(`¡Cita reservada con ${doctor?.name}!`, {
        description: `Solicitud registrada para el ${appointment.date} a las ${appointment.time}.`,
      });
      setShowConfirmDialog(false);
      setBookingReceipt(appointment);
      setSelectedSlot(null);
      setBookingReason("");
      setBookingNotes("");
      if (doctor?.modality.length && doctor.modality.length > 1) {
        setSelectedModality(null);
      }
      navigate(`/doctor/${doctor?.id}`, { replace: true });
    },
    onError: (error) => {
      const description =
        error instanceof ApiError ? error.message : "No se pudo registrar la cita.";
      toast.error("No fue posible reservar la cita", { description });
    },
  });

  if (doctorQuery.isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          Cargando perfil médico…
        </div>
        <Footer />
      </div>
    );
  }

  if (!doctor || doctorQuery.isError) {
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

  const initials = doctor.name
    .split(" ")
    .filter((_, index) => index === 0 || index === 2)
    .map((part) => part[0])
    .join("");

  const canBook =
    Boolean(selectedDate) &&
    Boolean(selectedSlot) &&
    Boolean(selectedModality) &&
    bookingReason.trim().length >= 3;

  const selectedDateLabel = selectedDate
    ? format(new Date(`${selectedDate}T12:00:00`), "EEEE d 'de' MMMM", { locale: es })
    : null;

  const buildRedirectPath = () => {
    const params = new URLSearchParams();
    if (selectedDate) params.set("date", selectedDate);
    if (selectedSlot) params.set("slot", selectedSlot);
    if (selectedModality) params.set("modality", selectedModality);
    if (bookingReason.trim()) params.set("reason", bookingReason.trim());
    if (bookingNotes.trim()) params.set("notes", bookingNotes.trim());
    params.set("confirm", "1");
    return `/doctor/${doctor.id}?${params.toString()}`;
  };

  const handleConfirmBooking = () => {
    if (!selectedDate || !selectedSlot || !selectedModality) return;

    if (!user) {
      toast.info("Inicia sesión como paciente para reservar la cita.");
      navigate(
        `/iniciar-sesion?role=patient&redirect=${encodeURIComponent(buildRedirectPath())}`,
      );
      return;
    }

    if (user.role !== "patient" || !user.patient_id) {
      toast.error("Solo una cuenta de paciente puede reservar citas.");
      navigate(user.role === "doctor" ? "/doctor/portal" : "/iniciar-sesion");
      return;
    }

    bookingMutation.mutate({
      doctorId: doctor.id,
      patientId: user.patient_id,
      date: selectedDate,
      time: selectedSlot,
      type: selectedModality as "presencial" | "telemedicina",
      reason: bookingReason.trim(),
      notes: bookingNotes.trim() || undefined,
    });
  };

  const handleCopyJoinLink = async () => {
    const joinUrl = bookingReceipt?.delivery?.access.joinUrl;
    if (!joinUrl) return;

    try {
      await navigator.clipboard.writeText(joinUrl);
      toast.success("Enlace copiado");
    } catch {
      toast.error("No se pudo copiar el enlace");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main id="main-content" tabIndex={-1} className="flex-1 container py-6 sm:py-8">
        <Link
          to="/directorio"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Volver al directorio
        </Link>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:gap-5">
                  <Avatar className="h-20 w-20 border-2 border-primary/20">
                    <AvatarImage
                      src={getDoctorAvatarUrl(doctor)}
                      alt={`Foto de perfil de ${doctor.name}`}
                      className="object-cover object-center"
                    />
                    <AvatarFallback className="bg-accent text-accent-foreground text-xl font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h1 className="text-xl sm:text-2xl font-bold text-foreground font-serif">
                      {doctor.name}
                    </h1>
                    <p className="text-primary font-medium">{doctor.specialty}</p>
                    <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-primary fill-primary" />
                        {doctor.rating} ({doctor.reviews} reseñas)
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" /> {doctor.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" /> {doctor.experience} años de exp.
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {doctor.modality.includes("presencial") && (
                        <Badge variant="outline" className="gap-1">
                          <Building2 className="h-3 w-3" /> Presencial
                        </Badge>
                      )}
                      {doctor.modality.includes("telemedicina") && (
                        <Badge variant="outline" className="gap-1">
                          <Video className="h-3 w-3" /> Telemedicina
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Acerca del Doctor</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{doctor.bio}</p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" /> Seguros Aceptados
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {doctor.insurance.map((insurance) => (
                    <Badge key={insurance} variant="secondary">
                      {insurance}
                    </Badge>
                  ))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Globe className="h-4 w-4 text-primary" /> Idiomas
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {doctor.languages.map((language) => (
                    <Badge key={language} variant="secondary">
                      {language}
                    </Badge>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>

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
                  <p className="text-sm font-medium text-foreground mb-2">Fechas disponibles</p>
                  {availabilityQuery.isLoading ? (
                    <p className="text-sm text-muted-foreground">Consultando agenda…</p>
                  ) : availability.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No hay horarios disponibles por el momento.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {availability.map((slotGroup) => (
                        <Button
                          key={slotGroup.date}
                          type="button"
                          variant={selectedDate === slotGroup.date ? "default" : "outline"}
                          className="h-auto justify-start px-3 py-2 text-left"
                          onClick={() => setSelectedDate(slotGroup.date)}
                        >
                          <div>
                            <p className="text-sm font-medium capitalize">
                              {format(new Date(`${slotGroup.date}T12:00:00`), "EEE d MMM", {
                                locale: es,
                              })}
                            </p>
                            <p className="text-xs opacity-80">{slotGroup.slots.length} horarios</p>
                          </div>
                        </Button>
                      ))}
                    </div>
                  )}
                </div>

                {selectedAvailability && (
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2">
                      Horarios disponibles {selectedDateLabel ? `· ${selectedDateLabel}` : ""}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedAvailability.slots.map((slot) => (
                        <Button
                          key={slot}
                          type="button"
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
                )}

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
                              <p className="text-xs text-muted-foreground">
                                En consultorio · {doctor.location}
                              </p>
                            </div>
                          </>
                        ) : (
                          <>
                            <Video className="h-4 w-4 text-primary shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-foreground">Virtual</p>
                              <p className="text-xs text-muted-foreground">
                                Videollamada por WhatsApp
                              </p>
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
                              selectedModality === "presencial"
                                ? "border-primary bg-accent"
                                : "border-border hover:bg-accent/50"
                            }`}
                          >
                            <RadioGroupItem value="presencial" id="mod-presencial" />
                            <Building2 className="h-4 w-4 text-primary shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-foreground">Presencial</p>
                              <p className="text-xs text-muted-foreground">
                                En consultorio · {doctor.location}
                              </p>
                            </div>
                          </Label>
                        )}
                        {doctor.modality.includes("telemedicina") && (
                          <Label
                            htmlFor="mod-virtual"
                            className={`flex items-center gap-3 rounded-md border p-3 cursor-pointer transition-colors ${
                              selectedModality === "telemedicina"
                                ? "border-primary bg-accent"
                                : "border-border hover:bg-accent/50"
                            }`}
                          >
                            <RadioGroupItem value="telemedicina" id="mod-virtual" />
                            <Video className="h-4 w-4 text-primary shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-foreground">Virtual</p>
                              <p className="text-xs text-muted-foreground">
                                Videollamada por WhatsApp
                              </p>
                            </div>
                          </Label>
                        )}
                      </RadioGroup>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="booking-reason">Motivo de consulta</Label>
                  <Input
                    id="booking-reason"
                    value={bookingReason}
                    onChange={(event) => setBookingReason(event.target.value)}
                    placeholder={`Ej. Consulta de ${doctor.specialty.toLowerCase()}`}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="booking-notes">Notas opcionales</Label>
                  <Textarea
                    id="booking-notes"
                    rows={3}
                    value={bookingNotes}
                    onChange={(event) => setBookingNotes(event.target.value)}
                    placeholder="Antecedentes o detalle breve para el médico"
                  />
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  disabled={!canBook}
                  onClick={() => setShowConfirmDialog(true)}
                >
                  {canBook
                    ? `Reservar a las ${selectedSlot}`
                    : "Selecciona fecha, horario y motivo"}
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  Pago seguro con Culqi, Yape o Plin
                </p>
                {selectedModality && (
                  <div className="rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
                    {selectedModality === "telemedicina"
                      ? "Cuando confirmes la reserva enviaremos el enlace de teleconsulta por email y WhatsApp. Telegram queda activo solo si el paciente vinculó su usuario."
                      : "Cuando confirmes la reserva enviaremos por email y WhatsApp la dirección, fecha y recordatorios de la cita."}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif">Confirmar Reserva</DialogTitle>
            <DialogDescription>
              Revisa los detalles de tu cita antes de confirmar.
            </DialogDescription>
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
              <span className="text-muted-foreground">Fecha y hora</span>
              <span className="font-medium text-foreground text-right">
                {selectedDateLabel} {selectedSlot ? `· ${selectedSlot}` : ""}
              </span>
            </div>
            <div className="flex justify-between items-start text-sm gap-4">
              <span className="text-muted-foreground">Modalidad</span>
              <span className="font-medium text-foreground text-right">
                {selectedModality === "presencial" ? "Presencial" : "Virtual"}
              </span>
            </div>
            <div className="flex justify-between items-start text-sm gap-4">
              <span className="text-muted-foreground">Motivo</span>
              <span className="font-medium text-foreground text-right">{bookingReason}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Precio</span>
              <span className="font-bold text-foreground">S/ {doctor.price}</span>
            </div>
            <div className="border-t border-border pt-3">
              <p className="text-xs text-muted-foreground">
                {selectedModality === "presencial"
                  ? `Consultorio en ${doctor.location}. Llega 10 minutos antes de tu cita.`
                  : "Recibirás un enlace de videollamada antes de tu atención."}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmBooking} disabled={bookingMutation.isPending}>
              {bookingMutation.isPending ? "Reservando…" : "Confirmar Reserva"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(bookingReceipt)}
        onOpenChange={(open) => {
          if (!open) setBookingReceipt(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-serif">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              Reserva registrada
            </DialogTitle>
            <DialogDescription>
              Esta es la forma en la que SaludPe entregará la información de tu cita.
            </DialogDescription>
          </DialogHeader>

          {bookingReceipt?.delivery && (
            <div className="space-y-4 text-sm">
              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <p className="font-medium text-foreground">Acceso a la cita</p>
                <p className="mt-1 text-muted-foreground">
                  {bookingReceipt.delivery.access.instructions}
                </p>
                {bookingReceipt.delivery.access.location && (
                  <p className="mt-2 font-medium text-foreground">
                    Dirección: {bookingReceipt.delivery.access.location}
                  </p>
                )}
                {bookingReceipt.delivery.access.joinUrl && (
                  <div className="mt-3 space-y-2">
                    <p className="font-medium text-foreground">Enlace de teleconsulta</p>
                    <div className="flex gap-2">
                      <Input readOnly value={bookingReceipt.delivery.access.joinUrl} />
                      <Button type="button" variant="outline" onClick={handleCopyJoinLink}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-border p-3">
                  <p className="flex items-center gap-2 font-medium text-foreground">
                    <Mail className="h-4 w-4 text-primary" />
                    Email
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {bookingReceipt.delivery.email.destination}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {bookingReceipt.delivery.email.summary}
                  </p>
                </div>

                <div className="rounded-xl border border-border p-3">
                  <p className="flex items-center gap-2 font-medium text-foreground">
                    <MessageCircle className="h-4 w-4 text-primary" />
                    WhatsApp
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {bookingReceipt.delivery.whatsapp.destination ?? "No configurado"}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {bookingReceipt.delivery.whatsapp.summary}
                  </p>
                </div>

                <div className="rounded-xl border border-border p-3">
                  <p className="flex items-center gap-2 font-medium text-foreground">
                    <Send className="h-4 w-4 text-primary" />
                    Telegram
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {bookingReceipt.delivery.telegram.destination ?? "No vinculado"}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {bookingReceipt.delivery.telegram.summary}
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setBookingReceipt(null)}>Entendido</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default DoctorProfile;
