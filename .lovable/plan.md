

## Rediseño del Historial Médico: Modelo de datos realista

### Problema actual

El modelo de datos es demasiado simplista y no refleja la realidad clínica:
- Una receta puede tener **múltiples medicamentos** + **indicaciones generales** (dieta, ejercicio) + **exámenes de laboratorio solicitados**
- Un examen de laboratorio incluye **múltiples pruebas** en una sola visita
- No hay forma de buscar/filtrar encuentros

### Nuevo modelo de datos

```text
Encounter (Consulta)
├── date, doctor, specialty
├── diagnosis: string + status (Activo/Resuelto)
├── prescriptions[] (medicamentos)
│   └── { medication, dosage, frequency, duration }
├── recommendations[] (indicaciones no-farmacológicas)
│   └── "Evitar ají", "No gaseosas", "Ejercicio 30min/día"
├── labOrders[] (exámenes solicitados por el médico)
│   └── "Hemograma", "Perfil lipídico"
└── notes?: string (observaciones generales)

Encounter (Laboratorio)
├── date, lab (nombre del laboratorio)
├── labResults[] (resultados de múltiples exámenes)
│   └── { test, result, referenceRange, status, unit }
└── orderedBy?: string (doctor que lo solicitó)
```

### Diseño UI de la card de consulta (timeline)

```text
┌──────────────────────────────────────────────────┐
│ 📅 15 Feb 2026 · Dr. Carlos Mendoza · Cardiología│
├──────────────────────────────────────────────────┤
│                                                   │
│ 🩺 Diagnóstico                                    │
│    Hipertensión arterial leve [Activo]            │
│                                                   │
│ 💊 Medicamentos (3)                               │
│    ┌──────────────────────────────────────┐       │
│    │ Losartán 50mg · 1/día · 3 meses     │       │
│    │ Amlodipino 5mg · 1/día · 3 meses    │       │
│    │ Aspirina 100mg · 1/día · continuo   │       │
│    └──────────────────────────────────────┘       │
│                                                   │
│ 📋 Indicaciones                                   │
│    • Reducir consumo de sal                       │
│    • Evitar ají y comidas picantes                │
│    • No consumir gaseosas                         │
│    • Caminar 30 minutos al día                    │
│                                                   │
│ 🧪 Exámenes solicitados                           │
│    • Hemograma completo                           │
│    • Perfil lipídico                              │
│    • Glucosa en ayunas                            │
│                                                   │
│ 📝 Notas: Control en 1 mes con resultados        │
│                                                   │
│ [📄 Descargar PDF]  [🔗 Compartir]                │
└──────────────────────────────────────────────────┘
```

### Card de laboratorio (timeline)

```text
┌──────────────────────────────────────────────────┐
│ 📅 10 Feb 2026 · Lab. Roe                         │
│ Solicitado por: Dr. Carlos Mendoza               │
├──────────────────────────────────────────────────┤
│ 🧪 Resultados (3 exámenes)                        │
│                                                   │
│ Hemograma completo         Normal     ✓          │
│ Perfil lipídico            LDL alto   ⚠          │
│   └ LDL: 165 mg/dL (ref: <130)                  │
│ Glucosa en ayunas          Normal     ✓          │
│   └ 92 mg/dL (ref: 70-100)                      │
│                                                   │
│ [📄 Descargar PDF]                                │
└──────────────────────────────────────────────────┘
```

### Cambios en `Historial.tsx`

1. **Actualizar interfaces**: Agregar `recommendations[]`, `labOrders[]`, `notes`, `specialty` a consultas. Agregar `referenceRange`, `unit` a lab results. Nuevo tipo `labResults` con `orderedBy`.

2. **Mock data realista**: 3-4 encounters con múltiples medicamentos, indicaciones de dieta/ejercicio, exámenes solicitados, y resultados de lab con rangos de referencia.

3. **Cards expandidas**: Cada sección dentro de la card usa un sub-header con icono + conteo (ej: "Medicamentos (3)"). Las secciones vacías no se muestran.

4. **Botones de acción**: Agregar botones "Descargar PDF" y "Compartir" (disabled/demo) en cada card, alineados con la memoria del proyecto sobre portabilidad.

5. **Barra de búsqueda**: Input de búsqueda sobre la timeline para filtrar encounters por diagnóstico, medicamento o doctor.

6. **Tab Recetas mejorada**: La tabla flat ahora muestra todas las columnas: fecha, medicamento, dosis, frecuencia, duración, doctor. Incluye también las indicaciones generales como filas con badge "Indicación".

7. **Tab Laboratorio mejorada**: Muestra resultados con valor numérico, rango de referencia, unidad, y badge de status con colores (verde normal, rojo anormal).

### Archivos a modificar

- `src/pages/Historial.tsx` — Único archivo: nuevo modelo de datos, cards rediseñadas, búsqueda, botones de acción

