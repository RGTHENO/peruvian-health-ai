import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";
import RouteFallback from "@/components/RouteFallback";
import { AuthProvider } from "./contexts/AuthContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { queryClient } from "./lib/query-client";
const Index = lazy(() => import("./pages/Index"));
const Directory = lazy(() => import("./pages/Directory"));
const DoctorProfile = lazy(() => import("./pages/DoctorProfile"));
const DoctorDashboard = lazy(() => import("./pages/DoctorDashboard"));
const DoctorAgenda = lazy(() => import("./pages/DoctorAgenda"));
const DoctorConsultation = lazy(() => import("./pages/DoctorConsultation"));
const DoctorPatients = lazy(() => import("./pages/DoctorPatients"));
const DoctorPatientRecord = lazy(() => import("./pages/DoctorPatientRecord"));
const DoctorSettings = lazy(() => import("./pages/DoctorSettings"));
const DoctorLayout = lazy(() => import("./layouts/DoctorLayout"));
const Teleconsulta = lazy(() => import("./pages/Teleconsulta"));
const Historial = lazy(() => import("./pages/Historial"));
const Login = lazy(() => import("./pages/Login"));
const Privacidad = lazy(() => import("./pages/Privacidad"));
const Terminos = lazy(() => import("./pages/Terminos"));
const NotFound = lazy(() => import("./pages/NotFound"));

const DoctorPortal = () => (
  <ProtectedRoute role="doctor">
    <NotificationProvider>
      <DoctorLayout />
    </NotificationProvider>
  </ProtectedRoute>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/directorio" element={<Directory />} />
              <Route path="/doctor/:id" element={<DoctorProfile />} />
              <Route path="/teleconsulta" element={<Teleconsulta />} />
              <Route
                path="/historial"
                element={
                  <ProtectedRoute role="patient">
                    <Historial />
                  </ProtectedRoute>
                }
              />
              <Route path="/iniciar-sesion" element={<Login />} />
              <Route path="/privacidad" element={<Privacidad />} />
              <Route path="/terminos" element={<Terminos />} />
              <Route path="/doctor/portal" element={<DoctorPortal />}>
                <Route index element={<DoctorDashboard />} />
                <Route path="agenda" element={<DoctorAgenda />} />
                <Route path="consulta/:appointmentId" element={<DoctorConsultation />} />
                <Route path="pacientes" element={<DoctorPatients />} />
                <Route path="pacientes/:patientId" element={<DoctorPatientRecord />} />
                <Route path="configuracion" element={<DoctorSettings />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
