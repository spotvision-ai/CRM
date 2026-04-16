# ADR 001 — Timeline rendering library for the Roadmap view

- **Status**: Accepted
- **Date**: 2026-04-16
- **Deciders**: Gerar (Product Owner), Claude Code (executor)
- **Scope**: Frontend rendering for the new `ROADMAP` viewType (Twenty CRM SPOTVISION fork)
- **Related**: PRD v2.0 (Roadmap View), Fase 0 checklist

## Context

The Roadmap viewType renders records as draggable horizontal bars on a zoomable timeline with swimlanes. The PRD §3 specifies:

- Zoom day / week / month / quarter
- Drag-to-move and drag-to-resize (both edges independently)
- Vertical drag between swimlanes (SELECT fields only)
- Weekend overlay, "today" line
- 60 fps drag, p95 ≤ 2 s initial load with 500 records
- Strict alignment with repo conventions (Linaria CSS-in-JS, dark mode via `themeCssVariables`, Jotai component atoms, zero friction for upstream rebase)
- PRD §2.3 explicitly excludes: gantt dependencies, milestones, exports (PNG/PDF/MS Project), critical path, baselines

## Evaluated options

### 1. `gantt-task-react`
- **License**: MIT
- **Maintenance**: Last release Jul 2022 — **inactive**
- **Verdict**: ❌ Rejected. Violates PRD §7.1 guardrail "mantenimiento activo".

### 2. `@svar-ui/react-gantt`
- **License**: MIT for core; commercial PRO edition
- **Maintenance**: Active, new repo (~138 stars, 13 commits at evaluation)
- **React 18/19**: Yes
- **Core features**: Drag-and-drop timeline, task management
- **PRO-only features**: Baselines, critical path, auto-scheduling, undo/redo, exports to PNG/PDF/Excel/MS Project, slack visualization, rollups
- **Virtualization**: Not explicitly confirmed in the core (free) edition
- **Verdict**: ❌ Rejected. **The PRO feature list is exactly what PRD §2.3 declares "Fuera de alcance".** If scope ever expands in v2, we would be pushed toward a commercial license. Repo is also very young (138 stars) — immaturity risk. Core-edition virtualization claim is unverified.

### 3. `vis-timeline`
- **License**: Apache-2.0 / MIT dual
- **Maintenance**: Active (release Dec 2025, 2.5k stars, 8 releases/year)
- **Virtualization**: Built-in, battle-tested with 10k+ items
- **Drag/resize/zoom**: Built-in
- **Bundle size**: ~200–250 KB gzipped
- **Rendering**: Own DOM rendering pipeline
- **Verdict**: ❌ Rejected. Maturity and features are excellent, but the library brings its own rendering pipeline that fights with Linaria + the repo's `themeCssVariables` dark-mode tokens. The bundle cost (+~250 KB) is steep for a single viewType.

### 4. `@dnd-kit/react` + custom HTML/SVG rendering (**chosen**)
- **License**: MIT (headless)
- **Maintenance**: Production-grade, already a dependency of twenty-front (`0.3.2`)
- **Drag/resize/zoom**: Achieved by composing dnd-kit sensors + our own grid math
- **Virtualization**: Hand-rolled windowing (straightforward for a horizontal timeline with ≤ 500 rows)
- **Bundle delta**: 0 KB — already installed
- **Rendering**: Native React divs + CSS Grid + Linaria. Full dark-mode parity out of the box.
- **Verdict**: ✅ Chosen.

## Decision

Use **`@dnd-kit/react` + custom HTML/SVG rendering** for the timeline.

## Rationale

1. **Zero new runtime dependencies.** Rebase clean against `twentyhq/twenty` upstream. This directly satisfies PRD §7.1 and §7.2 guardrails.
2. **Already present and in use in the repo.** Lower onboarding cost for whoever maintains the feature.
3. **Stylistic coherence.** Linaria + `themeCssVariables` work natively with plain divs; dark mode comes for free. vis-timeline and SVAR both require reconciling a secondary theming system.
4. **MVP surface is small.** The PRD requires only 4 interaction primitives (drag horizontal, resize left edge, resize right edge, drag vertical between SELECT swimlanes) plus Ctrl/Cmd+wheel zoom. A full Gantt library is overkill.
5. **Avoids vendor lock-in.** SVAR's PRO edition contains exactly the features PRD §2.3 declares out-of-scope today but that may be requested in v2. Choosing SVAR would be the first step toward a commercial-license decision later.
6. **Scalability covered.** Horizontal windowing for 500 items is a well-understood pattern (render only items in viewport ± 20% buffer). We can use Intersection Observer or basic offset math.

## Consequences

### Positive
- Zero bundle cost
- Full control over styling, accessibility, keyboard nav
- No vendor roadmap risk
- Aligns with the repo's architectural conventions

### Negative / Costs
- Additional ~3–5 days of Fase 3 work to build the temporal scale and bar positioning primitives from scratch
- We own the bug surface on the rendering layer
- Virtualization must be implemented and tested (PRD §3.5 budget)

### Rollback plan
If during Fase 3 the PoC cannot hit 60 fps with 500 bars or initial render p95 ≤ 2 s, we stop and reassess. The fallback is `vis-timeline` (mature, covers the budget), accepted with the +250 KB bundle and theming trade-off. SVAR remains rejected for the vendor-lock-in reason above.

## References

- `@dnd-kit/react` — https://github.com/clauderic/dnd-kit (MIT, already at `packages/twenty-front/package.json`)
- `vis-timeline` — https://github.com/visjs/vis-timeline
- `@svar-ui/react-gantt` — https://github.com/svar-widgets/react-gantt
- SVAR licensing (PRO vs core) — https://svar.dev/licenses/
- `gantt-task-react` — https://github.com/MaTeMaTuK/gantt-task-react (archived in practice)
- PRD v2.0, sections §2.3 (out of scope), §3.5 (performance budget), §7.1 (risks)
