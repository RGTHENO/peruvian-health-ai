import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Directory from "./pages/Directory";
import DoctorProfile from "./pages/DoctorProfile";
import DoctorDashboard from "./pages/DoctorDashboard";
import DoctorAgenda from "./pages/DoctorAgenda";
import DoctorPatients from "./pages/DoctorPatients";
import DoctorLayout from "./layouts/DoctorLayout";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/directorio" element={<Directory />} />
          <Route path="/doctor/:id" element={<DoctorProfile />} />
          <Route path="/doctor/portal" element={<DoctorLayout />}>
            <Route index element={<DoctorDashboard />} />
            <Route path="agenda" element={<DoctorAgenda />} />
            <Route path="pacientes" element={<DoctorPatients />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
