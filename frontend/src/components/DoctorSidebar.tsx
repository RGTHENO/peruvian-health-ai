import { Link, useLocation } from "react-router-dom";
import { Heart, LayoutDashboard, CalendarDays, Users } from "lucide-react";
import { cn } from "@/lib/utils";

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
          const isActive =
            location.pathname === item.path ||
            (item.path !== "/doctor/portal" && location.pathname.startsWith(`${item.path}/`));
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
    </aside>
  );
};

export default DoctorSidebar;
