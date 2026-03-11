# Theme Update Project — Overview & Continuity Prompt

Use this document when starting a new session or when you need context for the theme update project. Copy or reference it to maintain continuity across sessions.

---

## Broader Goal

**Change the look and feel of the Notes app** across all framework versions. The Svelte app is the reference implementation. Once the Svelte version is fully updated, the same design will be applied to the Next.js, React, Angular, and Vue versions.

---

## Original Prompt (Summary)

> I want to change the look and feel of the app. Once this Svelte version of the app is updated I will be updating the Next.js, React, Angular, and Vue versions. I want you to keep track of the changes required in an md file in the .cursor folder which can be used as a prompt for the other apps. Use CSS variables for the main CSS values that are centralised and easily updatable. Please start with the login/signup page first.

---

## Design Reference

**File:** `file:///C:/0930_ai_screenshots/notes-app/generated/notes-green-theme-v2_updated/notes-green-v2.html`

Open this HTML file in a browser to see the target design (green theme v2). It includes:
- Combined splash + login
- Notebooks list with cover options (forest, emerald, lime, sage)
- New Notebook FAB
- Note list and note view
- Profile / settings
- Modals and action bars

---

## Project Structure

| Document | Purpose |
|----------|---------|
| **THEME-UPDATE-OVERVIEW.md** (this file) | High-level goal, context, continuity prompt for new sessions |
| **THEME-UPDATE-PROMPT.md** | Detailed implementation spec — CSS variables, component styles, copy, checklist. Use as the main prompt when porting to Next.js, React, Angular, Vue |

---

## Key Principles

1. **CSS variables** — Centralise colours, shadows, typography, radii in `:root` (e.g. `theme-variables.css`). Keep values easy to update.
2. **Svelte first** — Svelte app is the source of truth. Apply changes here, then document in THEME-UPDATE-PROMPT.md.
3. **Cross-framework porting** — THEME-UPDATE-PROMPT.md is the prompt for porting. It contains the full spec so other frameworks can be updated without re-reading the design.
4. **Session continuity** — When starting a new session, read this overview and THEME-UPDATE-PROMPT.md to pick up where you left off.

---

## Workflow

1. **Svelte app** — Update components, styles, and theme variables to match the design reference.
2. **THEME-UPDATE-PROMPT.md** — Keep this spec in sync with Svelte changes. Add new sections, update values, tick checklist items.
3. **Other frameworks** — Use THEME-UPDATE-PROMPT.md as the implementation prompt when updating Next.js, React, Angular, Vue.

---

## Quick Start for a New Session

1. Read this overview for context.
2. Open **THEME-UPDATE-PROMPT.md** for the current implementation spec.
3. Open the **design reference** HTML file to compare.
4. Check the **Implementation Checklist** in THEME-UPDATE-PROMPT.md for remaining work.
5. Continue from the Svelte app or from the framework you are porting to.

---

## Completed Views (Svelte reference)

| View / Feature | Status |
|----------------|--------|
| Login / Signup | ✅ Done |
| Notebooks list | ✅ Done |
| New Notebook bottom sheet | ✅ Done |
| Notebook View (note list) | ✅ Done |
| Desktop app-shell (centred column, dark green wings) | ✅ Done |
| Move to Notebook dialog | ✅ Done |
| Edit mode selection pill | ✅ Done |
| Button shape consistency (square everywhere) | ✅ Done |
| NotePage footer (icons, outline Split Screen) | ✅ Done |
| Footer layout (--footer-height: 70, theme-surface bg, border-top) | ✅ Done |
| Header logo (24px Lora, letter-spacing -0.02em) | ✅ Done |
| Breadcrumb (white surface, Lato 16px, border + shadow) | ✅ Done |
| Dropdown menu (panel, icon pills, slide animation) | ✅ Done |
| Snackbar (dark green, slide-up, flips to top on desktop) | ✅ Done |
| Note count badge on notebook list items | ✅ Done |
| Action button hover states + responsive padding | ✅ Done |
| Note card hover (`:has()` selector) | ✅ Done |
| ProfileForm — two-tab UI (Username/Password), strength bar, tooltip | ✅ Done |
| UserProfile — gradient avatar, Lora name/email | ✅ Done |
| Note view/edit panes (--theme-edit-bg, --theme-edit-text) | ✅ Done |

## Remaining (Svelte)

- **`.btn-contained`** — legacy Vuetify-compat class in `svelte-shared.scss` still uses red (`#b30000`). Not yet migrated to theme green.
- **Other legacy classes** — any remaining `.v-btn` or legacy button classes in shared CSS.

---

## Porting Notes (Vue / Angular / React / Next.js)

The Vue app has been used as the reference "un-updated" baseline. Key differences from the Svelte reference that prompt docs now address (see Section 15 of THEME-UPDATE-PROMPT.md):

- **CSS variable set is completely different** — legacy apps use `--color-primary: #4d0000` (red), must be fully replaced
- **`--footer-height` is `55`, `--breadcrumb-height` is `50`** — both must change
- **Roboto font** — must be removed; DM Sans / Lora / Lato must be added
- **Vuetify components** need replacing: `v-btn` → native `<button>`, `v-dialog` → bottom sheet, `v-snackbar` → custom snackbar, `v-menu` → custom dropdown
- **Header** is dark red (`#4d0000`) — must become white surface with green logo
- **Notebook tab classes** are `.tab_red/blue/green/default` — must become `.tab_forest/emerald/lime/sage`
- **No `.app-shell` wrapper** in LayoutComponent — must be added with login-page detection

---

## Prompt to Paste When Starting Fresh

```
I'm continuing the Notes app theme update project. The goal is to change the look and feel to match the green theme v2 design.

Context:
- Design reference: file:///C:/0930_ai_screenshots/notes-app/generated/notes-green-theme-v2_updated/notes-green-v2.html
- Svelte app is the reference; Next.js, React, Angular, Vue will be updated after.
- Full implementation spec: .cursor/THEME-UPDATE-PROMPT.md
- Overview/continuity: .cursor/THEME-UPDATE-OVERVIEW.md

Completed in Svelte: Login, Notebooks list, New Notebook sheet, Notebook View (note list), desktop app-shell (centred 1200px column, dark green wings), Move to Notebook dialog, edit mode selection pill, button shape consistency (square), NotePage footer buttons, header (24px Lora logo), breadcrumb (white, Lato, border), dropdown menu, snackbar, note count badge, action button hover states, note card hover (:has()), ProfileForm (two-tab Username/Password UI with strength bar), UserProfile avatar, view/edit pane styles.

Remaining in Svelte: legacy `.btn-contained` class.
Use CSS variables for centralised theming. Please read THEME-UPDATE-PROMPT.md and continue from where we left off.
```
