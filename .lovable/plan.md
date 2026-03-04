

## Rediseño del Tab "Recetas": Agrupación por Consulta

### Problema
La lista plana mezcla medicamentos e indicaciones de todas las consultas sin separación visual. Con muchas citas, se vuelve abrumador e imposible saber qué se recetó en cada visita.

### Solución: Cards colapsables por consulta (igual que el tab Consultas)

Reutilizar el mismo patrón de cards colapsables del tab Consultas, pero enfocado solo en recetas e indicaciones:

```text
┌──────────────────────────────────────────────────┐
│ 📅 15 Feb 2026 · Dr. Carlos Mendoza · Cardiología│
│    3 medicamentos · 5 indicaciones          ▼    │
├──────────────────────────────────────────────────┤
│ 💊 Medicamentos                                   │
│    Losartán 50mg · 1/día · 3 meses               │
│    Amlodipino 5mg · 1/día · 3 meses             │
│    Aspirina 100mg · 1/día · continuo             │
│                                                   │
│ 📋 Indicaciones                                   │
│    • Reducir consumo de sal                       │
│    • Evitar ají y comidas picantes                │
│    • No consumir gaseosas                         │
│    • Caminar 30 minutos al día                    │
│    • Control de presión arterial semanal          │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│ 📅 03 Ene 2026 · Dra. Ana Gutiérrez · Med. Gen. │
│    2 medicamentos · 3 indicaciones          ▼    │
└──────────────────────────────────────────────────┘
```

### Cambios

**`src/pages/Historial.tsx`** — Tab "Recetas":
- Reemplazar la tabla plana por cards colapsables agrupadas por consulta
- Filtrar solo encounters tipo "consultation"
- Cada card muestra header con fecha/doctor/conteos, y al expandir muestra medicamentos + indicaciones separados por sección
- Primera card expandida por defecto, resto colapsadas
- Mismo estilo visual que el tab Consultas para consistencia

