import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Heart, LoaderCircle, Stethoscope, User, UserRoundPlus } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAuth } from "@/contexts/AuthContext";
import { ApiError } from "@/lib/api-client";

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: "Ingresa un correo electrónico válido" })
    .max(255, { message: "El correo no puede tener más de 255 caracteres" }),
  password: z
    .string()
    .min(6, { message: "La contraseña debe tener al menos 6 caracteres" })
    .max(100, { message: "La contraseña no puede tener más de 100 caracteres" }),
});

const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(3, { message: "Ingresa tu nombre completo" })
      .max(255, { message: "El nombre no puede tener más de 255 caracteres" }),
    email: z
      .string()
      .trim()
      .email({ message: "Ingresa un correo electrónico válido" })
      .max(255, { message: "El correo no puede tener más de 255 caracteres" }),
    phone: z
      .string()
      .trim()
      .min(7, { message: "Ingresa un número válido" })
      .max(50, { message: "El teléfono no puede tener más de 50 caracteres" }),
    age: z.coerce
      .number({ message: "Ingresa una edad válida" })
      .int({ message: "La edad debe ser un número entero" })
      .min(0, { message: "La edad no puede ser negativa" })
      .max(120, { message: "La edad no puede superar 120 años" }),
    gender: z.enum(["M", "F"], {
      message: "Selecciona tu sexo",
    }),
    insurance: z
      .string()
      .trim()
      .min(2, { message: "Ingresa tu seguro o 'Particular'" })
      .max(120, { message: "El seguro no puede tener más de 120 caracteres" }),
    telegramHandle: z
      .string()
      .trim()
      .max(120, { message: "Telegram no puede tener más de 120 caracteres" })
      .optional()
      .or(z.literal("")),
    password: z
      .string()
      .min(8, { message: "La contraseña debe tener al menos 8 caracteres" })
      .max(100, { message: "La contraseña no puede tener más de 100 caracteres" }),
    confirmPassword: z.string().min(8, { message: "Confirma tu contraseña" }),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;
type AuthTab = "paciente" | "registro" | "medico";

