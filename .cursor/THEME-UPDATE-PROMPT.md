# Theme Update Prompt — Notes App (Green Theme v2)

Use this document as a prompt/spec when updating the Next.js, React, Angular, and Vue versions of the Notes app to match the green theme design.

**See also:** `.cursor/THEME-UPDATE-OVERVIEW.md` — broader goal, context, and continuity prompt for new sessions.

**Design reference:** `file:///C:/0930_ai_screenshots/notes-app/generated/notes-green-theme-v2_updated/notes-green-v2.html`

> **CSS variable principle:** Always use the CSS variables from section 1 instead of raw hex or gradient values. Only fall back to a raw value if no suitable variable exists. This keeps the theme centralised and easy to update across all framework versions.

---

## 1. CSS Variables

Add these theme variables to `:root` (in a central CSS/SCSS file or global styles):

```css
:root {
  /* Primary palette */
  --theme-lime: #8BE04A;
  --theme-lime-light: #B8EF80;
  --theme-lime-bg: #EEF8E2;
  --theme-green: #1B3D29;
  --theme-green-mid: #3D9966;
  --theme-green-accent: #2E7D52;

  /* Surfaces */
  --theme-surface: #FFFFFF;
  --theme-bg: #F4F9F1;
  --theme-input-bg: #F4F9F1;
  --theme-border: rgba(0,0,0,0.07);
  --theme-border-input: #D0E8D8;

  /* Text */
  --theme-text: #111C16;
  --theme-text-secondary: #3D5A47;
  --theme-text-muted: #7DA08A;

  /* Shadows */
  --theme-shadow-sm: 0 1px 4px rgba(0,0,0,0.06);
  --theme-shadow-lg: 0 24px 64px rgba(0,0,0,0.14), 0 4px 16px rgba(0,0,0,0.07);
  --theme-shadow-card: 0 -4px 30px rgba(0,0,0,0.1);
  --theme-shadow-btn: 0 4px 14px rgba(46,125,82,0.35);

  /* Typography */
  --theme-font-sans: 'DM Sans', sans-serif;
  --theme-font-serif: 'Lora', serif;
  --theme-font-lato: 'Lato', sans-serif;

  /* App shell — max width of the centered column on desktop. Change one value to resize. */
  --app-shell-width: 480px;

  /* Layout heights (px values, used in calc) */
  --footer-height: 70;
  --breadcrumb-height: 40;

  /* Spacing / radii */
  --theme-radius-sm: 10px;
  --theme-radius-card: 24px;

  /* Notebook cover gradients (forest, emerald, lime, sage) */
  --notebook-forest: linear-gradient(145deg, #1B3D29, #06100a);
  --notebook-emerald: linear-gradient(145deg, #1B3D29, #00920c);
  --notebook-lime: linear-gradient(145deg, #8BE04A, #5DB830);
  --notebook-sage: linear-gradient(145deg, #82c098, #7d9886);
  --notebook-forest-color: #1B3D29;
  --notebook-emerald-color: #2E7D52;
  --notebook-lime-color: #5DB830;
  --notebook-sage-color: #7d9886;
}
```

---

## 2. Fonts

Add Google Fonts in your HTML `<head>` or equivalent:

```html
<!-- DM Sans (UI) -->
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap" rel="stylesheet">
<!-- Lora variable weight (headings / serif accents) -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400..700;1,400..700&display=swap" rel="stylesheet">
<!-- Lato (note card titles — uppercase label style) -->
<link href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&display=swap" rel="stylesheet">
```

Update `theme-color` meta tag to `#1B3D29`.

---

## 3. Layout Behavior

### App shell (desktop centering)

The app is mobile-first. On desktop it is constrained to a centered column with dark green "wings" behind it — the same pattern used by Instagram and similar mobile-first web apps.

**`body`** — set `background: var(--theme-green)` so the wings show the brand colour.

**`.app-shell`** — wrap the entire app (header + main + overlays) in this div:
```css
.app-shell {
  max-width: var(--app-shell-width); /* change the variable to resize */
  margin: 0 auto;
  min-height: 100vh;
  position: relative;
  background: var(--theme-bg);
  overflow: hidden;            /* clips header to the rounded corners */
  border-radius: 16px 16px 0 0;
  box-shadow: 0 -2px 40px rgba(0, 0, 0, 0.25);
}
```

