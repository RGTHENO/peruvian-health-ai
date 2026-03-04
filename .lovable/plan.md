

## Plan: Make All Buttons and Navigation Fully Functional

### Problem
Multiple buttons and navigation links across the app are non-functional — they either point to `/` (home) or have no action at all.

### Non-functional elements identified

| Element | Location | Current behavior |
|---|---|---|
| "Soy Médico" button | Hero (Index) | No link |
| "Teleconsulta" link | Navbar + Footer | Points to `/` |
| "Mi Historial" link | Navbar + Footer | Points to `/` |
| "Iniciar Sesión" button | Navbar | No action |
| "Reservar cita" button | DoctorProfile | No confirmation after click |
| "Portal Médico" link | Footer | Points to `/` |
| "IA Clínica" link | Footer | Points to `/` |
| "Privacidad" link | Footer | Points to `/` |
| "Términos de Uso" link | Footer | Points to `/` |
| "Configuración" button | DoctorSidebar | No action |

### New pages to create (6 pages)

1. **`/teleconsulta`** — Teleconsulta page explaining the video consultation service, with a CTA to browse doctors filtered by telemedicine modality
2. **`/historial`** — Medical history page showing a placeholder patient record view (diagnoses, prescriptions, lab results) with a prompt to log in
3. **`/iniciar-sesion`** — Login page with email/password form (frontend only, no backend auth yet) with tabs for patient/doctor login
4. **`/privacidad`** — Privacy policy page (Ley 29733 content)
5. **`/terminos`** — Terms of use page
6. **`/doctor/portal/configuracion`** — Doctor settings page within the portal layout (profile info, notification preferences)

### Booking confirmation flow
- When user clicks "Reservar" on DoctorProfile, show a confirmation dialog (Dialog component) summarizing: doctor name, selected time, price, and payment method options. Include a "Confirmar Reserva" button that shows a success toast via Sonner.

### Updates to existing components

- **`Navbar.tsx`**: Update "Teleconsulta" → `/teleconsulta`, "Mi Historial" → `/historial`, "Iniciar Sesión" → `Link to /iniciar-sesion`
- **`Footer.tsx`**: Update all links to their correct routes (`/teleconsulta`, `/historial`, `/doctor/portal`, `/privacidad`, `/terminos`). Remove "IA Clínica" link (no standalone page needed — redirect to portal)
- **`Index.tsx`**: Wrap "Soy Médico" button in `Link to="/iniciar-sesion"`
- **`DoctorProfile.tsx`**: Add booking confirmation Dialog + success toast
- **`DoctorSidebar.tsx`**: Update "Configuración" to link to `/doctor/portal/configuracion`
- **`DoctorMobileNav.tsx`**: Add "Configuración" nav item
- **`App.tsx`**: Register all 6 new routes (including `configuracion` as a nested route under the doctor portal)

### Technical approach
- All new pages follow existing patterns: Navbar + Footer wrapper for public pages, DoctorLayout for portal pages
- Login page is UI-only (form with validation via react-hook-form + zod), no actual auth backend
- Legal pages are static content with proper formatting
- Booking confirmation uses existing Dialog + Sonner toast components

