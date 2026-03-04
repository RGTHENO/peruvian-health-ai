

## Reorganización del Historial Médico: Vista por Consultas (Timeline)

### Problema actual
Diagnósticos, recetas y laboratorios están en 3 columnas separadas. El paciente debe cruzar información mentalmente para entender qué pasó en cada visita médica.

### Solución: Vista Timeline por Consulta

Reorganizar los datos en una **línea de tiempo vertical** donde cada tarjeta representa una **consulta médica (encounter)**, agrupando dentro de ella el diagnóstico, recetas y labs asociados.

```text
┌─────────────────────────────────────────────────┐
│  [Tabs: Consultas | Recetas | Laboratorio ]     │
├─────────────────────────────────────────────────┤
│                                                  │
│  ● 15 Feb 2026 · Dr. Carlos Mendoza             │
│  ┌─────────────────────────────────────────┐     │
│  │ 🩺 Hipertensión arterial leve  [Activo] │     │
│  │                                         │     │
│  │ 💊 Receta: Losartán 50mg                │     │
│  │    1 vez al día · 3 meses               │     │
│  └─────────────────────────────────────────┘     │
│                                                  │
│  ● 10 Feb 2026 · Lab. Roe                        │
│  ┌─────────────────────────────────────────┐     │
│  │ 🧪 Hemograma completo → Normal          │     │
│  │ 🧪 Perfil lipídico → LDL elevado        │     │
│  └─────────────────────────────────────────┘     │
│                                                  │
│  ● 03 Ene 2026 · Dra. Ana Gutiérrez             │
│  ┌─────────────────────────────────────────┐     │
│  │ 🩺 Rinitis alérgica estacional [Resuelto]│    │
│  │                                         │     │
│  │ 💊 Receta: Loratadina 10mg              │     │
│  │    1 vez al día · 14 días               │     │
│  └─────────────────────────────────────────┘     │
└─────────────────────────────────────────────────┘
```

### Cambios en `Historial.tsx`

1. **Nuevo modelo de datos**: Reemplazar las 3 arrays separadas por un array `mockEncounters` que agrupa todo por consulta, con fecha, doctor, diagnóstico, recetas[] y labs[]

2. **Tabs con Radix UI**: Agregar tabs "Consultas" (vista timeline, default), "Recetas" (lista plana de todas las recetas), "Laboratorio" (lista plana de labs) para quienes quieran filtrar por tipo

3. **Timeline vertical**: Cada encounter es una Card con línea temporal izquierda (border-left + dot), mostrando:
   - Header: fecha + doctor + badge de status
   - Sección diagnóstico con icono
   - Sección recetas (si aplica) con icono de pastilla
   - Sección labs (si aplica) con icono de flask

4. **Tab "Recetas"**: Tabla simple con todas las recetas, medicamento, dosis, duración, doctor, fecha

5. **Tab "Laboratorio"**: Tabla simple con todos los resultados, test, resultado, laboratorio, fecha

### Beneficios
- Flujo mental natural: "fui al doctor → me diagnosticaron → me recetaron"
- Alineado con FHIR Encounters
- Tabs permiten vista rápida por categoría cuando se necesite

