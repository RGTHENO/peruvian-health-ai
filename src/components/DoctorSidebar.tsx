import { Link, useLocation } from "react-router-dom";
import { Heart, LayoutDashboard, CalendarDays, Users, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/doctor/portal" },
  { label: "Agenda", icon: CalendarDays, path: "/doctor/portal/agenda" },
  { label: "Pacientes", icon: Users, path: "/doctor/portal/pacientes" },
];

const DoctorSidebar = () => {
  const location = useLocation();

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-card min-h-screen">
      <div className="flex items-center gap-2 p-6 border-b border-border">
        <Heart className="h-6 w-6 text-primary" fill="currentColor" />
        <span className="text-lg font-bold text-foreground font-serif">SaludPe</span>
        <span className="ml-auto text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">Médico</span>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border space-y-1">
        <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground w-full transition-colors">
          <Settings className="h-4 w-4" />
          Configuración
        </button>
        <Link to="/">
          <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground">
            <LogOut className="h-4 w-4" />
            Salir del portal
          </Button>
        </Link>
      </div>

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
            ME
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">Dra. María Elena</p>
            <p className="text-xs text-muted-foreground truncate">Cardiología</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default DoctorSidebar;
