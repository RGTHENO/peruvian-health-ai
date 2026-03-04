# Project Insights

Date: 2026-03-04
Repository: peruvian-health-ai

## 1) Current Project Snapshot

- Stack: Vite 5, React 18, TypeScript, Tailwind CSS, shadcn/ui, react-router-dom.
- Product areas:
  - Public site: home, doctor directory, doctor profile, telemedicine, login, legal pages, medical history demo.
  - Doctor portal: dashboard, agenda, consultation workflow, patient records, settings.
- Data layer is mostly mock/in-memory (`src/data/*`), with no persistent backend integration yet.

## 2) Work Completed So Far

- Repository cloned and local environment prepared.
- Dependency issue detected:
  - `npm ci` failed because `package-lock.json` was out of sync.
  - Installed with `npm install`.
- Full responsive pass across the app (public and portal views):
  - Mobile-first spacing/layout corrections.
  - Better touch targets for mobile controls.
  - Horizontal overflow fixes in key routes.
  - Tabs adapted for small screens.
- CTA wording in doctor cards improved from ambiguous to intent-based:
  - `Disponible` -> `Ver horarios`
  - Otherwise -> `Ver perfil`
  - Semantic fix with `Button asChild` + `Link`.

## 3) Validation History

- `npm run test`: passing.
- `npm run build`: passing.
- `react-doctor`: 98/100 (warnings only, no blocking errors).
- Mobile viewport verification done programmatically (320, 375, 414 widths):
  - No horizontal overflow in tested key routes after fixes.

## 4) Current Technical Debt / Risks

### A) React correctness and maintainability

- Array index keys still used in several list renders (warning from react-doctor).
  - Risk: unstable UI behavior on reorder/filter operations.
- `DoctorConsultation` is very large and state-heavy.
  - Risk: higher cognitive load, harder testing/refactoring.

### B) Markup validity and accessibility

- `validateDOMNesting` warning observed in console.
  - Root cause: `Badge` renders a `div`, sometimes nested inside `<p>` elements in timeline blocks.
  - Files to review:
    - `src/pages/Historial.tsx`
    - `src/pages/DoctorPatientRecord.tsx`

### C) Performance opportunities

- Main bundle is large (~700KB+ minified chunk warning).
  - Potential improvements: route-level lazy loading, dynamic import of heavy views/components.
- Hero image still uses plain `<img>` with no responsive `srcset`.
  - Potential improvement in image delivery on mobile/slow networks.

## 5) Focused Evaluation: "Una plataforma integral para la salud" View

Target file: `src/pages/Index.tsx` (features section around lines 98-121)

### What is already good

- Clear section title and concise supporting text.
- Consistent 6-card grid with responsive columns.
- Strong icon + title + description pattern.
- Visual consistency with the current design system.

### Main UX/UI gaps

1. Cards are informative but not actionable.
- Users read benefits but have no direct next step per feature.
- This can reduce conversion and perceived product clarity.

2. Visual hierarchy is flat.
- All cards carry the same weight; no prioritization of high-value features.
- No "primary" vs "secondary" signal.

3. Discoverability and affordance are limited.
- Cards do not behave like links/buttons.
- Hover state is subtle and does not communicate an outcome.

4. Copy is slightly long for scan behavior.
- On desktop, some cards read as paragraph blocks instead of quick bullets.
- Could improve scan speed by shortening descriptions by ~15-25%.

5. Accessibility opportunities.
- Section can improve semantics with explicit `aria-labelledby` and per-card labels if cards become interactive.

## 6) Recommended Improvements (React/Next + UI/UX Best Practices)

### Priority P0 (high impact, low risk)

1. Make each feature card actionable.
- Convert cards to links (`Link`) to a relevant destination (directory, teleconsulta, historial, etc).
- Add a micro-CTA line inside card (for example: `Explorar` + arrow).

2. Improve information hierarchy.
- Introduce a small eyebrow above heading (for example `Funcionalidades clave`).
- Highlight top 1-2 features with a subtle accent border/background.

3. Tighten copy for scanning.
- Keep each description to 1 sentence, ideally 12-16 words.

### Priority P1 (medium effort)

4. Add stronger interaction states.
- Hover/focus: icon shift, border accent, and CTA visibility.
- Keyboard focus ring clearly visible on interactive cards.

5. Add event tracking for feature engagement.
- Track clicks by card key to learn which value props drive intent.

6. Ensure semantic validity.
- Replace invalid `Badge` nesting patterns in timeline pages to remove console errors.

### Priority P2 (performance and scalability)

7. Componentize feature cards.
- Extract a reusable `<FeatureCard />` component with typed props for maintainability.

