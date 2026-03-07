import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, Shield, User } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useNotifications } from "@/contexts/NotificationContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  changePassword,
  fetchDoctorProfile,
  updateDoctorProfile,
  type DoctorSettingsProfile,
} from "@/lib/api";
import { ApiError } from "@/lib/api-client";
import type { NotificationPreferences } from "@/data/notifications";

const DoctorProfileForm = ({
  profile,
  isSaving,
  onSave,
}: {
  profile: DoctorSettingsProfile;
  isSaving: boolean;
  onSave: (profile: DoctorSettingsProfile) => void;
}) => {
  const [profileForm, setProfileForm] = useState(() => profile);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre completo</Label>
          <Input
            id="name"
            value={profileForm.name}
            onChange={(event) =>
              setProfileForm((current) => ({ ...current, name: event.target.value }))
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="specialty">Especialidad</Label>
          <Input
            id="specialty"
            value={profileForm.specialty}
            onChange={(event) =>
              setProfileForm((current) => ({
                ...current,
                specialty: event.target.value,
              }))
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Correo electrónico</Label>
          <Input
            id="email"
            type="email"
            value={profileForm.email}
            onChange={(event) =>
              setProfileForm((current) => ({ ...current, email: event.target.value }))
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Teléfono</Label>
          <Input
            id="phone"
            value={profileForm.phone}
            onChange={(event) =>
              setProfileForm((current) => ({ ...current, phone: event.target.value }))
            }
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="bio">Biografía profesional</Label>
        <textarea
          id="bio"
          rows={3}
          value={profileForm.bio}
          onChange={(event) =>
            setProfileForm((current) => ({ ...current, bio: event.target.value }))
          }
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </div>
      <Button type="button" disabled={isSaving} onClick={() => onSave(profileForm)}>
        {isSaving ? "Guardando…" : "Guardar cambios"}
      </Button>
    </div>
  );
};

const NotificationPreferencesForm = ({
  initialPreferences,
  onSave,
}: {
  initialPreferences: NotificationPreferences;
  onSave: (preferences: NotificationPreferences) => void;
}) => {
  const [localPrefs, setLocalPrefs] = useState(() => initialPreferences);

  return (
    <div className="space-y-4">
      {[
        {
          key: "newAppointment" as const,
          label: "Nueva cita agendada",
          desc: "Recibe una notificación cuando un paciente agenda una cita",
        },
        {
          key: "reminder" as const,
          label: "Recordatorios de citas",
          desc: "Recordatorio 30 minutos antes de cada consulta",
        },
        {
          key: "cancellation" as const,
          label: "Cancelaciones",
          desc: "Notificación cuando un paciente cancela su cita",
        },
        {
          key: "marketing" as const,
          label: "Novedades de SaludPe",
          desc: "Recibe información sobre nuevas funcionalidades",
        },
      ].map((item, index, array) => (
        <div key={item.key}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-foreground">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
            <Switch
              checked={localPrefs[item.key]}
              onCheckedChange={(checked) =>
                setLocalPrefs((current) => ({ ...current, [item.key]: checked }))
              }
            />
          </div>
          {index < array.length - 1 && <Separator className="mt-4" />}
        </div>
      ))}
      <Button onClick={() => onSave(localPrefs)} className="mt-2">
        Guardar preferencias
      </Button>
    </div>
  );
};

const DoctorSettings = () => {
  const queryClient = useQueryClient();
  const { refreshCurrentUser } = useAuth();
  const { preferences, setPreferences, savePreferences } = useNotifications();
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
  });

  const profileQuery = useQuery({
    queryKey: ["doctor-profile"],
    queryFn: fetchDoctorProfile,
  });

  const saveProfileMutation = useMutation({
    mutationFn: updateDoctorProfile,
    onSuccess: async (profile) => {
      queryClient.setQueryData(["doctor-profile"], profile);
      queryClient.invalidateQueries({ queryKey: ["doctor", profile.id] });
      queryClient.invalidateQueries({ queryKey: ["directory"] });
      await refreshCurrentUser();
      toast.success("Perfil actualizado correctamente");
    },
    onError: (error) => {
      const description =
        error instanceof ApiError ? error.message : "No se pudo actualizar el perfil.";
      toast.error("Error al guardar perfil", { description });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      setPasswordForm({ currentPassword: "", newPassword: "" });
      toast.success("Contraseña actualizada correctamente");
    },
    onError: (error) => {
      const description =
        error instanceof ApiError ? error.message : "No se pudo cambiar la contraseña.";
      toast.error("Error al actualizar contraseña", { description });
    },
  });

  const handleSaveNotifications = async (nextPreferences: NotificationPreferences) => {
    try {
      setPreferences(nextPreferences);
      await savePreferences(nextPreferences);
      toast.success("Preferencias de notificación guardadas");
    } catch (error) {
      const description =
        error instanceof ApiError ? error.message : "No se pudieron guardar las preferencias.";
      toast.error("Error al guardar notificaciones", { description });
    }
  };

  const handleChangePassword = () => {
    changePasswordMutation.mutate(passwordForm);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-bold font-serif text-foreground">Configuración</h1>
        <p className="text-muted-foreground">Administra tu perfil y preferencias</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" /> Información del Perfil
          </CardTitle>
          <CardDescription>
            Actualiza tu información profesional visible para los pacientes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {profileQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Cargando perfil…</p>
          ) : profileQuery.isError ? (
            <p className="text-sm text-destructive">No se pudo cargar el perfil médico.</p>
          ) : (
            <DoctorProfileForm
              key={profileQuery.data?.id}
              profile={profileQuery.data!}
              isSaving={saveProfileMutation.isPending}
              onSave={(profile) => saveProfileMutation.mutate(profile)}
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" /> Notificaciones
          </CardTitle>
          <CardDescription>Configura qué notificaciones deseas recibir</CardDescription>
        </CardHeader>
        <CardContent>
          <NotificationPreferencesForm
            key={JSON.stringify(preferences)}
            initialPreferences={preferences}
            onSave={(nextPreferences) => void handleSaveNotifications(nextPreferences)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" /> Seguridad
          </CardTitle>
          <CardDescription>Gestiona la seguridad de tu cuenta</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="current-password">Contraseña actual</Label>
              <Input
                id="current-password"
                type="password"
                placeholder="••••••••"
                value={passwordForm.currentPassword}
                onChange={(event) =>
                  setPasswordForm((current) => ({
                    ...current,
                    currentPassword: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">Nueva contraseña</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="••••••••"
                value={passwordForm.newPassword}
                onChange={(event) =>
                  setPasswordForm((current) => ({
                    ...current,
                    newPassword: event.target.value,
                  }))
                }
              />
            </div>
          </div>
          <Button
            onClick={handleChangePassword}
            disabled={
              changePasswordMutation.isPending ||
              passwordForm.currentPassword.length < 6 ||
              passwordForm.newPassword.length < 8
            }
          >
            {changePasswordMutation.isPending ? "Actualizando…" : "Cambiar contraseña"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorSettings;