**Fixed footer** — `.page_footer` uses `position: fixed`, `height: calc(var(--footer-height) * 1px)`, `background-color: var(--theme-surface)`. Override for viewports wider than the shell so it stays within the app column. **The media query threshold must match `--app-shell-width` — update both together.**
```css
.page_footer {
  width: 100%;
  position: fixed;
  height: calc(var(--footer-height) * 1px);
  bottom: 0;
  z-index: 6;
  background-color: var(--theme-surface);
}

@media (min-width: 801px) { /* matches --app-shell-width: 800px */
  .page_footer {
    max-width: var(--app-shell-width);
    left: 50%;
    transform: translateX(-50%);
    right: auto;
  }
}
```

**Full-screen overlays** (bottom sheets, modals with `position: fixed; inset: 0`) intentionally cover the full viewport including the wings — this is the correct behavior for overlays.

**SnackBar / notification-wrapper** — both use `position: fixed; left: 50%; transform: translateX(-50%)` and are already viewport-centered. No changes needed.

---

**Hide header/navigation on login route.** When the current route is `/login` (or equivalent), do not render the main navigation header or breadcrumb. The login page should be full-screen without the app chrome.

Ensure the main content area has `min-height: 100vh` when on the login page so the splash fills the viewport.

**Page scrollable area:** `.page_scrollable_header_breadcrumb_footer_list` extends to the bottom of the page. Height: `calc(var(--jsvh) - (var(--header-height) + var(--footer-height) + var(--breadcrumb-height)) * 1px)`. Background: `var(--theme-bg)`.

---

## 4. Login Page Structure

The login/signup page uses a **splash + login card** layout:

```
.splash-login (flex column, min-height: 100vh, background: var(--theme-lime))
├── .splash-top (padding, flex column)
│   ├── .splash-logo-row (logo + "Notes" text)
│   ├── .splash-headline ("Your notes, beautifully organised.")
│   └── .splash-sub (subtitle text)
└── .login-card (white card, margin-top: auto, rounded top corners)
    ├── .login-card-title ("Sign in" / "Create account")
    ├── form
    │   ├── [Username field - signup only]
    │   ├── Email address
    │   ├── Password
    │   ├── .btn-login (primary button)
    │   └── .login-alt ("No account? Create one" / "Login with existing account")
    └── ErrorAlert (if error)
```

---

## 5. Logo SVG (Pencil-in-Square)

```html
<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="1.5" y="1.5" width="17" height="17" rx="3.5" stroke="white" stroke-width="1.6"></rect>
  <path d="M6.5 13.5l1.2-3.6 6.3-6.3a1 1 0 011.4 1.4l-6.3 6.3-2.6.2z" fill="white" opacity="0.9"></path>
  <path d="M12 4.5l1.5 1.5" stroke="rgba(31,92,58,0.6)" stroke-width="1.1" stroke-linecap="round"></path>
</svg>
```

For the splash logo mark, wrap in a container:
- `width: 34px`, `height: 34px`, `border-radius: 9px`
- `background: var(--theme-green)`
- `box-shadow: 0 2px 8px rgba(0,0,0,0.25)`

---

## 6. Key Styles

### Splash section
- `.splash-login`: `background: var(--theme-lime)`, `display: flex`, `flex-direction: column`, `min-height: 100vh`
- `.splash-top`: `padding: 32px 26px 28px`
- `.splash-logo-row`: `display: flex`, `align-items: center`, `gap: 10px`, `margin-bottom: 48px`
- `.splash-logo-text`: `font-family: var(--theme-font-serif)`, `font-size: 20px`, `font-weight: 600`, `color: var(--theme-green)`
- `.splash-headline`: `font-family: var(--theme-font-serif)`, `font-size: 28px`, `font-weight: 600`, `color: var(--theme-green)`, `line-height: 1.2`
- `.splash-sub`: `font-size: 13px`, `color: rgba(31,92,58,0.65)`, `line-height: 1.6`

