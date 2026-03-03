import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Heart } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Heart className="h-7 w-7 text-primary" fill="currentColor" />
          <span className="text-xl font-bold text-foreground font-serif">SaludPe</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link to="/directorio" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Directorio Médico
          </Link>
          <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Teleconsulta
          </Link>
          <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Mi Historial
          </Link>
          <Button size="sm">Iniciar Sesión</Button>
        </div>

        <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden border-t border-border bg-card p-4 space-y-3">
          <Link to="/directorio" className="block text-sm font-medium text-muted-foreground hover:text-primary">Directorio Médico</Link>
          <Link to="/" className="block text-sm font-medium text-muted-foreground hover:text-primary">Teleconsulta</Link>
          <Link to="/" className="block text-sm font-medium text-muted-foreground hover:text-primary">Mi Historial</Link>
          <Button size="sm" className="w-full">Iniciar Sesión</Button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
