import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, LoaderCircle, Stethoscope, User } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ApiError } from "@/lib/api-client";

const loginSchema = z.object({
  email: z.string().trim().email({ message: "Ingresa un correo electrónico válido" }).max(255, { message: "El correo no puede tener más de 255 caracteres" }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres" }).max(100, { message: "La contraseña no puede tener más de 100 caracteres" }),
});

type LoginValues = z.infer<typeof loginSchema>;

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, user } = useAuth();
  const [submittingRole, setSubmittingRole] = useState<"paciente" | "medico" | null>(null);
  const requestedRole = searchParams.get("role");
  const redirect = searchParams.get("redirect");

  useEffect(() => {
    if (!user) return;
    navigate(user.role === "doctor" ? "/doctor/portal" : "/historial", { replace: true });
  }, [navigate, user]);

  const patientForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const doctorForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const resolveRedirect = (role: "patient" | "doctor") => {
    if (redirect) return redirect;
    return role === "doctor" ? "/doctor/portal" : "/historial";
  };

  const handlePatientLogin = async (values: LoginValues) => {
    setSubmittingRole("paciente");
    try {
      await login({ ...values, role: "patient" });
      toast.success("¡Bienvenido! Redirigiendo…");
      navigate(resolveRedirect("patient"), { replace: true });
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
      toast.success("¡Bienvenido, Doctor! Redirigiendo al portal…");
      navigate(resolveRedirect("doctor"), { replace: true });
    } catch (error) {
      const description =
        error instanceof ApiError ? error.message : "No se pudo iniciar sesión.";
      toast.error("Error al iniciar sesión", { description });
    } finally {
      setSubmittingRole(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main id="main-content" tabIndex={-1} className="flex-1 flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-2">
              <Heart className="h-8 w-8 text-primary" fill="currentColor" />
            </div>
            <CardTitle className="text-2xl font-serif">Iniciar Sesión</CardTitle>
            <CardDescription>Accede a tu cuenta de SaludPe</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              defaultValue={requestedRole === "doctor" ? "medico" : "paciente"}
            >
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="paciente" className="gap-2">
                  <User className="h-4 w-4" /> Paciente
                </TabsTrigger>
                <TabsTrigger value="medico" className="gap-2">
                  <Stethoscope className="h-4 w-4" /> Médico
                </TabsTrigger>
              </TabsList>

              <TabsContent value="paciente">
                <Form {...patientForm}>
                  <form onSubmit={patientForm.handleSubmit(handlePatientLogin)} className="space-y-4">
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
                    <Button type="submit" className="w-full" disabled={submittingRole === "paciente"}>
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

              <TabsContent value="medico">
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

            <p className="text-center text-sm text-muted-foreground mt-6">
              ¿No tienes cuenta?{" "}
              <Link to="/" className="text-primary hover:underline font-medium">Regístrate gratis</Link>
            </p>
            <div className="mt-4 rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
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