8. If migrating to Next.js, apply Vercel best practices.
- Use `next/image` for hero and feature visuals.
- Use route segment code splitting and dynamic imports for heavy screens.
- Keep this section as a Server Component when possible (static content).

## 7) Suggested Next Backlog

1. Fix DOM nesting warnings (`Badge` inside `p`) and replace index keys.
2. Refactor `DoctorConsultation` into smaller components + reducer-based state model.
3. Add route-level lazy loading to reduce initial JS payload.
4. Upgrade the features section with actionable cards and click analytics.


## 8) Validation Update (Vercel/Next + UI/UX)

Date: 2026-03-04

Validation sources used:
- `vercel-react-best-practices` skill (React/Next performance and architecture lens).
- Vercel Web Interface Guidelines (latest from `vercel-labs/web-interface-guidelines`).
- `react-doctor` scan (score remains 98/100).

Key validation conclusion:
- The proposed changes for the card CTA and the feature section direction are valid and aligned with Vercel/UX principles.
- They should proceed, with a few additional adjustments to fully comply with UI guidelines.

Confirmed high-impact gaps in current implementation:
1. Hero image dimensions missing (`src/pages/Index.tsx`): risk of layout shift (CLS).
2. Search input in hero lacks explicit label/name/autocomplete (`src/pages/Index.tsx`).
3. Placeholder uses three dots `...` instead of ellipsis `…` (`src/pages/Index.tsx`).
4. Main feature cards are informational but non-actionable (`src/pages/Index.tsx`).
5. Document metadata still boilerplate (title/description/theme meta) (`index.html`).

Recommended next moves:
- Keep CTA changes already done in doctor cards.
- Upgrade feature cards into semantic links with micro-CTA and keyboard-visible focus.
- Fix hero form semantics and image dimensions in the same pass.

## 9) Implementation Log (All Current Recommendations Applied)

Date: 2026-03-04

Implemented files:
- `src/pages/Index.tsx`
- `index.html`

Applied changes:
1. Hero image best practices
- Added explicit dimensions (`width`/`height`) to prevent CLS.
- Kept eager loading for above-the-fold hero image.

2. Hero search form accessibility/UX
- Added explicit `<label>` (`sr-only`) for the search input.
- Added semantic form attributes: `id`, `name="q"`, `type="search"`, `autocomplete="off"`, `spellCheck={false}`.
- Updated placeholder punctuation to ellipsis (`…`).

3. Features section UX upgrade
- Converted informational cards into actionable navigation links.
- Added per-card `href` and micro-CTA text.
- Added visual hierarchy by highlighting high-priority features.
- Added keyboard-visible focus styles on card links.
- Added section semantics with `aria-labelledby` and section heading id.

4. Metadata and document semantics
- Updated document language to Spanish (`lang="es"`).
- Replaced boilerplate title/description/author metadata with product values.
- Added `theme-color`.
- Updated OG and Twitter title/description metadata to match product copy.

Validation after implementation:
- `npm run test`: pass.
- `npm run build`: pass.
- `react-doctor`: 98/100 (warnings remain in unrelated backlog areas only).

## 10) Mobile CTA Polishing + Vercel Preview Deployment

Date: 2026-03-04

Implemented files:
- `src/components/Navbar.tsx`
- `src/pages/Index.tsx`

Applied changes:
1. Mobile navbar CTA layout
- Reworked the mobile menu CTA block from vertical stacking to a 2-column grid.
- `Agendar Cita` and `Iniciar Sesión` now render side-by-side on mobile with consistent touch targets (`h-11`) and spacing (`gap-2`).
- Preserved visual hierarchy: booking remains primary CTA, login remains secondary outline action.

2. Final CTA button width consistency on mobile
- Updated final landing CTA wrappers and buttons to use `w-full` on mobile and `sm:w-auto` on larger screens.
- Result: `Buscar Especialista` and `Soy Médico` now have equal widths on mobile while preserving desktop behavior.

Validation:
- `npm run build`: pass after both UI adjustments.
- `npm run lint`: fails due to pre-existing unrelated issues (e.g. `no-explicit-any` in other modules), not introduced by these changes.

Deployment:
- Deployed preview using `vercel-deploy` skill fallback script (`deploy.sh`) because `vercel` CLI was not installed in the environment.
- Preview URL: `https://skill-deploy-yga3fdbe6p-codex-agent-deploys.vercel.app`
- Claim URL: `https://vercel.com/claim-deployment?code=c788cb88-16cb-4f57-aea4-5a44a42a3ce2`
- Preview status confirmed with HTTP `200`.
