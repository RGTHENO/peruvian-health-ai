import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import { AppNotification, mockNotifications, notificationTypeToPreference } from "@/data/notifications";

export interface NotificationPreferences {
  newAppointment: boolean;
  reminder: boolean;
  cancellation: boolean;
  marketing: boolean;
}

const DEFAULT_PREFS: NotificationPreferences = {
  newAppointment: true,
  reminder: true,
  cancellation: true,
  marketing: false,
};

interface NotificationContextValue {
  notifications: AppNotification[];
  filteredNotifications: AppNotification[];
  preferences: NotificationPreferences;
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  dismissNotification: (id: string) => void;
  setPreferences: (prefs: NotificationPreferences) => void;
  savePreferences: () => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>(mockNotifications);
  const [preferences, setPreferences] = useState<NotificationPreferences>(() => {
    try {
      const saved = localStorage.getItem("notification_prefs");
      return saved ? JSON.parse(saved) : DEFAULT_PREFS;
    } catch {
      return DEFAULT_PREFS;
    }
  });

  const filteredNotifications = useMemo(
    () =>
      notifications.filter((n) => {
        const prefKey = notificationTypeToPreference[n.type];
        return preferences[prefKey as keyof NotificationPreferences];
      }),
    [notifications, preferences]
  );

  const unreadCount = filteredNotifications.filter((notification) => !notification.read).length;

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const savePreferences = useCallback(() => {
    localStorage.setItem("notification_prefs", JSON.stringify(preferences));
  }, [preferences]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        filteredNotifications,
        preferences,
        unreadCount,
        markAsRead,
        markAllAsRead,
        dismissNotification,
        setPreferences,
        savePreferences,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