### Login card
- **Mobile:** `border-radius: var(--theme-radius-card) var(--theme-radius-card) 0 0` (rounded top only), `flex: 1` so white extends to bottom, `margin-top: auto`
- **Desktop (min-width: 768px):** `border-radius: var(--theme-radius-card)` (all corners), `flex: 0 0 auto`, `max-width: 420px`, centered via parent `align-items: center`
- **Splash on desktop:** `justify-content: flex-start`, `align-items: center`, `padding-top: 2rem`; `.splash-top` gets `max-width: 420px`, `width: 100%`
- `.login-card-title`: `font-family: var(--theme-font-serif)`, `font-size: 19px`, `font-weight: 600`, `color: var(--theme-text)`, `margin-bottom: 20px`

### Form
- `.form-label`: `display: block`, `font-size: 11.5px`, `font-weight: 500`, `letter-spacing: 0.04em`, `color: var(--theme-text-secondary)`, `margin-bottom: 5px`
- `.form-input`: `width: 100%`, `background: var(--theme-input-bg)` (light green #F4F9F1 from reference), `border: 1.5px solid var(--theme-border-input)`, `border-radius: var(--theme-radius-sm)`, `padding: 11px 14px`, `font-family: var(--theme-font-sans)`, `font-size: 14px`, `color: var(--theme-text)`, `outline: none`, `margin-bottom: 14px`
- `.form-input:focus`: `border-color: var(--theme-green)`, `box-shadow: 0 0 0 3px rgba(46,125,82,0.12)`
- **Autofill override:** Add `:-webkit-autofill` (and :hover, :focus, :active) styles to prevent browser's blue autofill background: use `box-shadow: 0 0 0 30px var(--theme-input-bg) inset !important` and `-webkit-text-fill-color: var(--theme-text) !important`
- `.btn-login`: `width: 100%`, `background: var(--theme-green)`, `color: white`, `border: none`, `border-radius: var(--theme-radius-sm)`, `padding: 13px`, `font-family: var(--theme-font-sans)`, `font-size: 14px`, `font-weight: 600`, `box-shadow: var(--theme-shadow-btn)`

### Alt link
- `.login-alt`: `text-align: center`, `font-size: 13px`, `color: var(--theme-text-secondary)`
- Link/button: `color: var(--theme-green)`, `font-weight: 600`

### Material Symbols (when used)
- `.material-symbols-outlined`: `font-variation-settings: "FILL" 0, "wght" 700, "GRAD" 0, "opsz" 48`, `color: rgba(0,0,0,0.54)`, `font-size: 17px`. Prefer inline SVG with `currentColor` for theme-aware icons where possible.

---

## 7. Copy / Labels

- **Headline:** "Your notes, beautifully organised."
- **Subtitle:** "Write freely, stay focused. Everything in one calm, clutter-free space."
- **Card title (login):** "Sign in"
- **Card title (signup):** "Create account"
- **Primary button (login):** "Sign in"
- **Primary button (signup):** "Create Account"
- **Alt (login):** "No account? Create one"
- **Alt (signup):** "Login with existing account"
- **Form labels:** "Your Name" (signup), "Email address", "Password"

---

## 8. Notebooks Page

### Cover options (replacing old red/blue/green/default)
Use the CSS variables from section 1 — do not hardcode gradient values.
- **Forest** — `var(--notebook-forest)`
- **Emerald** — `var(--notebook-emerald)`
- **Lime** — `var(--notebook-lime)`
- **Sage** — `var(--notebook-sage)`

### Legacy mapping (for existing data from API)
Map old cover values to new for display: `default`→sage, `red`→forest, `green`→lime, `blue`→emerald.

### Notebook list styling
- **Breadcrumb as section header:** On notebooks page, breadcrumb uses light green background (`var(--theme-bg)`), no border; `.breadcrumb_group` styled with Lora, 1.1rem, font-weight 600, `var(--theme-text-secondary)`
- Notebook cards: `border-radius: 14px`, `border: 1px solid var(--theme-border)`, `box-shadow: var(--theme-shadow-sm)`
- Cover bar: 27×40px, gradient background from `var(--notebook-forest)` / `var(--notebook-emerald)` / `var(--notebook-lime)` / `var(--notebook-sage)`, `position: relative`, `overflow: hidden`
- **Notebook spine** (vertical bar on left edge of cover, 4px wide): `.nb-spine-{forest|emerald|lime|sage|loading}` — `position: absolute`, `left: 0`, `top: 0`, `bottom: 0`, `width: 4px`. Spine colors are contrast colours for each cover and use the solid `--notebook-*-color` variables:
  - `.nb-spine-forest`: `var(--notebook-emerald-color)` (`#00920c`)
  - `.nb-spine-emerald`: `var(--notebook-lime-color)` (`#5db830`)
  - `.nb-spine-lime`: `var(--notebook-sage-color)` (`#7d9886`)
  - `.nb-spine-sage`: `var(--notebook-forest-color)` (`#1b3d29`)
  - `.nb-spine-loading`: `var(--theme-text-muted)`
- **New Notebook FAB** (`.fab`): Text "New Notebook", plus icon (SVG). `background: var(--theme-green)`, `color: white`, `border: none`, `border-radius: var(--theme-radius-sm)` (square — all buttons use same shape), `padding: 12px 22px`, `font-family: var(--theme-font-sans)`, `font-size: 13px`, `font-weight: 600`, `display: flex`, `align-items: center`, `gap: 7px`, `box-shadow: var(--theme-shadow-btn)`
- **FAB row** (`.fab-row`): Wraps the FAB in the footer. `width: 100%`, `display: flex`, `justify-content: center`

### New Notebook Form — Bottom Sheet

When the user taps "New Notebook", the form slides up from the bottom as a bottom sheet (not a centered modal).

**Structure:**
```
.sheet-overlay  (full-screen backdrop, flex align-items:flex-end)
└── .bottom-sheet  (white panel anchored to bottom)
    ├── .sheet-handle  (36×4px pill, #C8E0D0, drag-handle decoration)
    ├── .sheet-title   ("New Notebook" / "Edit Notebook")
    ├── .sheet-field   Name input
    ├── .sheet-field   Cover colour swatches
    └── .sheet-actions  Cancel  |  Create
```

**Overlay:**
- `position: fixed`, `inset: 0`, `z-index: 1000`
- `background: rgba(8,18,12,0.45)`, `backdrop-filter: blur(4px)`
- `display: flex`, `align-items: flex-end`

**Sheet panel:**
- `background: var(--theme-surface)`, `border-radius: 22px 22px 0 0`, `padding: 8px 0 32px`
- `box-shadow: 0 -4px 30px rgba(0,0,0,0.12)`

**Sheet handle:** `width: 36px`, `height: 4px`, `background: var(--theme-border-input)`, `border-radius: 2px`, `margin: 8px auto 20px`

**Title:** `font-family: var(--theme-font-serif)`, `font-size: 18px`, `font-weight: 600`, `color: var(--theme-text)`, `padding: 0 20px`

**Cover swatches** (replaces `<select>` dropdown):
- Row of 4 circular buttons (36×36px, `border-radius: 50%`) for forest / emerald / lime / sage using the `--notebook-*` gradient CSS variables
- Selected state: `box-shadow: 0 0 0 2.5px white, 0 0 0 4.5px var(--theme-green)`

**Buttons** (`.sheet-actions`, `display:flex`, `gap:10px`, `padding: 6px 20px 0`):
- Cancel: `flex:1`, `background: var(--theme-bg)`, `color: var(--theme-text)`, `border: 1px solid var(--theme-border-input)`, `border-radius: var(--theme-radius-sm)`, `padding: 13px`, `font-family: var(--theme-font-sans)`, 14px 500
- Create: `flex:1`, `background: var(--theme-green)`, `color: white`, `border: none`, `border-radius: var(--theme-radius-sm)`, `padding: 13px`, `font-family: var(--theme-font-sans)`, 14px 600, `box-shadow: var(--theme-shadow-btn)`. Disabled state: `opacity: 0.5`

**Animation (Svelte):**
```svelte
import { fly } from "svelte/transition";
import { cubicOut, cubicIn } from "svelte/easing";

<!-- Overlay: no transition — appears/disappears instantly -->
<div class="sheet-overlay" ...>
  <!-- Sheet slides up on mount, slides down on unmount -->
  <div class="bottom-sheet"
    in:fly={{ y: 400, duration: 380, easing: cubicOut }}
    out:fly={{ y: 400, duration: 300, easing: cubicIn }}
  >
```
Svelte automatically plays the out-transition before unmounting when the parent `{#if}` condition becomes false. No overlay fade is used — the instant backdrop appearance feels snappier.

For non-Svelte frameworks, use CSS `@keyframes` or a JS animation library:
- In: `transform: translateY(100%) → translateY(0)` over ~380ms with ease-out
- Out: `transform: translateY(0) → translateY(100%)` over ~300ms with ease-in, then remove from DOM

**Note for other frameworks:** The component is conditionally rendered by the parent (`{#if enableAddNotebook}` in Svelte). Make sure the out-animation completes before removing the element from the DOM.

---

### Header area
- **Main header** (`.header`): `z-index: 2`, `display: flex`, `align-items: center`, `justify-content: space-between`, `padding: 10px 18px 10px`, `background: var(--theme-surface)`, `border-bottom: 1px solid var(--theme-border)`
- **Logo**: Green square (30×30px, `var(--theme-green)`) with pencil-in-square SVG in white; "Notes" text in Lora, 17px, `var(--theme-text)`
- **Menu icon**: Muted color (`var(--theme-text-muted)`), circular background `rgba(0,0,0,0.05)`, 32×32px
- **Breadcrumb** (`.breadcrumb_container`): `background: var(--theme-bg)` (light green), no border-bottom; breadcrumb area transparent, matches page background
- **Breadcrumb group** (`.breadcrumb_group`): `display: flex`, `align-items: center`, `margin: 0`, `font-family: var(--theme-font-serif)`, `font-weight: 600`, `font-size: 1.1rem`, `line-height: 1.5`, `letter-spacing: 0.00938em`, `color: var(--theme-text-secondary)`

---

## 10. Notebook View (Note List)

### Note list layout
- Container: `background: var(--theme-bg)`, `padding-bottom: 8px`
- List (`<ul>`): `list-style: none`, `margin: 0`, `padding: 6px 14px 10px`, `display: flex`, `flex-direction: column`, `gap: 9px`

> **No section header** — the notebook name is shown only in the breadcrumb. Do not render a separate heading above the note list.

### Note cards
```css
.note-card {
  background: var(--theme-surface); border-radius: 14px; padding: 14px 14px 12px;
  border: 1px solid var(--theme-border); box-shadow: var(--theme-shadow-sm);
  display: flex; gap: 10px; align-items: flex-start;
}
.note-card:hover { box-shadow: 0 3px 10px rgba(0,0,0,0.1); }
.note-card--selected { border-color: var(--theme-green); box-shadow: 0 0 0 2px var(--theme-lime-light); }

/* Title — Lato uppercase label style */
.note-title {
  font-family: var(--theme-font-lato); font-size: 15px; font-weight: 700;
  color: var(--theme-text-muted); margin-bottom: 5px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  text-transform: uppercase;
}

/* Preview — rendered markdown thumbnail, clipped to ~3 visible lines */
.note-thumb-preview { max-height: 80px; overflow: hidden; margin-bottom: 10px; }

.note-foot { display: flex; align-items: center; justify-content: space-between; }
.note-date { font-size: 10.5px; color: var(--theme-text-muted); }
```

**Preview implementation:** Use a `ViewNoteThumb` component (or equivalent) that runs `truncateMarkdownPreview` on the note body and renders it as HTML. Clip the output with `.note-thumb-preview { max-height: 80px; overflow: hidden; }`. Do **not** use a plain-text `extractNotePreview` function for the card body.

### Tag pills (auto-detected from note content)

Every note shows exactly one pill. Detection runs in priority order and returns on the first match:

```css
.note-tag   { font-size: 10px; font-weight: 500; letter-spacing: 0.06em; text-transform: uppercase; padding: 2px 8px; border-radius: 99px; }
.tag-todo   { background: var(--theme-lime-bg); color: var(--theme-green-accent); }
.tag-table  { background: #F3F4F6; color: #6B7280; }
.tag-code   { background: #EFF6FF; color: #1D4ED8; }
.tag-image  { background: #FDF4FF; color: #7E22CE; }
.tag-list   { background: #FFF7ED; color: #C2410C; }
.tag-text   { background: #F8FAFC; color: #94A3B8; }
.tag-empty  { background: #FAFAFA; color: #D1D5DB; }
```

Detection logic — `detectNoteTag(content)` returns one of 7 values (priority order):

| Priority | Tag | Regex / condition |
|----------|-----|-------------------|
| 1 | `"todo"` | `/^[ \t]*[-*+]\s+\[[ xX]\]/m` — GFM checkbox |
| 2 | `"table"` | `/^\|.+\|/m` — markdown table row |
| 3 | `"code"` | `/^\`{3}/m` — fenced code block opener |
| 4 | `"image"` | `/!\[.*?\]\(.*?\)/m` — inline image |
| 5 | `"list"` | `/^[ \t]*[-*+]\s+/m` or `/^[ \t]*\d+\.\s+/m` — list item (checkboxes already caught) |
| 6 | `"text"` | `/\S/.test(body)` — any remaining non-whitespace |
| 7 | `"empty"` | catch-all — body is blank after front-matter |

### Note card content extraction (`noteCardUtils.ts` / equivalent)

**`TITLE_MAX_CHARS = 10`** — configurable constant; change this one value to adjust title length.

**`extractNoteTitle(content)`**
- Parse front-matter; work on the body only.
- Iterate lines, skipping: fenced-code block contents, blank lines, and *structural lines* (`---`, `===`, ` ``` `, `:::`).
- For each remaining line, run `toPlainText()` (see below) and accumulate the result.
- Stop once the accumulated string reaches `TITLE_MAX_CHARS` characters.
- Truncate to `TITLE_MAX_CHARS` and append `…`; return `"Untitled"` if nothing was found.

**`toPlainText(line)`** — strips in this order:
1. Images `![alt](url)` → `""` (alt text is often metadata/dimensions)
2. Template/wiki variables `{{prefix:text}}` or `{{text}}` → inner text
3. ATX headings `# …` → bare text
4. GFM task-list markers `- [ ]` / `- [x]`
5. Unordered list markers `- ` / `* ` / `+ `
6. Ordered list markers `1. `
7. Blockquote `> `
8. Custom directive openers/closers `:::…` → `""`
9. Bold / italic / strikethrough `***…***` etc. → inner text
10. Inline code (triple → double → single backticks) → inner text or `""`
11. Links `[text](url)` → visible text
12. HTML tags `<…>`
13. Catch-all for remaining markdown punctuation `* _ ~ \` # > | \ { } [ ]`
14. Normalize whitespace

**`detectNoteTag(content)`** — returns `"todo"` | `"table"` | `null` (todo takes priority):
- `"todo"` — body matches `/^[ \t]*[-*+]\s+\[[ xX]\]/m`
- `"table"` — body matches `/^\|.+\|/m`

> `extractNotePreview` is no longer used in the note list card. The rendered `ViewNoteThumb` preview replaces it.

### Edit mode

**Structure (checkbox click fix):** Use a unified card structure so clicking the checkbox does not trigger link navigation. When not in edit mode, render a transparent overlay anchor (`position: absolute; inset: 0; z-index: 1`) for navigation. When in edit mode, hide the overlay and the card div handles clicks. The card content (checkbox column + body) is always the same; only the overlay visibility changes.

**Checkbox column animation (platform-agnostic):** Use CSS transitions only — no framework-specific transition APIs. Wrap the checkbox column in `.note-select-col-wrapper` with `overflow: hidden`, `width: 0` by default, and a class (e.g. `.is-visible`) when edit mode is active. Animate `width` for slide in/out.

```css
.note-select-col-wrapper {
  overflow: hidden;
  flex-shrink: 0;
  width: 0;
  transition: width 0.25s cubic-bezier(0.33, 1, 0.68, 1);
}
.note-select-col-wrapper.is-visible {
  width: 20px;
}
.note-select-col {
  flex-shrink: 0;
  margin-top: 1px;
  width: 20px;
  padding-top: 12px;
}
```

**Circle indicator:** `20×20px`, `border-radius: 50%`, `border: 1.5px solid #C0DCC8`
- Selected state: `background: var(--theme-green)` with white SVG checkmark
- Selected card border: `border-color: var(--theme-green)`, `box-shadow: 0 0 0 2px var(--theme-lime-light)`

### Action bar buttons (`.btn-action-*` — add to global styles)

Buttons are **not** stretched to fill the footer. Their width is determined by content + horizontal padding (`28px` each side). Wrap them in `.nb-footer-row`; the outer footer container's `justify-content: space-evenly` centres the row naturally on all screen sizes.

```css
/* Row wrapper — full width, centred; gap scales responsively with viewport */
.nb-footer-row {
  width: 100%;
  display: flex;
  justify-content: center;
  gap: clamp(8px, 5vw, 40px);
}

.btn-action-primary {
  background: var(--theme-green); color: white; border: none; border-radius: var(--theme-radius-sm);
  padding: 11px 28px; font-family: var(--theme-font-sans); font-size: 13px; font-weight: 600;
  display: flex; align-items: center; justify-content: center; gap: 6px;
  box-shadow: 0 3px 10px rgba(46,125,82,0.28); cursor: pointer;
}
.btn-action-ghost {
  color: var(--theme-text); border: 1px solid var(--theme-border-input); border-radius: var(--theme-radius-sm);
  padding: 11px 28px; font-family: var(--theme-font-sans); font-size: 13px; font-weight: 600;
  display: flex; align-items: center; justify-content: center; gap: 6px; cursor: pointer;
}
.btn-action-danger {
  background: #FEF2F2; color: #B91C1C; border: 1px solid #FECACA; border-radius: var(--theme-radius-sm);
  padding: 11px 28px; font-family: var(--theme-font-sans); font-size: 13px; font-weight: 500;
  display: flex; align-items: center; justify-content: center; gap: 6px; cursor: pointer;
}
```

Button mapping per view state:
| Button           | Class                |
|------------------|----------------------|
| Add Note         | `btn-action-primary` |
| Edit Notes       | `btn-action-ghost`   |
| Delete Notebook  | `btn-action-danger`  |
| Delete (notes)   | `btn-action-danger`  |
| Move to…         | `btn-action-ghost`   |
| Cancel           | `btn-action-ghost`   |

**Button icons:** Use inline SVG with `fill="currentColor"` or `stroke="currentColor"` so icons inherit the button text color. Typical sizes: 12px for compact icons (e.g. Add Note plus), 17px for action icons (View, Edit, Save, Split Screen). Add Note uses a plus icon; Save Note uses a floppy/save icon; View/Edit use eye and pencil icons; Split Screen uses outline rects (single pane = one rect, double = two rects side by side).

**NotePage footer** (when viewing/editing a note):
| Button       | Class                | Icon                          |
|--------------|----------------------|-------------------------------|
| Example      | `btn-action-ghost`   | egg (Material) or custom      |
| Create Note  | `btn-action-primary`  | plus (12×12)                  |
| Save Note    | `btn-action-primary`  | floppy/save (17×17)           |
| View / Edit  | `btn-action-ghost`   | eye / pencil (17×17)          |
| Split Screen | `btn-action-ghost`   | outline rects (17×17)         |

> **Footer** — uses `background-color: var(--theme-surface)` (white). Height from `--footer-height: 70`.

### Button shape consistency

**All action buttons use the same square shape** — `border-radius: var(--theme-radius-sm)` (10px). This includes:
- New Notebook FAB
- Add Note, Edit Notes, Cancel, Delete, Move to…
- Sheet dialog buttons (Cancel, Create, Move Note)

### Edit mode — selection count pill

When the user is in edit mode and has selected one or more notes, show a pill in the header toolbar (to the left of the menu icon):

- **Text:** `"{count} selected"` (e.g. "3 selected")
- **Styling:** `font-size: 11px`, `font-weight: 500`, `letter-spacing: 0.04em`, `padding: 4px 10px`, `border-radius: 99px`, `border: 1px solid var(--theme-border-input)`, `background: var(--theme-lime-bg)`, `color: var(--theme-green-accent)`, `font-family: var(--theme-font-sans)`
- **State:** Use a store (e.g. `editNotesStore`) with `{ active: boolean, selectedCount: number }`. NotebookPage updates it when entering/exiting edit mode and when selection changes. MainNavigation subscribes and renders the pill when `active && selectedCount > 0`. Clear the store on page unmount.
- **Placement:** In `.header_toolbar`, before the MenuDropdown, with `gap: 10px` between pill and menu.

### Move to Notebook dialog

The Move to Notebook dialog uses the same bottom sheet style as the New Notebook form. Structure:

```
.sheet-overlay (backdrop, blur)
└── .bottom-sheet
    ├── .sheet-handle
    ├── .sheet-title ("Move to Notebook")
    ├── Notebook options (custom list, not native <select>)
    │   Each option: cover bar (with spine) + notebook name
    └── .sheet-actions  Cancel  |  Move Note
```

**Notebook options:** Replace native `<select>` with a custom list of clickable rows. Each row shows:
- Cover bar (24×28px) with gradient (`--notebook-forest` etc.) and 4px spine (`--notebook-*-color` contrast)
- Notebook name
- Selected state: `border-color: var(--theme-green)`, `box-shadow: 0 0 0 2px rgba(46,125,82,0.2)`

**Keyboard:** Arrow Up/Down to navigate options, Enter to select. Overlay must not close on Enter when focus is inside the dialog — check `e.target.closest('.bottom-sheet')` before calling cancel handler.

**Layout:** Bottom sheet anchored at bottom on all screen sizes (same as New Notebook). Desktop: `max-width: 420px`, `border-radius: 22px 22px 0 0`.

---

## 11. Implementation Checklist

- [ ] Add theme CSS variables to `:root` (including `--theme-font-lato` and `--app-shell-width`)
- [ ] Add Lora (variable 400–700), DM Sans, and Lato fonts
- [ ] Update theme-color meta to `#1B3D29`
- [ ] Add `.app-shell` wrapper + `body { background: var(--theme-green) }` + fixed footer media query
- [ ] Hide header/nav when route is login
- [ ] Ensure main content area fills viewport on login
- [ ] Implement splash + login card layout
- [ ] Add pencil-in-square logo SVG
- [ ] Style form inputs and button with theme variables
- [ ] Add focus states for inputs
- [ ] Ensure ErrorAlert is theme-aware or styled consistently
- [ ] Notebooks: Replace cover options (forest, emerald, lime, sage) with gradients
- [ ] Notebooks: Add legacy cover mapping for API backward compatibility
- [ ] Notebooks: Add spine bar (4px vertical bar on left of cover) with contrast colors per cover type
- [ ] Notebooks: Update header to theme green
- [x] Notebooks: New Notebook FAB — square button (`var(--theme-radius-sm)`), theme green, plus SVG icon
- [x] Notebooks: New Notebook form — bottom sheet, slide-up/down animation, cover swatches, Create/Cancel buttons
- [x] Notebook View: Note cards — white card, Lato uppercase title, ViewNoteThumb preview, date, tag pill
- [x] Notebook View: Note list layout — flex column, gap 9px, theme-bg background
- [x] Notebook View: No section header — notebook name shown in breadcrumb only
- [x] Notebook View: Action bar buttons — btn-action-primary/ghost/danger, padding-driven width, nb-footer-row wrapper
- [x] Notebook View: Edit mode — circle selector, selected state styling, overlay structure (checkbox click fix), CSS-only checkbox column animation
- [x] Notebook View: noteCardUtils — robust `extractNoteTitle` (toPlainText + TITLE_MAX_CHARS) and `detectNoteTag` (7 tags: todo, table, code, image, list, text, empty)
- [x] Notebook View: Edit mode selection pill — "X selected" in header toolbar when in edit mode
- [x] Move to Notebook dialog — bottom sheet style, custom notebook options with cover+spine, keyboard handling
- [x] Button shape — all action buttons use `var(--theme-radius-sm)` (square)
- [x] Footer — `--footer-height: 70`, `background-color: var(--theme-surface)`, scrollable area uses layout calc

### Remaining (old buttons to update later)

- [x] **NotePage** — footer buttons (Example, Create Note, Save Note, View/Edit, Split Screen) migrated to `btn-action-primary` / `btn-action-ghost` with inline SVG icons (outline style for Split Screen)
- [ ] **ProfileForm** — `btn-contained` buttons; migrate to theme button styles
- [ ] **Other** — any remaining `.btn-contained`, `.v-btn`, or legacy button classes in `svelte-shared.scss` / `global.scss`
