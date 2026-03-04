import { Outlet } from "react-router-dom";
import { Link } from "react-router-dom";
import { Settings, LogOut } from "lucide-react";
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

const DoctorLayout = () => {
  return (
    <div className="flex min-h-screen bg-background">
      <DoctorSidebar />
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-end gap-2 border-b border-border px-4 py-2 lg:px-6">
          <NotificationBell />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 px-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                  ME
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-foreground leading-none">Dra. María Elena</p>
                  <p className="text-xs text-muted-foreground leading-none mt-0.5">Cardiología</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link to="/doctor/portal/configuracion" className="flex items-center gap-2 cursor-pointer">
                  <Settings className="h-4 w-4" />
                  Configuración
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/" className="flex items-center gap-2 cursor-pointer text-destructive">
                  <LogOut className="h-4 w-4" />
                  Salir del portal
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex-1 pb-16 lg:pb-0">
          <Outlet />
        </main>
      </div>
      <DoctorMobileNav />
    </div>
  );
};

export default DoctorLayout;
