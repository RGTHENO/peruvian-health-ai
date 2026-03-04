

## Rediseño del Tab Laboratorio + Nuevos Datos de Ejemplo

### Problemas actuales
1. Solo hay 1 visita al laboratorio -- necesita otra para demostrar agrupación
2. La presentación actual es densa: la barra de rango con los colores rojo/verde no es intuitiva para una persona mayor. El texto "Ref: < 130" no comunica nada claro
3. Cada resultado ocupa demasiado espacio vertical con la barra de rango

### Solución: Diseño simplificado tipo "reporte médico amigable"

Cada visita al laboratorio es una card colapsable. Dentro, cada resultado se presenta como una fila simple con un indicador visual claro:

```text
┌──────────────────────────────────────────────────────┐
│ 🧪 10 Feb 2026 · Laboratorio Roe                     │
│    Dr. Carlos Mendoza · 5 exámenes                   │
│    ✅ 4 bien  ·  ⚠️ 1 necesita atención         ▼   │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ⚠️ Colesterol LDL                                   │
│     Tu resultado: 165 mg/dL                          │
│     Lo ideal: menor a 130 mg/dL                      │
│     ██████████████████████████████░░░░ ALTO           │
│                                                      │
│  ✅ Glucosa en ayunas                                 │
│     Tu resultado: 92 mg/dL                           │
│     Lo ideal: entre 70 y 100 mg/dL                   │
│     ████████████████████░░░░░░░░░░ BIEN              │
│                                                      │
│  ✅ Hemograma completo — Normal                       │
│                                                      │
│  📄 Descargar PDF                                     │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│ 🧪 05 Mar 2026 · Laboratorio Suiza Lab               │
│    Dr. Carlos Mendoza · 4 exámenes                   │
│    ✅ 3 bien  ·  ⚠️ 1 necesita atención         ▶   │
└──────────────────────────────────────────────────────┘
```

### Cambios clave

**1. `src/data/encounters.ts`** — Agregar segunda visita al laboratorio:
- Fecha: "05 Mar 2026", Lab: "Laboratorio Suiza Lab", ordenado por Dr. Carlos Mendoza
- Resultados: Colesterol LDL (mejorado a 138, aún anormal), HDL 55 (normal), Triglicéridos 130 (normal), Hemoglobina glicosilada 5.4% (normal)
- Esto simula un chequeo de seguimiento al mes siguiente

**2. `src/components/LabCard.tsx`** — Rediseño completo del componente:
- **Header**: Más grande y claro. Muestra fecha, laboratorio, doctor, conteo con texto "X bien · Y necesita atención"
- **Resultados individuales**: Eliminar la barra de rango técnica. Reemplazar con:
  - Texto en lenguaje natural: "Tu resultado: 165 mg/dL" y "Lo ideal: menor a 130 mg/dL"
  - Transformar "< 130" → "menor a 130", "> 40" → "mayor a 40", "70 – 100" → "entre 70 y 100"
  - Una barra de progreso simple (verde si normal, rojo/naranja si anormal) sin números en los extremos
  - Etiqueta grande: "BIEN" (verde) o "ALTO" / "BAJO" (rojo) según si el resultado excede o no el rango
- **Resultados no numéricos** (como "Hemograma completo: Normal"): mostrar en una sola línea simple con check verde
- Resultados anormales siguen apareciendo primero
- Texto más grande (text-lg para nombres, text-base para valores)
- Más padding y espaciado para facilitar lectura

### Archivos a modificar
1. `src/data/encounters.ts` — agregar nuevo LabEncounter
2. `src/components/LabCard.tsx` — rediseño del componente

