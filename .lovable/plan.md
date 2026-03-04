

## Plan: Clinical Consultation Page with Voice Dictation

### What We're Building

A full consultation workspace where doctors document encounters during patient visits, with voice dictation support and insurance visibility.

### Key Pages & Components

#### 1. `src/pages/DoctorConsultation.tsx` (NEW)

Route: `/doctor/portal/consulta/:appointmentId`

Layout:

```text
┌──────────────────────────────────────────────────────┐
│  ← Volver a agenda                                   │
│                                                      │
│  ┌─ Patient Summary Bar ───────────────────────────┐ │
│  │ Juan Pérez · 45 años · M · O+ · Rímac (Seguro) │ │
│  │ ⚠ Alergias: Penicilina                          │ │
│  │ Condiciones: [Hipertensión] [Diabetes tipo 2]   │ │
│  └─────────────────────────────────────────────────┘ │
│                                                      │
│  ┌─ SOAP Form ─────────────────────────────────────┐ │
│  │  Motivo de consulta  [🎤] _______________       │ │
│  │  Síntomas            [🎤] _______________       │ │
│  │  Examen físico       [🎤] _______________       │ │
│  │  Diagnóstico         [🎤] _______________       │ │
│  │  Estado: [Activo ▾]                              │ │
│  │                                                  │ │
│  │  ── Recetas ──                                   │ │
│  │  [+ Agregar medicamento]                         │ │
│  │  Medicamento | Dosis | Frecuencia | Duración     │ │
│  │                                                  │ │
│  │  ── Indicaciones ──                              │ │
│  │  [+ Agregar indicación]                          │ │
│  │                                                  │ │
│  │  ── Órdenes ──                                   │ │
│  │  [+ Orden de laboratorio]                        │ │
│  │  [+ Referencia a cirugía]                        │ │
│  │                                                  │ │
│  │  Notas adicionales   [🎤] _______________       │ │
│  │                                                  │ │
│  │  [Guardar consulta]                              │ │
│  └─────────────────────────────────────────────────┘ │
│                                                      │
│  ▸ Historial previo (colapsable, últimas consultas)  │
└──────────────────────────────────────────────────────┘
```

Key detail: The **patient summary bar** prominently shows insurance type (e.g., "Rímac", "SIS", "Pacífico") with a badge, plus blood type and allergies as clinical alerts. This is critical for doctors to know coverage before prescribing.

#### 2. `src/components/VoiceDictation.tsx` (NEW)

Reusable microphone button using the **Web Speech API** (`SpeechRecognition`). Each text field gets one. Tap to start, tap to stop, text appends to the field. Works in Chrome/Edge. Shows a graceful fallback message in unsupported browsers.

#### 3. Entry Points — "Atender" Buttons

- **`src/pages/DoctorDashboard.tsx`**: Add "Atender" button next to each active appointment in the today's list, linking to `/doctor/portal/consulta/:appointmentId`
- **`src/pages/DoctorAgenda.tsx`**: Add "Atender" button on each non-cancelled/non-completed appointment slot

#### 4. Route — `src/App.tsx`

Add `consulta/:appointmentId` under the doctor layout.

#### 5. Data Flow — `src/data/encounters.ts`

Add a helper function `addEncounter()` that pushes a new encounter to the mock array. When the doctor saves:
- Creates a `ConsultationEncounter` with `patientId` from the appointment
- Optionally creates pending lab/surgery orders
- Marks appointment status as `completada`
- New records appear immediately in both doctor's patient record and patient's history

### Files Summary

| File | Action |
|------|--------|
| `src/pages/DoctorConsultation.tsx` | **New** — SOAP form with patient summary (including insurance) + voice |
| `src/components/VoiceDictation.tsx` | **New** — Mic button using Web Speech API |
| `src/pages/DoctorDashboard.tsx` | Add "Atender" button to appointment cards |
| `src/pages/DoctorAgenda.tsx` | Add "Atender" button to time slots |
| `src/App.tsx` | Add route `consulta/:appointmentId` |
| `src/data/encounters.ts` | Add `addEncounter` helper for saving new records |

