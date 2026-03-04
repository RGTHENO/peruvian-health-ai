

## Problem

The doctor clicks a patient card and sees a small dialog with only basic contact info and a list of appointment dates. This is almost useless clinically. A doctor needs to see the patient's **full medical history** (consultations, labs, surgeries, prescriptions) to make informed decisions during a visit.

Currently, the rich clinical data (encounters from `encounters.ts`) exists and is beautifully rendered in the patient-facing `/historial` page, but is completely disconnected from the doctor portal.

## Solution: Dedicated Patient Record Page

Instead of a dialog, clicking a patient card navigates to a **full-page patient record** at `/doctor/portal/pacientes/:patientId`. This page becomes the doctor's primary clinical tool.

### Page Structure

```text
┌──────────────────────────────────────────────────────┐
│  ← Volver a pacientes                               │
│                                                      │
│  ┌─────────────────────────────────────────────────┐ │
│  │ 👤 Juan Pérez Sánchez                           │ │
│  │ 45 años · Masculino · Rímac · +51 987 654 321  │ │
│  │ [Hipertensión] [Diabetes tipo 2]                │ │
│  │                                                 │ │
│  │ Alergias: Penicilina    Sangre: O+              │ │
│  └─────────────────────────────────────────────────┘ │
│                                                      │
│  [Consultas] [Cirugías] [Recetas] [Laboratorio]      │
│                                                      │
│  (Same timeline + cards as /historial, reusing       │
│   ConsultationCard, LabCard, SurgeryCard,            │
│   PrescriptionCard components)                       │
│                                                      │
│  ┌─────────────────────────────────────────────────┐ │
│  │ 📅 Próximas citas                               │ │
│  │ 2026-03-04 09:00 — Resultados de laboratorio    │ │
│  └─────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────┘
```

### Why a full page instead of a bigger dialog

- Dialogs constrain vertical space; medical records are inherently long
- A dedicated route is bookmarkable, shareable between doctors
- The doctor can focus entirely on one patient without the grid behind
- Mobile: a dialog would be nearly full-screen anyway; a page is cleaner

## Implementation Plan

### 1. Extend Patient data model (`src/data/appointments.ts`)

Add clinical fields to `Patient`: `bloodType`, `allergies`, `emergencyContact`. Link patients to encounters by adding a `patientId` field to existing mock encounters in `encounters.ts`.

### 2. Create patient record page (`src/pages/DoctorPatientRecord.tsx`)

- **Header**: Patient summary card (name, age, gender, insurance, phone, email, conditions, allergies, blood type)
- **Tabs**: Reuse the same `Tabs` structure from `Historial.tsx` with the 4 tabs (Consultas, Cirugías, Recetas, Laboratorio), rendering the same card components (`ConsultationCard`, `LabCard`, `SurgeryCard`, `PrescriptionCard`)
- **Sidebar section**: Upcoming appointments for this patient
- Filter encounters by `patientId`

### 3. Add route (`src/App.tsx`)

Add nested route: `pacientes/:patientId` under the doctor layout, rendering `DoctorPatientRecord`.

### 4. Update patient list (`src/pages/DoctorPatients.tsx`)

- Replace `onClick → setSelectedPatient` with `navigate(/doctor/portal/pacientes/${patient.id})`
- Remove the Dialog entirely
- Keep the search and grid as-is

### 5. Update encounters data (`src/data/encounters.ts`)

Add `patientId` to each encounter interface and mock data so records can be filtered per patient. Distribute existing encounters across patients (e.g., Juan gets the hypertension consultation and cholesterol labs, Roberto gets the cardiac encounters, etc.).

### Summary of files changed

| File | Action |
|------|--------|
| `src/data/appointments.ts` | Add `bloodType`, `allergies`, `emergencyContact` to Patient |
| `src/data/encounters.ts` | Add `patientId` to all encounter types and mock data |
| `src/pages/DoctorPatientRecord.tsx` | **New** — full patient record page |
| `src/pages/DoctorPatients.tsx` | Replace dialog with navigation |
| `src/App.tsx` | Add route `pacientes/:patientId` |

