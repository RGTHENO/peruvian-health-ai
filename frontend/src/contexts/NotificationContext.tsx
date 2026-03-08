import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  dismissNotification as dismissNotificationRequest,
  fetchNotificationPreferences,
  fetchNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  updateNotificationPreferences,
} from "@/lib/api";
import {
  type AppNotification,
  type NotificationPreferences,
  notificationTypeToPreference,
} from "@/data/notifications";
import { useAuth } from "@/contexts/AuthContext";

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
  savePreferences: (prefs?: NotificationPreferences) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFS);

  const notificationsQuery = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: fetchNotifications,
    enabled: Boolean(user),
  });

  const preferencesQuery = useQuery({
    queryKey: ["notification-preferences", user?.id],
    queryFn: fetchNotificationPreferences,
    enabled: Boolean(user),
  });

  useEffect(() => {
    if (preferencesQuery.data) {
      setPreferences(preferencesQuery.data);
    } else if (!user) {
      setPreferences(DEFAULT_PREFS);
    }
  }, [preferencesQuery.data, user]);

  const notifications = useMemo(
    () => notificationsQuery.data ?? [],
    [notificationsQuery.data],
  );

  const updateNotificationsCache = useCallback(
    (updater: (current: AppNotification[]) => AppNotification[]) => {
      queryClient.setQueryData<AppNotification[]>(["notifications", user?.id], (current = []) =>
        updater(current),
      );
    },
    [queryClient, user?.id],
  );

  const markAsReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: (notification) => {
      updateNotificationsCache((current) =>
        current.map((item) => (item.id === notification.id ? notification : item)),
      );
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: (nextNotifications) => {
      queryClient.setQueryData(["notifications", user?.id], nextNotifications);
    },
  });

  const dismissNotificationMutation = useMutation({
    mutationFn: dismissNotificationRequest,
    onSuccess: (_, notificationId) => {
      updateNotificationsCache((current) =>
        current.filter((notification) => notification.id !== notificationId),
      );
    },
  });

  const savePreferencesMutation = useMutation({
    mutationFn: updateNotificationPreferences,
    onSuccess: (nextPreferences) => {
      queryClient.setQueryData(["notification-preferences", user?.id], nextPreferences);
      setPreferences(nextPreferences);
    },
  });

  const filteredNotifications = useMemo(
    () =>
      notifications.filter((notification) => {
        const prefKey = notificationTypeToPreference[notification.type];
        return preferences[prefKey];
      }),
    [notifications, preferences],
  );

  const unreadCount = filteredNotifications.filter((notification) => !notification.read).length;

  const markAsRead = useCallback(
    (id: string) => {
      updateNotificationsCache((current) =>
        current.map((item) => (item.id === id ? { ...item, read: true } : item)),
      );
      markAsReadMutation.mutate(id);
    },
    [markAsReadMutation, updateNotificationsCache],
  );

  const handleMarkAllAsRead = useCallback(() => {
    updateNotificationsCache((current) => current.map((item) => ({ ...item, read: true })));
    markAllAsReadMutation.mutate();
  }, [markAllAsReadMutation, updateNotificationsCache]);

  const handleDismiss = useCallback(
    (id: string) => {
      updateNotificationsCache((current) =>
        current.filter((notification) => notification.id !== id),
      );
      dismissNotificationMutation.mutate(id);
    },
    [dismissNotificationMutation, updateNotificationsCache],
  );

  const savePreferences = useCallback(
    async (nextPreferences?: NotificationPreferences) => {
      const payload = nextPreferences ?? preferences;
      setPreferences(payload);
      await savePreferencesMutation.mutateAsync(payload);
    },
    [preferences, savePreferencesMutation],
  );

  const value = useMemo<NotificationContextValue>(
    () => ({
      notifications,
      filteredNotifications,
      preferences,
      unreadCount,
      markAsRead,
      markAllAsRead: handleMarkAllAsRead,
      dismissNotification: handleDismiss,
      setPreferences,
      savePreferences,
    }),
    [
      notifications,
      filteredNotifications,
      preferences,
      unreadCount,
      markAsRead,
      handleMarkAllAsRead,
      handleDismiss,
      setPreferences,
      savePreferences,
    ],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
