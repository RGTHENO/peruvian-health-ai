import { Heart } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="border-t border-border bg-card py-12">
    <div className="container grid gap-8 md:grid-cols-4">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Heart className="h-5 w-5 text-primary" fill="currentColor" />
          <span className="font-bold font-serif text-foreground">SaludPe</span>
        </div>
        <p className="text-sm text-muted-foreground">
          La plataforma de salud digital que conecta pacientes con los mejores médicos del Perú.
        </p>
      </div>
      <div>
        <h4 className="font-semibold text-foreground mb-3 text-sm">Pacientes</h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li><Link to="/directorio" className="hover:text-primary transition-colors">Buscar Médicos</Link></li>
          <li><Link to="/" className="hover:text-primary transition-colors">Teleconsulta</Link></li>
          <li><Link to="/" className="hover:text-primary transition-colors">Mi Historial Médico</Link></li>
        </ul>
      </div>
      <div>
        <h4 className="font-semibold text-foreground mb-3 text-sm">Médicos</h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li><Link to="/" className="hover:text-primary transition-colors">Portal Médico</Link></li>
          <li><Link to="/" className="hover:text-primary transition-colors">IA Clínica</Link></li>
        </ul>
      </div>
      <div>
        <h4 className="font-semibold text-foreground mb-3 text-sm">Legal</h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li><Link to="/" className="hover:text-primary transition-colors">Privacidad (Ley 29733)</Link></li>
          <li><Link to="/" className="hover:text-primary transition-colors">Términos de Uso</Link></li>
        </ul>
      </div>
    </div>
    <div className="container mt-8 pt-6 border-t border-border text-center text-xs text-muted-foreground">
      © 2026 SaludPe. Todos los derechos reservados.
    </div>
  </footer>
);

export default Footer;
