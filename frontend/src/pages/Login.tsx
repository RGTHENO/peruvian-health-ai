import * as React from "react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Heart, LoaderCircle, Stethoscope, User } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/contexts/AuthContext";
import { ApiError } from "@/lib/api-client";
import { isHostedFallbackEnabled } from "@/lib/hosted-fallback";
import { cn } from "@/lib/utils";

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
type AuthRole = "paciente" | "medico";
type AuthMode = "login" | "registro";
type PasswordFieldKey = "patientLogin" | "doctorLogin" | "register" | "confirm";

const isSafeRedirect = (value: string | null) =>
  Boolean(value && value.startsWith("/") && !value.startsWith("//"));

const fieldClassName =
  "h-12 rounded-xl border-slate-200 bg-white px-4 text-[0.95rem] shadow-none placeholder:text-slate-400 focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10 focus-visible:ring-offset-0";

const PasswordInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentPropsWithoutRef<"input"> & {
    shown: boolean;
    onToggle: () => void;
    toggleLabel?: string;
  }
>(({ className, shown, onToggle, toggleLabel, ...props }, ref) => (
  <div className="relative">
    <Input
      ref={ref}
      type={shown ? "text" : "password"}
      className={cn(fieldClassName, "pr-14", className)}
      {...props}
    />
    <button
      type="button"
      onClick={onToggle}
      aria-label={toggleLabel ?? (shown ? "Ocultar contraseña" : "Mostrar contraseña")}
      aria-pressed={shown}
      className="absolute right-1 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-slate-500 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {shown ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  </div>
));
PasswordInput.displayName = "PasswordInput";

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, registerPatient, user } = useAuth();
  const requestedRole = searchParams.get("role");
  const requestedMode = searchParams.get("mode");
  const redirect = searchParams.get("redirect");
  const safeRedirect = isSafeRedirect(redirect) ? redirect : null;
  const [authMode, setAuthMode] = useState<AuthMode>(() =>
    requestedMode === "register" ? "registro" : "login",
  );
  const [activeRole, setActiveRole] = useState<AuthRole>(() =>
    requestedMode === "register" ? "paciente" : requestedRole === "doctor" ? "medico" : "paciente",
  );
  const [submittingRole, setSubmittingRole] = useState<AuthRole | "registro" | null>(null);
  const [passwordVisibility, setPasswordVisibility] = useState<Record<PasswordFieldKey, boolean>>({
    patientLogin: false,
    doctorLogin: false,
    register: false,
    confirm: false,
  });

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
    const nextMode = requestedMode === "register" ? "registro" : "login";
    setAuthMode(nextMode);
    setActiveRole(
      nextMode === "registro" ? "paciente" : requestedRole === "doctor" ? "medico" : "paciente",
    );
  }, [requestedMode, requestedRole]);

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

  const togglePasswordVisibility = (field: PasswordFieldKey) => {
    setPasswordVisibility((current) => ({
      ...current,
      [field]: !current[field],
    }));
  };

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

  const handleForgotPassword = () => {
    toast.info("Recuperación de contraseña", {
      description: import.meta.env.DEV
        ? "Todavía no hay flujo automático en este entorno. Puedes usar las credenciales demo mientras desarrollas."
        : "Todavía no hay flujo automático habilitado para esta versión.",
    });
  };

  const isBookingResumeFlow = Boolean(safeRedirect?.startsWith("/doctor/"));
  const isDoctorLogin = activeRole === "medico";
  const isRegisterMode = authMode === "registro";
  const showDemoCredentials = import.meta.env.DEV || isHostedFallbackEnabled();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main
        id="main-content"
        tabIndex={-1}
        className="flex flex-1 items-start justify-center bg-gradient-to-b from-background via-background to-emerald-50/60 px-4 py-10 sm:items-center sm:py-14"
      >
        <Card className="w-full max-w-2xl border-border/80 bg-card/95 shadow-xl shadow-primary/5">
          <CardHeader className="space-y-4 pb-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Heart className="h-7 w-7" fill="currentColor" />
            </div>
            <div className="space-y-2">
              <CardTitle className="font-serif text-[clamp(1.9rem,3.5vw,2.5rem)] leading-tight">
                {isRegisterMode ? "Crea tu cuenta de paciente" : "Accede a tu cuenta de SaludPe"}
              </CardTitle>
              <CardDescription className="mx-auto max-w-md text-sm text-slate-600 sm:text-base">
                {isRegisterMode
                  ? "Completa tus datos para reservar citas y seguir tu atención."
                  : "Ingresa tus datos para acceder a tu portal."}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {isBookingResumeFlow && (
              <div className="rounded-2xl border border-primary/15 bg-primary/5 p-4 text-sm text-foreground">
                <p className="font-medium">Tu reserva sigue en espera.</p>
                <p className="mt-1 text-slate-600">
                  Cuando inicies sesión o termines tu registro volverás al perfil del médico con la
                  reserva lista para confirmar.
                </p>
              </div>
            )}

            {isRegisterMode ? (
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 text-sm text-slate-700">
                <p className="font-medium text-foreground">Registro de paciente</p>
                <p className="mt-1">
                  El alta en línea está disponible para pacientes. El acceso médico se gestiona de
                  forma interna.
                </p>
              </div>
            ) : (
              <Tabs value={activeRole} onValueChange={(value) => setActiveRole(value as AuthRole)}>
                <TabsList className="grid h-auto w-full grid-cols-2 rounded-2xl bg-slate-200/90 p-1 text-slate-600">
                  <TabsTrigger
                    value="paciente"
                    className="h-12 gap-2 rounded-xl data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                  >
                    <User className="h-4 w-4" />
                    Paciente
                  </TabsTrigger>
                  <TabsTrigger
                    value="medico"
                    className="h-12 gap-2 rounded-xl data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                  >
                    <Stethoscope className="h-4 w-4" />
                    Médico
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
                            <FormLabel className="text-[0.95rem] font-semibold text-foreground">
                              Correo electrónico
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                name="patient_email"
                                autoComplete="email"
                                autoCapitalize="none"
                                inputMode="email"
                                spellCheck={false}
                                placeholder="paciente@saludpe.pe"
                                className={fieldClassName}
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
                            <div className="flex items-center justify-between gap-4">
                              <FormLabel className="text-[0.95rem] font-semibold text-foreground">
                                Contraseña
                              </FormLabel>
                              <button
                                type="button"
                                onClick={handleForgotPassword}
                                className="text-sm font-medium text-primary transition-colors hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                              >
                                ¿Olvidaste tu contraseña?
                              </button>
                            </div>
                            <FormControl>
                              <PasswordInput
                                name="patient_password"
                                autoComplete="current-password"
                                placeholder="Ingresa tu contraseña"
                                shown={passwordVisibility.patientLogin}
                                onToggle={() => togglePasswordVisibility("patientLogin")}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="submit"
                        className="h-12 w-full rounded-xl text-sm font-semibold"
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
                      <p className="text-center text-sm text-slate-600">
                        ¿No tienes cuenta?{" "}
                        <button
                          type="button"
                          onClick={() => setAuthMode("registro")}
                          className="font-semibold text-primary transition-colors hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          Regístrate
                        </button>
                      </p>
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
                            <FormLabel className="text-[0.95rem] font-semibold text-foreground">
                              Correo electrónico
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                name="doctor_email"
                                autoComplete="email"
                                autoCapitalize="none"
                                inputMode="email"
                                spellCheck={false}
                                placeholder="medico@saludpe.pe"
                                className={fieldClassName}
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
                            <div className="flex items-center justify-between gap-4">
                              <FormLabel className="text-[0.95rem] font-semibold text-foreground">
                                Contraseña
                              </FormLabel>
                              <button
                                type="button"
                                onClick={handleForgotPassword}
                                className="text-sm font-medium text-primary transition-colors hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                              >
                                ¿Olvidaste tu contraseña?
                              </button>
                            </div>
                            <FormControl>
                              <PasswordInput
                                name="doctor_password"
                                autoComplete="current-password"
                                placeholder="Ingresa tu contraseña"
                                shown={passwordVisibility.doctorLogin}
                                onToggle={() => togglePasswordVisibility("doctorLogin")}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="submit"
                        className="h-12 w-full rounded-xl text-sm font-semibold"
                        disabled={submittingRole === "medico"}
                      >
                        {submittingRole === "medico" ? (
                          <>
                            <LoaderCircle className="h-4 w-4 animate-spin" />
                            Ingresando…
                          </>
                        ) : (
                          "Ingresar como Médico"
                        )}
                      </Button>
                      <p className="text-center text-sm text-slate-600">
                        El acceso médico se habilita de forma interna para cada profesional.
                      </p>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
            )}

            {isRegisterMode && (
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
                        <FormLabel className="text-[0.95rem] font-semibold text-foreground">
                          Nombre completo
                        </FormLabel>
                        <FormControl>
                          <Input
                            autoComplete="name"
                            placeholder="Nombres y apellidos"
                            className={fieldClassName}
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
                        <FormLabel className="text-[0.95rem] font-semibold text-foreground">
                          Correo electrónico
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            autoComplete="email"
                            inputMode="email"
                            placeholder="tu@email.com"
                            className={fieldClassName}
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
                        <FormLabel className="text-[0.95rem] font-semibold text-foreground">
                          WhatsApp / celular
                        </FormLabel>
                        <FormControl>
                          <Input
                            autoComplete="tel"
                            inputMode="tel"
                            placeholder="+51 999 999 999"
                            className={fieldClassName}
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
                        <FormLabel className="text-[0.95rem] font-semibold text-foreground">
                          Edad
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            max={120}
                            className={fieldClassName}
                            {...field}
                          />
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
                        <FormLabel className="text-[0.95rem] font-semibold text-foreground">
                          Sexo
                        </FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className={fieldClassName}>
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
                        <FormLabel className="text-[0.95rem] font-semibold text-foreground">
                          Seguro
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Particular, SIS, Rímac..."
                            className={fieldClassName}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="telegramHandle"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel className="text-[0.95rem] font-semibold text-foreground">
                          Telegram (opcional)
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="@tuusuario"
                            className={fieldClassName}
                            {...field}
                          />
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
                        <FormLabel className="text-[0.95rem] font-semibold text-foreground">
                          Contraseña
                        </FormLabel>
                        <FormControl>
                          <PasswordInput
                            autoComplete="new-password"
                            placeholder="Mínimo 8 caracteres"
                            shown={passwordVisibility.register}
                            onToggle={() => togglePasswordVisibility("register")}
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
                        <FormLabel className="text-[0.95rem] font-semibold text-foreground">
                          Confirmar contraseña
                        </FormLabel>
                        <FormControl>
                          <PasswordInput
                            autoComplete="new-password"
                            placeholder="Repite la contraseña"
                            shown={passwordVisibility.confirm}
                            onToggle={() => togglePasswordVisibility("confirm")}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="space-y-3 sm:col-span-2">
                    <Button
                      type="submit"
                      className="h-12 w-full rounded-xl text-sm font-semibold"
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
                    <p className="text-center text-sm text-slate-600">
                      ¿Ya tienes cuenta?{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode("login");
                          setActiveRole("paciente");
                        }}
                        className="font-semibold text-primary transition-colors hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        Inicia sesión
                      </button>
                    </p>
                  </div>
                </form>
              </Form>
            )}

            {showDemoCredentials && !isRegisterMode && (
              <div className="rounded-2xl border border-dashed border-border/80 bg-transparent px-4 py-3 text-xs leading-relaxed text-slate-500">
                <p className="font-semibold uppercase tracking-[0.12em] text-slate-400">
                  {import.meta.env.DEV ? "Demo local" : "Acceso demo"}
                </p>
                <p className="mt-1">
                  {isDoctorLogin
                    ? "medico@saludpe.pe / SaludPe123!"
                    : "paciente@saludpe.pe / SaludPe123!"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Login;
