

## Problem

The public navbar shows "Mi Historial" (requires login) and the Index page has a "Soy Médico" button — both inappropriate for unauthenticated users. The user wants to simplify navigation to focus on the core patient journey: finding a doctor and booking an appointment.

## Plan

### 1. Redesign Navbar (`src/components/Navbar.tsx`)

Replace current nav links with:
- **Directorio Médico** — link to `/directorio`
- **Agendar Cita** — a prominent CTA button with a dropdown (Popover) offering two options:
  - **Cita Presencial** — navigates to `/directorio?tipo=presencial` with a MapPin icon
  - **Cita Virtual** — navigates to `/directorio?tipo=telemedicina` with a Video icon

Remove "Teleconsulta" as a standalone link (folded into the "Agendar Cita" flow). Keep "Iniciar Sesión" and theme toggle.

Desktop layout: `Logo | Directorio Médico | [Agendar Cita ▾] | theme | Iniciar Sesión`

Mobile menu: Same items stacked vertically, with the two appointment options shown inline (no popover needed on mobile — just two buttons/links).

### 2. Remove "Soy Médico" from Index (`src/pages/Index.tsx`)

Remove the "Soy Médico" button from the hero section (lines 77-83). The hero already has the search bar which is the primary CTA.

### Files to edit
- `src/components/Navbar.tsx` — redesign nav links + add Agendar Cita popover
- `src/pages/Index.tsx` — remove "Soy Médico" button

