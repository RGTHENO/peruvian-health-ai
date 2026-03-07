import { Outlet } from "react-router-dom";
import { Link } from "react-router-dom";
import { Settings, LogOut } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import DoctorSidebar from "@/components/DoctorSidebar";
import DoctorMobileNav from "@/components/DoctorMobileNav";
import NotificationBell from "@/components/NotificationBell";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { fetchDoctorProfile } from "@/lib/api";

const DoctorLayout = () => {
  const { user, logout } = useAuth();
  const profileQuery = useQuery({
    queryKey: ["doctor-profile"],
    queryFn: fetchDoctorProfile,
    enabled: Boolean(user),
  });

  const doctorName = profileQuery.data?.name ?? user?.full_name ?? "Dra. María Elena";
  const doctorSpecialty = profileQuery.data?.specialty ?? "Especialidad";
  const initials = doctorName
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("");

  return (
    <div className="flex min-h-screen bg-background">
      <DoctorSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-end gap-2 border-b border-border px-3 py-2 sm:px-4 lg:px-6">
          <NotificationBell />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-11 gap-2 px-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                  {initials}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-foreground leading-none">{doctorName}</p>
                  <p className="text-xs text-muted-foreground leading-none mt-0.5">{doctorSpecialty}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={8} className="w-48">
              <div className="px-3 py-2">
                <p className="text-sm font-semibold text-foreground">{doctorName}</p>
                <p className="text-xs text-muted-foreground">{doctorSpecialty}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/doctor/portal/configuracion" className="flex items-center gap-2 cursor-pointer">
                  <Settings className="h-4 w-4" />
                  Configuración
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="flex items-center gap-2 cursor-pointer text-destructive"
                onClick={() => void logout()}
              >
                  <LogOut className="h-4 w-4" />
                  Salir del portal
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main id="main-content" tabIndex={-1} className="flex-1 pb-24 lg:pb-0">
          <Outlet />
        </main>
      </div>
      <DoctorMobileNav />
    </div>
  );
};

export default DoctorLayout;
