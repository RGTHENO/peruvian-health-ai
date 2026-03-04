

## Analysis

The current flow has two key problems:

1. **Navbar "Agendar Cita" dropdown is premature** — forcing the user to choose presencial/virtual before even browsing doctors adds friction. The patient wants to explore, compare, check distances, availability, and prices first. The modality choice should happen **at the booking moment** (on the doctor's profile), not at navigation level.

2. **The booking flow on DoctorProfile doesn't differentiate modality** — currently it shows a generic "Reservar Cita" with time slots but never asks if it's virtual or presencial, and doesn't show what happens after booking (e.g., where's the video call link?).

## Plan

### 1. Simplify Navbar (`src/components/Navbar.tsx`)

Replace the "Agendar Cita" popover dropdown with a **single direct link/button** that goes to `/directorio`. The directory already has a modality filter — let the user discover and filter there naturally.

New desktop layout:
```
Logo | Directorio Médico | [Buscar Médico] button | Iniciar Sesión
```

Actually, even simpler — since "Directorio Médico" and "Buscar Médico" overlap, keep just:
```
Logo | Directorio Médico (link) | [Agendar Cita] (button → /directorio) | Iniciar Sesión
```

The "Agendar Cita" button navigates directly to `/directorio` — no dropdown. The directory page already has the modality filter built in.

Mobile menu: same — two items stacked, no dropdown complexity.

### 2. Add modality selection to booking flow (`src/pages/DoctorProfile.tsx`)

In the booking sidebar, **after selecting a time slot**, add a modality picker showing only the modalities the doctor supports. This is where the patient decides:

- **Step 1**: Select time slot (existing)
- **Step 2**: Select modality — show toggle/radio buttons:
  - 🏥 **Presencial** — "En consultorio · San Isidro, Lima"
  - 📹 **Virtual** — "Videollamada por WhatsApp"
- **Step 3**: "Reservar" button (existing)

Only show modalities the doctor supports (from `doctor.modality` array). If the doctor only has one modality, auto-select it and show it as info (no choice needed).

### 3. Update confirmation dialog with modality details (`src/pages/DoctorProfile.tsx`)

In the booking confirmation dialog, add a row showing the selected modality with clear next-step info:

- If **presencial**: Show "Modalidad: Presencial — Consultorio en {doctor.location}" with a MapPin icon
- If **virtual**: Show "Modalidad: Virtual — Recibirás un enlace de WhatsApp videollamada al número registrado" with a Video icon

After confirmation toast, include modality-specific message:
- Presencial: "Te esperamos en {location}. Llega 10 min antes."
- Virtual: "Recibirás el enlace de WhatsApp videollamada 15 min antes de tu cita."

### 4. Update DoctorCard to show "Agendar" CTA (`src/components/DoctorCard.tsx`)

Change the "Ver Perfil" button text to **"Ver Perfil y Agendar"** to better communicate the action — subtle copy improvement that aligns with the flow.

### Technical decisions on video calls

For a Peruvian healthcare context (March 2026), **WhatsApp videollamada** is the best choice because:
- 95%+ smartphone penetration in Peru uses WhatsApp
- No app installation needed — patients already have it
- Works on low bandwidth (common in provinces)
- Doctors already use it informally

The flow: After booking confirmation, the system would send the doctor's WhatsApp business number (or a wa.me link) to the patient via email/SMS. The doctor initiates the WhatsApp video call at the scheduled time. This is simulated in the UI for now.

### Files to modify
- `src/components/Navbar.tsx` — remove popover, make "Agendar Cita" a direct link to `/directorio`
- `src/pages/DoctorProfile.tsx` — add modality selection step + update confirmation dialog
- `src/components/DoctorCard.tsx` — update button copy

