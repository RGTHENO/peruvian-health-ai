import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Stethoscope, User } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const loginSchema = z.object({
  email: z.string().trim().email({ message: "Ingresa un correo electrónico válido" }).max(255, { message: "El correo no puede tener más de 255 caracteres" }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres" }).max(100, { message: "La contraseña no puede tener más de 100 caracteres" }),
});

type LoginValues = z.infer<typeof loginSchema>;

const Login = () => {
  const navigate = useNavigate();

  const patientForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const doctorForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const handlePatientLogin = (data: LoginValues) => {
    toast.success("¡Bienvenido! Redirigiendo...");
    setTimeout(() => navigate("/historial"), 1500);
  };

  const handleDoctorLogin = (data: LoginValues) => {
    toast.success("¡Bienvenido, Doctor! Redirigiendo al portal...");
    setTimeout(() => navigate("/doctor/portal"), 1500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-2">
              <Heart className="h-8 w-8 text-primary" fill="currentColor" />
            </div>
            <CardTitle className="text-2xl font-serif">Iniciar Sesión</CardTitle>
            <CardDescription>Accede a tu cuenta de SaludPe</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="paciente">
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
                            <Input type="email" placeholder="tu@email.com" {...field} />
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
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full">Ingresar como Paciente</Button>
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
                            <Input type="email" placeholder="doctor@email.com" {...field} />
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
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full">Ingresar como Médico</Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>

            <p className="text-center text-sm text-muted-foreground mt-6">
              ¿No tienes cuenta?{" "}
              <Link to="/" className="text-primary hover:underline font-medium">Regístrate gratis</Link>
            </p>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Login;
