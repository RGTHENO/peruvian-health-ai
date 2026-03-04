import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, CalendarDays, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/doctor/portal" },
  { label: "Agenda", icon: CalendarDays, path: "/doctor/portal/agenda" },
  { label: "Pacientes", icon: Users, path: "/doctor/portal/pacientes" },
];

const DoctorMobileNav = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur lg:hidden">
      <div className="flex items-center justify-around px-2 py-1.5 pb-[calc(env(safe-area-inset-bottom)+0.25rem)]">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex min-h-11 min-w-[72px] flex-col items-center justify-center gap-0.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default DoctorMobileNav;
