

## Problema identificado y propuestas de mejora UI/UX

### 1. Problema: Botón "Iniciar Sesión" duplicado en /historial

En la página de Historial hay dos llamadas a iniciar sesión:
- El botón del Navbar (esquina superior derecha)
- El botón grande "Iniciar sesión para ver tu historial" en el header

**Solución**: Eliminar el botón redundante del header. En su lugar, hacer que el banner de demostración sea más prominente con un CTA integrado tipo "Inicia sesión para ver tu historial real" como link dentro del banner informativo.

---

### 2. Propuestas de mejora UI/UX Senior

#### A. Navbar: Indicador de ruta activa
Actualmente los links del navbar no muestran en qué página estás. Agregar un estilo activo (underline o color primary) al link que corresponde a la ruta actual.

#### B. Homepage: Agregar sección de social proof
- Estadísticas animadas: "+500 médicos", "+10,000 pacientes", "4.8 estrellas promedio"
- Testimonios de pacientes reales con avatar y nombre

#### C. Homepage: Barra de búsqueda rápida en el hero
Permitir buscar médico directamente desde el hero sin ir al directorio. Un input con autocompletado por nombre/especialidad.

#### D. DoctorCard: Agregar foto del doctor
Actualmente solo muestra iniciales. Usar avatares placeholder con fotos genéricas de doctores para dar más confianza visual.

#### E. Transiciones y micro-interacciones
- Page transitions suaves entre rutas
- Skeleton loaders en cards mientras cargan datos
- Animaciones sutiles de entrada (fade-in + slide-up) en secciones al hacer scroll

#### F. Historial: Estado vacío más atractivo
Cuando el usuario no tiene sesión, mostrar una ilustración/icono grande con CTA claro en lugar de datos de ejemplo que confunden.

#### G. Modo oscuro toggle
Ya tienes las variables dark definidas en CSS pero no hay un toggle visible. Agregar un botón sol/luna en el Navbar.

#### H. Directorio: Mapa integrado
Ya tienes la memoria del proyecto que menciona OpenStreetMap/Leaflet. Agregar una vista de mapa split con la lista de doctores.

#### I. Portal Médico: Notificaciones
Agregar un icono de campana con badge de conteo en el sidebar del doctor para notificaciones de nuevas citas.

#### J. Breadcrumbs en páginas internas
Agregar navegación con breadcrumbs en DoctorProfile y otras páginas internas para mejorar la orientación del usuario.

---

### Prioridades recomendadas (por impacto)

| Prioridad | Mejora | Impacto |
|---|---|---|
| 1 | Arreglar botón duplicado en Historial | Bug visual |
| 2 | Navbar con ruta activa | Orientación del usuario |
| 3 | Dark mode toggle | Preferencia de usuario |
| 4 | Búsqueda en hero + social proof | Conversión |
| 5 | Micro-interacciones y skeleton loaders | Percepción de calidad |
| 6 | Estado vacío atractivo en Historial | UX claridad |
| 7 | Mapa en directorio | Feature diferenciadora |

### Implementación técnica

- **Botón duplicado**: Modificar `Historial.tsx` lineas 29-37, reemplazar botón por texto con link dentro del banner
- **Navbar activa**: Usar `useLocation()` en `Navbar.tsx` para comparar rutas y aplicar clase `text-primary`
- **Dark mode**: Agregar toggle en Navbar usando `next-themes` (ya instalado)
- **Animaciones**: Usar `tailwindcss-animate` (ya instalado) con intersection observer
- **Social proof**: Nueva sección en `Index.tsx` entre hero y features

