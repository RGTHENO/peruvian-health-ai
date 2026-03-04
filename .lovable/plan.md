

## Análisis del problema

Tienes razón: el navbar tiene "Agendar Cita" → `/directorio`, el hero tiene un buscador → `/directorio`, y el CTA final tiene "Explorar Directorio" → `/directorio`. Tres elementos apuntando al mismo destino. Esto viola el principio de **progressive disclosure** y desperdicia oportunidades de conversión.

La mejor práctica en 2026 para landing pages de salud digital (referencia: patrones de Doctolib, Zocdoc, Doctoralia) es que **cada elemento tenga un propósito diferente según el punto del journey del usuario**:

## Plan

### Principio: cada CTA corresponde a una etapa del funnel

```text
┌─────────────────────────────────────────────────┐
│ NAVBAR (persistente)                            │
│  Logo    [Agendar Cita] → /directorio           │
│  → Usuario que ya decidió, acceso rápido        │
├─────────────────────────────────────────────────┤
│ HERO (primera impresión)                        │
│  Buscador: "Cardiólogo en Lima..."              │
│  → Usuario explorando, no sabe qué quiere      │
├─────────────────────────────────────────────────┤
│ Stats → Features → ...scroll...                 │
├─────────────────────────────────────────────────┤
│ CTA FINAL (cierre de persuasión)                │
│  "Encuentra tu médico ideal"                    │
│  [Buscar Especialista] + [Soy Médico]           │
│  → Doble conversión: paciente + médico          │
└─────────────────────────────────────────────────┘
```

### Cambios en `src/pages/Index.tsx` — Sección CTA final

Transformar el CTA final para que **no sea redundante** sino un cierre de doble conversión:

- **Heading**: Cambiar a "Encuentra tu médico ideal"
- **Subtítulo**: "Más de 500 especialistas verificados listos para atenderte"
- **Botón primario**: "Buscar Especialista" → `/directorio` (acción paciente)
- **Botón secundario**: "Soy Médico" → `/doctor/portal` (acción médico — captura el otro lado del marketplace)

Esto elimina la redundancia porque:
1. El **navbar** es acceso rápido persistente (usuario decidido)
2. El **hero** es búsqueda exploratoria (usuario descubriendo)
3. El **CTA final** es cierre de doble marketplace (paciente convencido + captación de médicos)

### Archivos a modificar
- `src/pages/Index.tsx` — solo la sección CTA (líneas 123-140)

