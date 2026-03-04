

## Analysis

Currently, the notification system is purely cosmetic: DoctorSettings has toggle switches for notification preferences, but there is no actual notification delivery mechanism. No in-app notification center, no bell icon with badge, no notification data store.

## Plan: Non-Intrusive In-App Notification System

The goal is a subtle, respectful notification experience that informs without disrupting clinical workflows.

### Design Principles
- **Quiet by default**: No sounds, no pop-ups blocking content. Use a bell icon with a small badge count.
- **Batched, not real-time interruptions**: Notifications accumulate silently in a dropdown panel; the doctor checks them at their own pace.
- **Sonner toasts only for user-initiated actions** (save, submit). Never auto-trigger toasts for incoming notifications.
- **Respects settings**: The notification preferences in DoctorSettings will actually filter which notifications appear.

### Changes

**1. Create notification data store (`src/data/notifications.ts`)**
- Define a `Notification` type with `id`, `type` (appointment | reminder | cancellation | system), `title`, `message`, `timestamp`, `read`, `link` (optional route).
- Seed with ~5 realistic mock notifications (e.g., "Juan Perez confirmed appointment", "Appointment in 30 min", "Carmen Rios cancelled").

**2. Create notification context (`src/contexts/NotificationContext.tsx`)**
- React context with state for notifications list and user preferences (synced with DoctorSettings toggles).
- Functions: `markAsRead(id)`, `markAllAsRead()`, `dismissNotification(id)`, `getUnreadCount()`.
- Filter notifications based on saved preferences (newAppointment, reminder, cancellation, marketing).

**3. Create notification bell dropdown (`src/components/NotificationBell.tsx`)**
- Bell icon (from lucide) with a small red dot/badge showing unread count (only when > 0).
- Clicking opens a Popover (not a full page) with a scrollable list of notifications.
- Each item shows: icon by type, title, relative time ("hace 5 min"), and a subtle unread indicator.
- "Marcar todo como leido" link at top. Click a notification to navigate to its link and mark as read.
- Empty state: "No tienes notificaciones" with a subtle icon.

**4. Integrate bell into DoctorLayout**
- Add a top header bar to `DoctorLayout` (visible on both desktop and mobile) containing the NotificationBell in the top-right corner.
- On mobile, the bell sits in the top bar above content, not in the bottom nav (to avoid clutter).

**5. Wire DoctorSettings preferences to context**
- The toggle switches in DoctorSettings will read/write from the NotificationContext so preferences actually filter visible notifications.
- "Guardar preferencias" persists to localStorage.

### Files to create
- `src/data/notifications.ts` — types and mock data
- `src/contexts/NotificationContext.tsx` — state management
- `src/components/NotificationBell.tsx` — bell + popover dropdown

### Files to edit
- `src/layouts/DoctorLayout.tsx` — add header bar with NotificationBell
- `src/pages/DoctorSettings.tsx` — connect toggles to NotificationContext
- `src/App.tsx` — wrap doctor routes with NotificationProvider