const isSafeRedirect = (value: string | null) =>
  Boolean(value && value.startsWith("/") && !value.startsWith("//"));

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, registerPatient, user } = useAuth();
  const requestedRole = searchParams.get("role");
  const requestedMode = searchParams.get("mode");
  const redirect = searchParams.get("redirect");
  const safeRedirect = isSafeRedirect(redirect) ? redirect : null;
  const [activeTab, setActiveTab] = useState<AuthTab>(() => {
    if (requestedMode === "register") return "registro";
    return requestedRole === "doctor" ? "medico" : "paciente";
  });
  const [submittingRole, setSubmittingRole] = useState<
    "paciente" | "medico" | "registro" | null
  >(null);

  const patientForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const doctorForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      age: 18,
      gender: "F",
      insurance: "Particular",
      telegramHandle: "",
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (!user) return;
    const nextRedirect =
      user.role === "patient" && safeRedirect
        ? safeRedirect
        : user.role === "doctor"
          ? "/doctor/portal"
          : "/historial";
    navigate(nextRedirect, { replace: true });
  }, [navigate, safeRedirect, user]);

  const handlePatientLogin = async (values: LoginValues) => {
    setSubmittingRole("paciente");
    try {
      await login({ ...values, role: "patient" });
      toast.success("Sesión iniciada. Retomando tu flujo.");
    } catch (error) {
      const description =
        error instanceof ApiError ? error.message : "No se pudo iniciar sesión.";
      toast.error("Error al iniciar sesión", { description });
    } finally {
      setSubmittingRole(null);
    }
  };

  const handleDoctorLogin = async (values: LoginValues) => {
    setSubmittingRole("medico");
    try {
      await login({ ...values, role: "doctor" });
      toast.success("Sesión iniciada. Redirigiendo al portal.");
    } catch (error) {
      const description =
        error instanceof ApiError ? error.message : "No se pudo iniciar sesión.";
      toast.error("Error al iniciar sesión", { description });
    } finally {
      setSubmittingRole(null);
    }
  };

  const handlePatientRegistration = async (values: RegisterValues) => {
    setSubmittingRole("registro");
    try {
      await registerPatient({
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        phone: values.phone,
        age: values.age,
        gender: values.gender,
        insurance: values.insurance,
        telegramHandle: values.telegramHandle?.trim() || undefined,
      });
      toast.success("Cuenta creada correctamente. Volviendo a tu reserva.");
    } catch (error) {
      const description =
        error instanceof ApiError ? error.message : "No se pudo crear la cuenta.";
      toast.error("Error al crear la cuenta", { description });
    } finally {
      setSubmittingRole(null);
    }
  };

  const isBookingResumeFlow = Boolean(safeRedirect?.startsWith("/doctor/"));

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main
        id="main-content"
        tabIndex={-1}
        className="flex-1 flex items-center justify-center py-12 px-4"
      >
        <Card className="w-full max-w-3xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-2">
              <Heart className="h-8 w-8 text-primary" fill="currentColor" />
            </div>
            <CardTitle className="text-2xl font-serif">Accede a tu cuenta de SaludPe</CardTitle>
            <CardDescription>
              Inicia sesión si ya tienes cuenta o créala para completar tu atención.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isBookingResumeFlow && (
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-foreground">
                <p className="font-medium">Tu reserva sigue en espera.</p>
                <p className="mt-1 text-muted-foreground">
                  Cuando inicies sesión o termines tu registro volverás al perfil del médico con la
                  reserva lista para confirmar.
                </p>
              </div>
            )}

            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as AuthTab)}>
              <TabsList className="grid w-full grid-cols-1 gap-2 sm:grid-cols-3 sm:h-auto">
                <TabsTrigger value="paciente" className="gap-2">
                  <User className="h-4 w-4" /> Paciente
                </TabsTrigger>
                <TabsTrigger value="registro" className="gap-2">
                  <UserRoundPlus className="h-4 w-4" /> Crear cuenta
                </TabsTrigger>
                <TabsTrigger value="medico" className="gap-2">
                  <Stethoscope className="h-4 w-4" /> Médico
                </TabsTrigger>
              </TabsList>

              <TabsContent value="paciente" className="mt-6">
                <Form {...patientForm}>
                  <form
                    onSubmit={patientForm.handleSubmit(handlePatientLogin)}
                    className="space-y-4"
                  >
                    <FormField
                      control={patientForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Correo electrónico</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              name="patient_email"
                              autoComplete="email"
                              autoCapitalize="none"
                              inputMode="email"
                              spellCheck={false}
                              placeholder="tu@email.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={patientForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contraseña</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              name="patient_password"
                              autoComplete="current-password"
                              placeholder="••••••••"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={submittingRole === "paciente"}
                    >
                      {submittingRole === "paciente" ? (
                        <>
                          <LoaderCircle className="h-4 w-4 animate-spin" />
                          Ingresando…
                        </>
                      ) : (
                        "Ingresar como Paciente"
                      )}
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="registro" className="mt-6">
                <Form {...registerForm}>
                  <form
                    onSubmit={registerForm.handleSubmit(handlePatientRegistration)}
                    className="grid gap-4 sm:grid-cols-2"
                  >
                    <FormField
                      control={registerForm.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem className="sm:col-span-2">
                          <FormLabel>Nombre completo</FormLabel>
                          <FormControl>
                            <Input
                              autoComplete="name"
                              placeholder="Nombres y apellidos"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Correo electrónico</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              autoComplete="email"
                              inputMode="email"
                              placeholder="tu@email.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>WhatsApp / celular</FormLabel>
                          <FormControl>
                            <Input
                              autoComplete="tel"
                              inputMode="tel"
                              placeholder="+51 999 999 999"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="age"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Edad</FormLabel>
                          <FormControl>
                            <Input type="number" min={0} max={120} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sexo</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="F">Femenino</SelectItem>
                              <SelectItem value="M">Masculino</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="insurance"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Seguro</FormLabel>
                          <FormControl>
                            <Input placeholder="Particular, SIS, Rímac..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="telegramHandle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telegram (opcional)</FormLabel>
                          <FormControl>
                            <Input placeholder="@tuusuario" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contraseña</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              autoComplete="new-password"
                              placeholder="Mínimo 8 caracteres"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirmar contraseña</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              autoComplete="new-password"
                              placeholder="Repite la contraseña"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="sm:col-span-2">
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={submittingRole === "registro"}
                      >
                        {submittingRole === "registro" ? (
                          <>
                            <LoaderCircle className="h-4 w-4 animate-spin" />
                            Creando cuenta…
                          </>
                        ) : (
                          "Crear cuenta de Paciente"
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="medico" className="mt-6">
                <Form {...doctorForm}>
                  <form onSubmit={doctorForm.handleSubmit(handleDoctorLogin)} className="space-y-4">
                    <FormField
                      control={doctorForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Correo electrónico</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              name="doctor_email"
                              autoComplete="email"
                              autoCapitalize="none"
                              inputMode="email"
                              spellCheck={false}
                              placeholder="doctor@email.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={doctorForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contraseña</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              name="doctor_password"
                              autoComplete="current-password"
                              placeholder="••••••••"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={submittingRole === "medico"}>
                      {submittingRole === "medico" ? (
                        <>
                          <LoaderCircle className="h-4 w-4 animate-spin" />
                          Ingresando…
                        </>
                      ) : (
                        "Ingresar como Médico"
                      )}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>

            <div className="rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
              <p className="font-medium text-foreground">Credenciales demo</p>
              <p>Paciente: `paciente@saludpe.pe` / `SaludPe123!`</p>
              <p>Médico: `medico@saludpe.pe` / `SaludPe123!`</p>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Login;
