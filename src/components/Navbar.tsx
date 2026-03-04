import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Heart, CalendarCheck, MapPin, Video, ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { cn } from "@/lib/utils";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isDirectorio = location.pathname === "/directorio";

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Heart className="h-7 w-7 text-primary" fill="currentColor" />
          <span className="text-xl font-bold text-foreground font-serif">SaludPe</span>
        </Link>

        <div className="hidden md:flex items-center gap-4">
          <Link
            to="/directorio"
            className={cn(
              "text-sm font-medium transition-colors relative py-1",
              isDirectorio
                ? "text-primary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary after:rounded-full"
                : "text-muted-foreground hover:text-primary"
            )}
          >
            Directorio Médico
          </Link>

          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <Button size="sm" className="gap-1.5">
                <CalendarCheck className="h-4 w-4" />
                Agendar Cita
                <ChevronDown className="h-3 w-3 opacity-70" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-52 p-2" align="center" sideOffset={8}>
              <button
                onClick={() => { setPopoverOpen(false); navigate("/directorio?tipo=presencial"); }}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-foreground hover:bg-accent transition-colors"
              >
                <MapPin className="h-4 w-4 text-primary" />
                Cita Presencial
              </button>
              <button
                onClick={() => { setPopoverOpen(false); navigate("/directorio?tipo=telemedicina"); }}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-foreground hover:bg-accent transition-colors"
              >
                <Video className="h-4 w-4 text-primary" />
                Cita Virtual
              </button>
            </PopoverContent>
          </Popover>

          <Link to="/iniciar-sesion">
            <Button size="sm" variant="outline">Iniciar Sesión</Button>
          </Link>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <button onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden border-t border-border bg-card p-4 space-y-3">
          <Link
            to="/directorio"
            onClick={() => setIsOpen(false)}
            className={cn(
              "block text-sm font-medium",
              isDirectorio ? "text-primary" : "text-muted-foreground hover:text-primary"
            )}
          >
            Directorio Médico
          </Link>

          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide pt-1">Agendar Cita</p>
          <Link
            to="/directorio?tipo=presencial"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
          >
            <MapPin className="h-4 w-4 text-primary" />
            Cita Presencial
          </Link>
          <Link
            to="/directorio?tipo=telemedicina"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
          >
            <Video className="h-4 w-4 text-primary" />
            Cita Virtual
          </Link>

          <Link to="/iniciar-sesion" onClick={() => setIsOpen(false)}>
            <Button size="sm" className="w-full mt-2">Iniciar Sesión</Button>
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
