import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { User, Bell, Shield } from "lucide-react";

const DoctorSettings = () => {
  const [notifications, setNotifications] = useState({
    newAppointment: true,
    reminder: true,
    cancellation: true,
    marketing: false,
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Perfil actualizado correctamente");
  };

  const handleSaveNotifications = () => {
    toast.success("Preferencias de notificación guardadas");
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-serif text-foreground">Configuración</h1>
        <p className="text-muted-foreground">Administra tu perfil y preferencias</p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" /> Información del Perfil
          </CardTitle>
          <CardDescription>Actualiza tu información profesional visible para los pacientes</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre completo</Label>
                <Input id="name" defaultValue="Dra. María Elena Rodríguez" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialty">Especialidad</Label>
                <Input id="specialty" defaultValue="Cardiología" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input id="email" type="email" defaultValue="maria.rodriguez@saludpe.pe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input id="phone" defaultValue="+51 999 888 777" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Biografía profesional</Label>
              <textarea
                id="bio"
                rows={3}
                defaultValue="Cardióloga con 15 años de experiencia en el diagnóstico y tratamiento de enfermedades cardiovasculares."
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
            <Button type="submit">Guardar cambios</Button>
          </form>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" /> Notificaciones
          </CardTitle>
          <CardDescription>Configura qué notificaciones deseas recibir</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { key: "newAppointment" as const, label: "Nueva cita agendada", desc: "Recibe una notificación cuando un paciente agenda una cita" },
            { key: "reminder" as const, label: "Recordatorios de citas", desc: "Recordatorio 30 minutos antes de cada consulta" },
            { key: "cancellation" as const, label: "Cancelaciones", desc: "Notificación cuando un paciente cancela su cita" },
            { key: "marketing" as const, label: "Novedades de SaludPe", desc: "Recibe información sobre nuevas funcionalidades" },
          ].map((item, i, arr) => (
            <div key={item.key}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <Switch
                  checked={notifications[item.key]}
                  onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, [item.key]: checked }))}
                />
              </div>
              {i < arr.length - 1 && <Separator className="mt-4" />}
            </div>
          ))}
          <Button onClick={handleSaveNotifications} className="mt-2">Guardar preferencias</Button>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" /> Seguridad
          </CardTitle>
          <CardDescription>Gestiona la seguridad de tu cuenta</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="current-password">Contraseña actual</Label>
              <Input id="current-password" type="password" placeholder="••••••••" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">Nueva contraseña</Label>
              <Input id="new-password" type="password" placeholder="••••••••" />
            </div>
          </div>
          <Button onClick={() => toast.success("Contraseña actualizada correctamente")}>
            Cambiar contraseña
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorSettings;
