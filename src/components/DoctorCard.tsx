import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Video, Building2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Doctor } from "@/data/doctors";

const DoctorCard = ({ doctor }: { doctor: Doctor }) => {
  const initials = doctor.name
    .split(" ")
    .filter((_, i) => i === 0 || i === 2)
    .map((n) => n[0])
    .join("");

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-border">
      <CardContent className="p-5">
        <div className="flex gap-4">
          <Avatar className="h-14 w-14 border-2 border-primary/20">
            <AvatarFallback className="bg-accent text-accent-foreground font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-foreground truncate">{doctor.name}</h3>
                <p className="text-sm text-primary font-medium">{doctor.specialty}</p>
              </div>
              {doctor.available && (
                <Badge variant="secondary" className="bg-accent text-accent-foreground shrink-0 text-xs">
                  Disponible
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 text-primary fill-primary" />
                {doctor.rating} ({doctor.reviews})
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {doctor.distance}
              </span>
            </div>

            <div className="flex items-center gap-2 mt-2">
              {doctor.modality.includes("presencial") && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Building2 className="h-3 w-3" /> Presencial
                </span>
              )}
              {doctor.modality.includes("telemedicina") && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Video className="h-3 w-3" /> Telemedicina
                </span>
              )}
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
              <span className="text-lg font-bold text-foreground">
                S/ {doctor.price}
              </span>
              <Link to={`/doctor/${doctor.id}`}>
                <Button size="sm">Ver Perfil y Agendar</Button>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DoctorCard;
