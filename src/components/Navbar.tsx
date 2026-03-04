import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Heart, CalendarCheck } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Heart className="h-7 w-7 text-primary" fill="currentColor" />
          <span className="text-xl font-bold text-foreground font-serif">SaludPe</span>
        </Link>

        <div className="hidden md:flex items-center gap-3">
          <Link to="/directorio">
            <Button size="sm" className="gap-1.5">
              <CalendarCheck className="h-4 w-4" />
              Agendar Cita
            </Button>
          </Link>

          <Link to="/iniciar-sesion">
            <Button size="sm" variant="outline">Iniciar Sesión</Button>
          </Link>
        </div>

        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden border-t border-border bg-card p-4 space-y-3">
          <Link to="/directorio" onClick={() => setIsOpen(false)}>
            <Button size="sm" className="w-full gap-1.5">
              <CalendarCheck className="h-4 w-4" />
              Agendar Cita
            </Button>
          </Link>

          <Link to="/iniciar-sesion" onClick={() => setIsOpen(false)}>
            <Button size="sm" variant="outline" className="w-full">Iniciar Sesión</Button>
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
