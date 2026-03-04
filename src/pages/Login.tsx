import { useState } from "react";
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

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handlePatientLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Por favor completa todos los campos");
      return;
    }
    toast.success("¡Bienvenido! Redirigiendo...");
    setTimeout(() => navigate("/historial"), 1500);
  };

  const handleDoctorLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Por favor completa todos los campos");
      return;
    }
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
                <form onSubmit={handlePatientLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="patient-email">Correo electrónico</Label>
                    <Input id="patient-email" type="email" placeholder="tu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="patient-password">Contraseña</Label>
                    <Input id="patient-password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                  </div>
                  <Button type="submit" className="w-full">Ingresar como Paciente</Button>
                </form>
              </TabsContent>

              <TabsContent value="medico">
                <form onSubmit={handleDoctorLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="doctor-email">Correo electrónico</Label>
                    <Input id="doctor-email" type="email" placeholder="doctor@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="doctor-password">Contraseña</Label>
                    <Input id="doctor-password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                  </div>
                  <Button type="submit" className="w-full">Ingresar como Médico</Button>
                </form>
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
