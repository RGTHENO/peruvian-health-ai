import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Video, Building2, ArrowRight } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Doctor } from "@/data/doctors";

const DoctorCard = ({ doctor }: { doctor: Doctor }) => {
  const ctaLabel = doctor.available ? "Ver horarios" : "Ver perfil";
  const initials = doctor.name
    .split(" ")
    .filter((_, i) => i === 0 || i === 2)
    .map((n) => n[0])
    .join("");

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-border">
      <CardContent className="p-5">
        <div className="flex flex-col gap-4 sm:flex-row">
          <Avatar className="h-14 w-14 border-2 border-primary/20">
            <AvatarFallback className="bg-accent text-accent-foreground font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-2">
              <div>
                <h3 className="font-semibold text-foreground truncate">{doctor.name}</h3>
                <p className="text-sm text-primary font-medium">{doctor.specialty}</p>
              </div>
              {doctor.available && (
                <Badge variant="secondary" className="w-fit bg-accent text-accent-foreground text-xs">
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

            <div className="mt-2 flex flex-wrap items-center gap-2">
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

            <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-lg font-bold text-foreground">
                S/ {doctor.price}
              </span>
              <Button asChild size="sm" className="h-10 w-full sm:w-auto">
                <Link
                  to={`/doctor/${doctor.id}`}
                  aria-label={`${ctaLabel} de ${doctor.name}`}
                >
                  {ctaLabel}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DoctorCard;
