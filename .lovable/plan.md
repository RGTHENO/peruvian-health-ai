

## Critical Analysis of Current Lab Card

Looking at the screenshot, I identify these issues:

1. **Number "165" is too large** — the `text-xl` creates a jarring size jump vs the test name. It screams "dashboard KPI", not "medical result row"
2. **"ref < 130 mg/dL" is cryptic** — still too technical. The dot separator `·` gets lost
3. **Abnormal row background** (`bg-destructive/[0.04]`) is barely visible — the pink tint is too subtle to signal importance
4. **Status chips are too small** and too far right — they float disconnected from the result they describe
5. **"Normal" label for Hemograma** is redundant with the green chip — wastes a full row height for minimal info
6. **Header icon** (flask in gray box) is bland. The `bg-accent` box looks like a placeholder
7. **Dividers** (`divide-border/30`) are too faint — rows blend together
8. **"Descargar PDF" button** is orphaned at the bottom with too much padding above
9. **Overall vertical rhythm** — rows have inconsistent density. Numeric rows are tall, non-numeric rows are short

## Redesign: Modern Clinical Card

Inspired by Apple Health, Headspace, and fintech apps. Key principles:
- **Consistent row height** regardless of content type
- **Left color accent strip** on abnormal results instead of full-row tint
- **Inline status** next to the value, not floating on the far right
- **Tighter typography scale**: result values at `text-base font-bold`, not `text-xl`

```text
┌────────────────────────────────────────────────────────┐
│  🧪 Laboratorio Roe                          4✓  1⚠  │
│     10 Feb 2026 · Dr. Carlos Mendoza              ▼   │
├────────────────────────────────────────────────────────┤
│ ┃  Colesterol LDL                                      │
│ ┃  165 mg/dL  ·  ideal < 130        ⊘ Elevado         │
│                                                        │
│    Hemograma completo                                  │
│    Normal                            ✓ En rango        │
│                                                        │
│    Colesterol HDL                                      │
│    52 mg/dL  ·  ideal > 40           ✓ En rango        │
│    ...                                                 │
│                                                        │
│    📄 Descargar PDF                                    │
└────────────────────────────────────────────────────────┘
```

## Changes to `src/components/LabCard.tsx`

1. **Result values**: `text-base font-bold` (not `text-xl`) — proportional to row
2. **Reference text**: Change "ref < 130 mg/dL" → "ideal < 130" — shorter, clearer
3. **Abnormal rows**: Add a `border-l-3 border-amber-500` left accent strip + slightly warmer background `bg-amber-50/60 dark:bg-amber-950/20` instead of barely-visible pink
4. **Status badges**: Use amber/orange for abnormal (not destructive red — it's a warning, not an error). Green for normal. Slightly larger padding
5. **Consistent row padding**: `py-3 px-4` for all rows, same height
6. **Header**: Replace bland gray icon box with a subtle colored circle. Show counts as colored dots/pills
7. **Dividers**: Use `border-border/60` — visible but not heavy
8. **PDF button**: Less margin above, aligned with content
9. **Non-numeric results**: Same row structure, value on second line as `text-sm text-muted-foreground`

No file changes needed to `encounters.ts` — data is fine.

