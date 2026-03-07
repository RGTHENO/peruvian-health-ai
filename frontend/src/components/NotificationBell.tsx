import { Bell, CalendarCheck, Clock, XCircle, Info, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useNotifications } from "@/contexts/NotificationContext";
import { NotificationType } from "@/data/notifications";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { useState } from "react";

const typeIcon: Record<NotificationType, React.ReactNode> = {
  appointment: <CalendarCheck className="h-4 w-4 text-primary" />,
  reminder: <Clock className="h-4 w-4 text-amber-500" />,
  cancellation: <XCircle className="h-4 w-4 text-destructive" />,
  system: <Info className="h-4 w-4 text-muted-foreground" />,
};

const NotificationBell = () => {
  const { filteredNotifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleClick = (id: string, link?: string) => {
    markAsRead(id);
    if (link) {
      navigate(link);
      setOpen(false);
    }
  };

  return (
      <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-11 w-11"
          aria-label={
            unreadCount > 0
              ? `Abrir notificaciones, ${unreadCount} sin leer`
              : "Abrir notificaciones"
          }
        >
          <Bell className="h-5 w-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[calc(100vw-1rem)] max-w-80 p-0">
        <div className="flex items-center justify-between px-4 py-3">
          <p className="text-sm font-semibold text-foreground">Notificaciones</p>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1 text-xs text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <Check className="h-3 w-3" /> Marcar todo como leído
            </button>
          )}
        </div>
        <Separator />
        <ScrollArea className="max-h-72">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Bell className="h-8 w-8 mb-2 opacity-30" />
              <p className="text-sm">No tienes notificaciones</p>
            </div>
          ) : (
            filteredNotifications.map((n) => (
              <button
                key={n.id}
                onClick={() => handleClick(n.id, n.link)}
                className={`flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring ${
                  !n.read ? "bg-accent/20" : ""
                }`}
              >
                <div className="mt-0.5 shrink-0">{typeIcon[n.type]}</div>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm ${!n.read ? "font-semibold" : "font-normal"} text-foreground truncate`}>
                    {n.title}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground/70">
                    {formatDistanceToNow(n.timestamp, { addSuffix: true, locale: es })}
                  </p>
                </div>
                {!n.read && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />}
              </button>
            ))
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
