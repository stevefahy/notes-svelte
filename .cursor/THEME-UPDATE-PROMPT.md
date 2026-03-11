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
  --theme-lime: #8be04a;
  --theme-lime-light: #b8ef80;
  --theme-lime-bg: #eef8e2;
  --theme-green: #1b3d29;
  --theme-green-mid: #3d9966;
  --theme-green-dark: #001f0c;
  --theme-green-accent: #2e7d52;
  --theme-green-light: #c8dcc0;

  /* Danger */
  --theme-danger-bg: #fef2f2;
  --theme-danger-dark: #b91c1c;
  --theme-danger-light: #fff9f9;

  /* Edit pane */
  --theme-edit-bg: #f9f9f9;
  --theme-edit-text: #071d11;

  /* Surfaces */
  --theme-surface: #ffffff;
  --theme-bg: #f4f9f1;
  --theme-note-bg: #ffffff;
  --theme-bg-light: rgba(244, 249, 241, 0.1);
  --theme-input-bg: rgb(244, 249, 241);
  --theme-border: rgba(0, 0, 0, 0.07);
  --theme-border-dark: rgba(0, 0, 0, 0.1);
  --theme-border-green: #d4e2cc;
  --theme-border-input: #d0e8d8;
  --theme-input-border: #c0dcc8;
  --theme-ghost-hover: #fbfbfb;
  --theme-green-snackbar: #2d4a2d;

  /* Text */
  --theme-text: #111c16;
  --theme-text-secondary: #3d5a47;
  --theme-text-muted: #7da08a;

  /* Shadows */
  --theme-shadow-sm: 0 1px 4px rgba(0, 0, 0, 0.06);
  --theme-shadow-mid: 0 1px 4px rgba(0, 0, 0, 0.2);
  --theme-shadow-lg: 0 24px 64px rgba(0, 0, 0, 0.14), 0 4px 16px rgba(0, 0, 0, 0.07);
  --theme-shadow-card: 0 -4px 30px rgba(0, 0, 0, 0.1);
  --theme-shadow-btn: 0 4px 14px rgba(46, 125, 82, 0.35);

  /* Typography */
  --theme-font-sans: 'DM Sans', sans-serif;
  --theme-font-serif: 'Lora', serif;
  --theme-font-lato: 'Lato', sans-serif;

  /* App shell — max width of the centered column on desktop. Change one value to resize. */
  --app-shell-width: 1200px;

  /* Layout heights (px values, used in calc) */
  --header-height: calc(var(--jsheader-height));  /* set by JS — do not hardcode */
  --footer-height: 70;
  --breadcrumb-height: 40;
  --viewnotethumb-box-min-height: 56;

  /* Size helpers */
  --size-095: 0.95rem;
  --size-1: 1rem;
  --size-1_1: 1.1rem;

  /* Spacing / radii */
  --theme-radius-sm: 10px;
  --theme-radius-card: 24px;

  /* Notebook cover gradients (forest, emerald, lime, sage) */
  --notebook-forest: linear-gradient(145deg, #1b3d29, #06100a);
  --notebook-emerald: linear-gradient(145deg, #1b3d29, #00920c);
  --notebook-lime: linear-gradient(145deg, #8be04a, #5db830);
  --notebook-sage: linear-gradient(145deg, #82c098, #7d9886);
  --notebook-forest-color: #1b3d29;
  --notebook-emerald-color: #2e7d52;
  --notebook-lime-color: #5db830;
  --notebook-sage-color: #7d9886;
}
```

> **`--header-height` is set by JavaScript** after the header mounts (`document.getElementById('header_height').getBoundingClientRect().height`). Set the CSS variable via `document.documentElement.style.setProperty('--jsheader-height', height)`. Similarly, `--jsvh` is set to `window.innerHeight` so scroll containers use the real visible viewport height rather than the CSS `100vh` which includes mobile browser chrome.

> **Replace legacy variables, do not merge.** Apps that have not yet been updated contain a completely different variable set — e.g. `--color-primary: #4d0000` (dark red), `--color-secondary: #b30000`, `--notebook-color-tab-red/blue/green/default`, grey palette (`--color-grey-*`), Vuetify size tokens (`--size-0` … `--size-40`), `--footer-height: 55`, `--breadcrumb-height: 50`, etc. **Delete all legacy colour and layout variables** from the global stylesheet and replace with the variables above. Key value changes: `--footer-height` 55 → **70**, `--breadcrumb-height` 50 → **40**.

---

## 2. Fonts

**Remove** the existing Roboto `<link>` from `<head>` (or equivalent bootstrap):
```html
<!-- REMOVE this line (or the equivalent in the target framework): -->
<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500&display=swap" rel="stylesheet">
```

**Add** the three theme fonts instead:
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

Update the `theme-color` meta tag: `<meta name="theme-color" content="#1b3d29">` (was `#4D0000`).

---

## 3. Layout Behavior

### App shell (desktop centering)

The app is mobile-first. On desktop it is constrained to a centered column with dark green "wings" behind it — the same pattern used by Instagram and similar mobile-first web apps.

**`body`** — set `background: var(--theme-green)` so the wings show the brand colour.

**`.app-shell`** — wrap the entire app (header + main + overlays) in this div:
```css
.app-shell {
  max-width: var(--app-shell-width); /* change the variable to resize — currently 1200px */
  margin: 0 auto;
  min-height: 100dvh;
  position: relative;
  background: var(--theme-bg);
  overflow-x: hidden;
  overflow: hidden;            /* clips header to the rounded corners */
  border-radius: 16px 16px 0 0;
  box-shadow: 0 -2px 40px rgba(0, 0, 0, 0.25);
}
```

**Fixed footer** — `.page_footer` uses `position: fixed`, `height: calc(var(--footer-height) * 1px)`, `background-color: var(--theme-surface)`, and a `border-top: 1px solid var(--theme-border)`. Override for viewports wider than the shell so it stays within the app column. **The media query threshold must match `--app-shell-width` — update both together (currently `1200px` / `1201px`).**
```css
.page_footer {
  width: 100%;
  position: fixed;
  height: calc(var(--footer-height) * 1px);
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  justify-content: center;
  bottom: 0;
  z-index: 6;
  background-color: var(--theme-surface);
  border-top: 1px solid var(--theme-border);
}

@media (min-width: 1201px) { /* matches --app-shell-width: 1200px */
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

In Vue (Vue Router): derive `const isLoginPage = computed(() => route.name === 'login')` in `LayoutComponent.vue` and wrap `<MainNavigation />` with `<template v-if="!isLoginPage">`. Also add `<main :class="{ 'login-page': isLoginPage }">`.

In Angular: check `router.url === '/login'` in `AppComponent`. In React/Next.js: check `pathname === '/login'` from `usePathname()` or `useLocation()`.

Ensure the main content area has `min-height: 100dvh` when on the login page so the splash fills the viewport:
```css
main.login-page { min-height: 100dvh; display: flex; flex-direction: column; }
```

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

**Also rename the old CSS tab classes** — in `notebook-list-shared-css.scss` (or equivalent), replace the old striped-gradient tab classes with solid gradient ones:

| Remove | Add |
|--------|-----|
| `.tab_default { background: var(--notebook-color-tab-default); }` | `.tab_sage { background: var(--notebook-sage); }` |
| `.tab_red { background: var(--notebook-color-tab-red); }` | `.tab_forest { background: var(--notebook-forest); }` |
| `.tab_blue { background: var(--notebook-color-tab-blue); }` | `.tab_emerald { background: var(--notebook-emerald); }` |
| `.tab_green { background: var(--notebook-color-tab-green); }` | `.tab_lime { background: var(--notebook-lime); }` |
| `.tab_loading { background: var(--notebook-color-tab-loading); }` | `.tab_loading { background: var(--theme-text-muted); }` |

Also **remove** `.notebook_color_bg_*` and `.notebook_cover_default/red/blue/green` helper classes (replaced by `.notebook_cover_forest/emerald/lime/sage` from `global.scss`).

### Notebook list styling
- **Breadcrumb as section header:** On notebooks page, breadcrumb uses light green background (`var(--theme-bg)`), no border; `.breadcrumb_group` styled with Lora, 1.1rem, font-weight 600, `var(--theme-text-secondary)`
- Notebook cards: `border-radius: 14px`, `border: 1px solid var(--theme-border)`, `box-shadow: var(--theme-shadow-sm)`
- Cover bar (`.notebooks_list_left`): `width: 27px; min-width: 27px; height: 40px`, gradient background from `var(--notebook-forest)` / `var(--notebook-emerald)` / `var(--notebook-lime)` / `var(--notebook-sage)`, `border-radius: 5px`, `position: relative`, `overflow: hidden` (was `width: 20px` in legacy apps)
- **Notebook spine** (vertical bar on left edge of cover, 4px wide): `.nb-spine-{forest|emerald|lime|sage|loading}` — `position: absolute`, `left: 0`, `top: 0`, `bottom: 0`, `width: 4px`. Spine colors are contrast colours for each cover and use the solid `--notebook-*-color` variables:
  - `.nb-spine-forest`: `var(--notebook-emerald-color)` (`#00920c`)
  - `.nb-spine-emerald`: `var(--notebook-lime-color)` (`#5db830`)
  - `.nb-spine-lime`: `var(--notebook-sage-color)` (`#7d9886`)
  - `.nb-spine-sage`: `var(--notebook-forest-color)` (`#1b3d29`)
  - `.nb-spine-loading`: `var(--theme-text-muted)`
- **New Notebook FAB** (`.fab`): Text "New Notebook", plus icon (SVG). `background: var(--theme-green)`, `color: white`, `border: none`, `border-radius: var(--theme-radius-sm)` (square — all buttons use same shape), `padding: 12px 22px`, `font-family: var(--theme-font-sans)`, `font-size: 13px`, `font-weight: 600`, `display: flex`, `align-items: center`, `gap: 7px`, `box-shadow: 0 4px 18px rgba(46,125,82,0.38)`. Hover: `background: var(--theme-green-accent)`.
- **FAB row** (`.fab-row`): Wraps the FAB in the footer. `width: 100%`, `display: flex`, `justify-content: center`
- **Note count badge** (`.nb-count`): Shown in each `NotebookListItem` row between the name and the `›` arrow. `font-size: 12px`, `color: var(--theme-text-muted)`, `background: var(--theme-bg)`, `border-radius: 99px`, `padding: 2px 8px`, `font-weight: 500`, `white-space: nowrap`

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

```css
.header {
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 18px;
  background: var(--theme-surface);
  border-bottom: 1px solid var(--theme-border);
}

.header_container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: 44px;
}
```

- **Logo mark** (`.logo_mark`): `width: 30px`, `height: 30px`, `border-radius: 8px`, `background: var(--theme-green)`. Render a white icon inside — use either `<img src="/assets/images/edit_white.png" width="18" height="18">` or the pencil-in-square SVG from section 5 with white strokes.
- **Logo text** (`.logo_text`): `font-family: var(--theme-font-serif)`, `font-size: 24px`, `font-weight: 600`, `letter-spacing: -0.02em`, `color: var(--theme-green)`
- **Menu icon button** (`.more_vert` / `.icon`): `width: 32px`, `height: 32px`, `border-radius: 50%`, `background: rgba(0,0,0,0.05)`, `border: 1px solid var(--theme-border)`, icon color `var(--theme-text-muted)`
- **Header toolbar** (`.header_toolbar`): `margin-left: auto`, `display: flex`, `align-items: center`, `gap: 10px`

### Breadcrumb

The breadcrumb bar uses a **white surface** (not the light-green page background).

```css
.breadcrumb_container {
  position: relative;
  width: 100%;
  height: calc(var(--breadcrumb-height) * 1px);   /* 40px */
  display: flex;
  align-items: center;
  padding: 9px 18px;
  background: var(--theme-surface);               /* white — was var(--theme-bg) */
  border-bottom: 1px solid var(--theme-border);
  box-shadow: var(--theme-shadow-sm);
  z-index: 6;
}

.breadcrumbs_inner {
  display: flex;
  align-items: center;
  margin: 0;
  font-family: var(--theme-font-lato);            /* Lato — not Lora */
  font-size: 16px;
  line-height: 1.5;
  letter-spacing: 0.00938em;
  color: var(--theme-text-muted);
}

/* Edit notebook FAB (absolute right) */
.breadcrumb_edit_fab {
  position: absolute;
  right: 15px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: none;
  background: var(--theme-bg);
  color: var(--theme-text);
  box-shadow: var(--theme-shadow-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
```

---

## 9. Dropdown Menu

The main navigation header contains a `more_vert` button that opens a dropdown menu (Profile, Sign in/out).

### Menu icon button

```css
.icon.more_vert {
  color: var(--theme-text-muted);
  background: rgba(0, 0, 0, 0.05);
  border: 1px solid var(--theme-border);
  border-radius: 50%;
  width: 32px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
```

A `.ripple-burst` animation fires on each click — a radial burst that scales up and fades:

```css
.ripple-burst {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  background-color: currentColor; border-radius: 50%;
  pointer-events: none; z-index: 2;
  animation: ripple-animation 1.1s ease-out forwards;
}
@keyframes ripple-animation {
  0%   { transform: scale(0.5); opacity: 0; }
  5%   { opacity: 0.3; }
  100% { transform: scale(3); opacity: 0; }
}
```

### Dropdown panel

```css
.dropdown-menu {
  position: absolute; top: 100%; right: 0; margin-top: 6px;
  background: var(--theme-surface); border-radius: 14px; min-width: 160px;
  z-index: 100; display: flex; flex-direction: column;
  border: 1px solid var(--theme-border); box-shadow: var(--theme-shadow-lg);
}

.dropdown-item {
  display: flex; align-items: center; gap: 10px; padding: 12px 16px;
  font-size: 16px; font-weight: 400; color: rgba(0, 0, 0, 0.87);
  font-family: var(--theme-font-sans); width: 100%;
  background: none; border: none; cursor: pointer; text-align: left;
}
.dropdown-item:hover { background: var(--theme-ghost-hover); box-shadow: var(--theme-shadow-sm); }
.dropdown-menu .dropdown-item:not(:first-child) { border-top: 2px solid var(--theme-border); }
.dropdown-item:first-child  { border-top-left-radius: 14px; border-top-right-radius: 14px; }
.dropdown-item:last-child   { border-bottom-left-radius: 14px; border-bottom-right-radius: 14px; }
```

### Icon pills inside menu items

```css
/* Default icon pill */
.menu_item {
  background: var(--theme-lime-bg);
  color: var(--theme-text-secondary);
  border-radius: 10px;
  padding: 5px;
  font-size: 20px;
}

/* Sign-out icon — danger tint */
.danger_icon {
  background: var(--theme-danger-bg);
  color: var(--theme-danger-dark);
  border-radius: 10px;
  padding: 5px;
}
```

**Animation:** In Svelte, use `transition:slide={{ duration: 150 }}`. For other frameworks: reveal with a height/clip-path or opacity+translateY transition over ~150ms ease.

---

## 10. Notebook View (Note List)

### Note list layout
- Container (`.notes-list-container`): `background: var(--theme-bg)`, `min-height: 100%`, `padding-bottom: 8px`
- List (`<ul>.notes_list`): `list-style: none`, `padding: 14px`, `display: flex`, `flex-direction: column`, `gap: 10px`
- Wrapper (`.notebooks-list-wrap`): `width: 100%`, `max-width: 640px`, `margin: 0 auto`; full-width on mobile (`max-width: 100%` at ≤768px)
- Section heading (`.page-heading`): Lora, 18px, `color: var(--theme-text-muted)`, `margin: 16px 16px 0`

> **No section header inside the list** — the notebook name is shown only in the breadcrumb. The `.page-heading` ("Your Notes") sits above the list container.

### Note cards
```css
/* Outer wrapper — relative position for the invisible link overlay */
.note-card-outer { position: relative; }

/* Invisible full-card link overlay for navigation (z-index 1) */
.note-card-link-overlay { position: absolute; inset: 0; z-index: 1; }

/* Hover — use :has() so only the link overlay hover triggers the effect */
.note-card-outer:has(> .note-card-link-overlay:hover) .note-card {
  box-shadow: var(--theme-shadow-mid);
  background-color: var(--theme-ghost-hover);
}

.note-card {
  background: var(--theme-surface); border-radius: 14px; padding: 14px 14px 12px;
  border: 1px solid var(--theme-border); box-shadow: var(--theme-shadow-sm);
  display: flex; gap: 10px; align-items: flex-start;
}
.note-card--selected { border-color: var(--theme-green); box-shadow: 0 0 0 2px var(--theme-lime-light); }

/* Card body */
.note-card-body { flex: 1; min-width: 0; padding: 12px; }

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
.note-date { font-size: 11px; color: var(--theme-text-muted); }
```

**Preview implementation:** Use a `ViewNoteThumb` component (or equivalent) that runs `truncateMarkdownPreview` on the note body and renders it as HTML. Clip the output with `.note-thumb-preview { max-height: 80px; overflow: hidden; }`. Do **not** use a plain-text `extractNotePreview` function for the card body.

### Tag pills (auto-detected from note content)

Every note shows exactly one pill. Detection runs in priority order and returns on the first match:

```css
.note-tag   { font-size: 12px; font-weight: 500; letter-spacing: 0.06em; text-transform: uppercase; padding: 2px 8px; border-radius: 99px; }
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
  box-shadow: 0 3px 10px rgba(46, 125, 82, 0.28); cursor: pointer;
}
.btn-action-primary:hover { background: var(--theme-green-accent); }

.btn-action-ghost {
  color: var(--theme-text); border: 1px solid var(--theme-border-input); border-radius: var(--theme-radius-sm);
  padding: 11px 28px; font-family: var(--theme-font-sans); font-size: 13px; font-weight: 600;
  display: flex; align-items: center; justify-content: center; gap: 6px; cursor: pointer;
}
button.btn-action-ghost:hover { background-color: var(--theme-ghost-hover); }

.btn-action-danger {
  background: var(--theme-danger-bg); color: var(--theme-danger-dark);
  border: 1px solid #fecaca; border-radius: var(--theme-radius-sm);
  padding: 11px 28px; font-family: var(--theme-font-sans); font-size: 13px; font-weight: 500;
  display: flex; align-items: center; justify-content: center; gap: 6px; cursor: pointer;
}
.btn-action-danger:hover { background-color: var(--theme-danger-light); }

/* Responsive padding — shrink on small screens */
@media (max-width: 430px) {
  .btn-action-primary, .btn-action-ghost, .btn-action-danger { padding: 8px 16px; }
}
@media (max-width: 300px) {
  .btn-action-primary, .btn-action-ghost, .btn-action-danger { padding: 8px 10px; }
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

- [ ] Add theme CSS variables to `:root` — **remove all legacy `--color-*`, `--notebook-color-*`, and old size variables first** (see Section 15)
- [ ] Update `--footer-height` from `55` → `70` and `--breadcrumb-height` from `50` → `40`
- [ ] Add Lora (variable 400–700), DM Sans, and Lato fonts; **remove Roboto** `<link>` from `index.html`
- [ ] Update theme-color meta to `#1b3d29` (was `#4D0000`)
- [ ] Add `.app-shell` wrapper + `body { background: var(--theme-green) }` + fixed footer media query (threshold: `1201px`)
- [ ] Set JS viewport vars: `--jsvh` = `window.innerHeight`, `--jsheader-height` = measured header height
- [ ] Hide header/nav when route is login
- [ ] Ensure main content area fills viewport on login (`min-height: 100dvh`)
- [ ] Implement splash + login card layout
- [ ] Add pencil-in-square logo SVG (or use `edit_white.png` image asset)
- [ ] Style form inputs and button with theme variables
- [ ] Add focus states for inputs
- [ ] Add autofill override (webkit box-shadow inset trick) to prevent blue autofill background
- [ ] Ensure ErrorAlert is theme-aware or styled consistently (warning / success severity variants)
- [ ] Notebooks: Replace cover options (forest, emerald, lime, sage) with gradients
- [ ] Notebooks: Add legacy cover mapping for API backward compatibility
- [ ] Notebooks: Add spine bar (4px vertical bar on left of cover) with contrast colors per cover type
- [ ] Notebooks: Update header to theme green (logo 24px Lora, letter-spacing -0.02em)
- [ ] Notebooks: Update breadcrumb — white surface bg, 1px border, shadow-sm, Lato 16px, muted text
- [x] Notebooks: New Notebook FAB — square button (`var(--theme-radius-sm)`), theme green, plus SVG icon
- [x] Notebooks: New Notebook form — bottom sheet, slide-up/down animation, cover swatches, Create/Cancel buttons
- [ ] Notebooks: Note count badge (`.nb-count`) on each list item — pill with theme-bg background
- [x] Notebook View: Note cards — white card, Lato uppercase title, ViewNoteThumb preview, date, tag pill
- [x] Notebook View: Note list layout — flex column, gap 10px, theme-bg background, `.notebooks-list-wrap` max-width 640px
- [x] Notebook View: No section header — notebook name shown in breadcrumb only
- [x] Notebook View: Action bar buttons — btn-action-primary/ghost/danger, padding-driven width, nb-footer-row wrapper
- [ ] Notebook View: Action button hover states (`green-accent`, `ghost-hover`, `danger-light`) + responsive padding (430px, 300px breakpoints)
- [ ] Notebook View: Note card hover — `:has()` selector with `shadow-mid` + `ghost-hover` bg
- [x] Notebook View: Edit mode — circle selector, selected state styling, overlay structure (checkbox click fix), CSS-only checkbox column animation
- [x] Notebook View: noteCardUtils — robust `extractNoteTitle` (toPlainText + TITLE_MAX_CHARS) and `detectNoteTag` (7 tags: todo, table, code, image, list, text, empty)
- [x] Notebook View: Edit mode selection pill — "X selected" in header toolbar when in edit mode
- [x] Move to Notebook dialog — bottom sheet style, custom notebook options with cover+spine, keyboard handling
- [x] Button shape — all action buttons use `var(--theme-radius-sm)` (square)
- [x] Footer — `--footer-height: 70`, `background-color: var(--theme-surface)`, `border-top: 1px solid var(--theme-border)`, scrollable area uses layout calc
- [ ] Dropdown menu — panel styles, `.menu_item` pill, `.danger_icon` tint, slide animation ~150ms
- [ ] Snackbar — dark green bg (`--theme-green-snackbar`), slide-up from bottom, flip to top on desktop
- [x] NotePage: footer buttons (Example, Create Note, Save Note, View/Edit, Split Screen) migrated to `btn-action-primary` / `btn-action-ghost` with inline SVG icons
- [ ] NotePage: view/edit pane styles — `.edit` uses `--theme-edit-bg` / `--theme-edit-text`, `.view` uses `--theme-bg` / `--theme-text-secondary`
- [x] ProfileForm — two-tab UI (Username/Password), themed inputs, password strength bar, char counter, save button with tooltip
- [ ] Replace Vuetify/framework UI components: `v-btn` → native `<button>`, `v-card` → `<div>`, `v-dialog` → bottom sheet, `v-snackbar` → custom snackbar, `v-menu` → custom dropdown (see Section 15)
- [ ] Update `LayoutComponent`: add `.app-shell`, hide `<MainNavigation>` on login route, add `login-page` class to `<main>` (see Section 15)
- [ ] Update `MainNavigation`: replace red header with white surface header, update logo mark/text (see Section 15)
- [ ] Update `breadcrumb_shared.scss`: replace heavy box-shadow with `shadow-sm` + `border-bottom`, update font to Lato (see Section 15)
- [ ] Update `notebook-list-shared-css.scss`: rename tab classes, add spine classes, resize cover bar (see Section 8 and 15)
- [ ] **Other** — any remaining `.v-btn`, `.contained`, or legacy button classes in shared CSS

---

## 12. Snackbar

A toast notification that briefly shows a confirmation (e.g. "Saved"). Position: slides up from the bottom of the app shell on mobile, flips to top on desktop.

```css
.snackbar {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%) translateY(80px);
  background: var(--theme-green-snackbar);  /* #2d4a2d — dark forest green */
  color: white;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 11px 16px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  white-space: nowrap;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
  opacity: 0;
  transition: transform 0.3s cubic-bezier(0.32, 1.2, 0.5, 1), opacity 0.3s ease;
  z-index: 100;
  pointer-events: none;
}

/* Visible state — add class "show" */
.snackbar.show {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

/* Desktop: position at top and slide in from above */
@media (min-width: 768px) {
  .snackbar {
    bottom: auto;
    top: 24px;
    transform: translateX(-50%) translateY(-80px);
  }
  .snackbar.show {
    transform: translateX(-50%) translateY(0);
  }
}
```

**Content:** Include a white checkmark SVG icon (16×16, circle outline) to the left of the message text:

```html
<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
  <circle cx="8" cy="8" r="7.5" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.5)" stroke-width="1"/>
  <path d="M4.5 8l2.5 2.5 4.5-4.5" stroke="white" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
```

**Timing:** Show for ~2000ms, then hide. Trigger the `.show` class on mount; remove it after the timeout.

---

## 13. Profile Page

### UserProfile — avatar and identity

```css
.profile_outer {
  width: 60px; height: 60px; flex-shrink: 0; border-radius: 50%;
  background: linear-gradient(135deg, #3d9966, #2e7d52);
  display: flex; align-items: center; justify-content: center;
  font-family: var(--theme-font-serif); font-size: 16px; font-weight: 600; color: white;
  margin-top: 48px; margin-bottom: 20px;
  box-shadow: var(--theme-shadow-lg);
}

.profile_name {
  font-family: var(--theme-font-serif); font-size: 20px; font-weight: 600;
  color: var(--theme-text); margin-bottom: 3px;
}

.profile_email {
  font-size: 13.5px; color: var(--theme-text-muted); margin-bottom: 20px;
}
```

Render the user's initial (first character of username, uppercased) as the avatar text. The outer container is `text-align: center; display: flex; flex-direction: column; align-items: center`.

### ProfileForm — two-tab UI

**Structure:**
```
.pf-outer (flex, justify-content: center)
└── .tab-container (max-width: 340px, width: 100%)
    ├── .tabs
    │   ├── .tab[Username]
    │   └── .tab[Password]
    └── .tab-panel
        └── .tab-content (fadeUp animation on tab switch)
            └── form
                ├── .form-field + .field-feedback (label + input + inline-error + char-counter)
                ├── [Password tab only] .strength-row (4 × .bar-seg)
                └── .btn-wrap > .btn-tooltip + .btn-save
```

**Tab bar:**
```css
.tabs {
  display: flex;
  background: var(--theme-surface);
  border-radius: 10px 10px 0 0;
  border: 1px solid var(--theme-border-green);
  border-bottom: none;
  overflow: hidden;
}

.tab {
  flex: 1; padding: 10px 6px; font-size: 13px; font-weight: 600;
  color: var(--theme-text-muted); background: var(--theme-bg);
  border-bottom: 2px solid transparent;
  display: flex; align-items: center; justify-content: center; gap: 5px;
  transition: all 0.15s;
}

.tab.active {
  color: var(--theme-green);
  background: var(--theme-surface);
  border-bottom: 1px solid var(--theme-green);
}
```

**Tab panel:**
```css
.tab-panel {
  background: var(--theme-surface);
  border: 1px solid var(--theme-border-green);
  border-radius: 0 0 10px 10px;
  padding: 16px;
  margin-bottom: 30px;
}

.tab-content { animation: fadeUp 0.18s ease; }

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

**Form fields:**
```css
.form-label {
  display: block; font-size: 10.5px; font-weight: 600;
  letter-spacing: 0.08em; text-transform: uppercase;
  color: var(--theme-text-muted); margin-bottom: 5px;
}

.form-input {
  width: 100%; padding: 9px 12px;
  border: 1.5px solid var(--theme-border-input); border-radius: 8px;
  font-size: 13.5px; background: var(--theme-input-bg); color: var(--theme-text);
  outline: none; transition: border-color 0.15s, background 0.15s;
}
.form-input:focus {
  border-color: var(--theme-green-mid);
  background: var(--theme-surface);
  box-shadow: 0 0 0 3px rgba(61, 153, 102, 0.1);
}
.form-input.input-error { border-color: var(--theme-danger-dark); background: #fff8f8; }

/* Feedback row (error + char counter) */
.field-feedback {
  height: 20px; display: flex; align-items: center;
  justify-content: space-between; margin-bottom: 8px; padding: 0 1px;
}
.inline-error {
  display: flex; align-items: center; gap: 4px;
  font-size: 10.5px; color: var(--theme-danger-dark);
  opacity: 0; transition: opacity 0.15s;
}
.inline-error.visible { opacity: 1; }

.char-counter { font-size: 10px; color: var(--theme-text-muted); margin-left: auto; }
.char-counter.over { color: var(--theme-danger-dark); font-weight: 600; }
```

**Password strength bar (4 segments):**
```css
.strength-row {
  height: 20px; display: flex; align-items: center;
  gap: 3px; margin-bottom: 8px;
}
.bar-seg {
  height: 3px; flex: 1; border-radius: 2px;
  background: var(--theme-border); transition: background 0.2s;
}
.bar-seg.weak { background: var(--theme-danger-dark); }
.bar-seg.ok   { background: #d4a84b; }
.bar-seg.good { background: var(--theme-green-mid); }
```

**Save button with tooltip:**
```css
.btn-wrap { position: relative; }

/* Tooltip — appears above button on hover */
.btn-tooltip {
  position: absolute; bottom: calc(100% + 7px); left: 50%;
  transform: translateX(-50%);
  background: var(--theme-green); color: white;
  font-size: 10.5px; font-weight: 500; padding: 5px 10px;
  border-radius: 6px; white-space: nowrap;
  pointer-events: none; opacity: 0; transition: opacity 0.15s;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15); z-index: 10;
}
/* Down-pointing arrow */
.btn-tooltip::after {
  content: ""; position: absolute; top: 100%; left: 50%;
  transform: translateX(-50%);
  border: 5px solid transparent; border-top-color: var(--theme-green);
}
@media (hover: hover) { .btn-wrap:hover .btn-tooltip { opacity: 1; } }

.btn-save {
  width: 100%; padding: 10px;
  background: var(--theme-green); color: white;
  border: none; border-radius: 8px;
  font-size: 13.5px; font-weight: 600;
  cursor: pointer; transition: background 0.15s;
}
.btn-save:hover:not(:disabled) { background: var(--theme-green-dark); }
.btn-save:disabled { background: #a0b89a; cursor: not-allowed; }
```

---

## 14. Note View / Edit Panes

The note page shows one or two panes (view-only, edit-only, or split-screen side-by-side). Apply these background and text colors:

```css
/* Edit pane — plain monospace editor feel */
.edit {
  background-color: var(--theme-edit-bg);   /* #f9f9f9 — very light grey */
  color: var(--theme-edit-text);            /* #071d11 — near-black green */
  font-family: monospace;
}

/* View pane — rendered markdown */
.view {
  background-color: var(--theme-bg);        /* #f4f9f1 — light green tint */
  color: var(--theme-text-secondary);       /* #3d5a47 */
  font-family: var(--theme-font-sans);
}
```

Both panes scroll independently (`overflow-y: scroll`). Their height fills the viewport minus all chrome:

```css
.page_scrollable_header_breadcrumb_footer {
  height: calc(var(--jsvh) - (var(--header-height) + var(--footer-height) + var(--breadcrumb-height)) * 1px);
}
```

**Split-screen layout** — when active, both panes are `float: left; width: 50%` (or `flex: 1; min-width: 0` inside a flex row).

**Code blocks** in the view pane use a dark background:
```css
pre:has(> code:first-child),
:not(pre) > code[class*="language-"],
pre[class*="language-"] {
  background: var(--theme-green-dark) !important;  /* #001f0c */
}
```

Inline code uses a dark charcoal pill: `background-color: #4b4b59; color: white; border-radius: 5px; padding: 0 4px`.

---

## 15. Framework Migration Reference

This section documents what to **replace or remove** in apps that have not yet been updated. It uses the Vue app as the reference starting point, but the same patterns apply to Angular Material, Bootstrap-based React, etc.

### CSS / Global Styles

| Action | Detail |
|--------|--------|
| Create `theme-variables.css` | Add all variables from Section 1 to a new file and import it first in the global stylesheet entry point (e.g. `main.css`). Alternatively, add the `:root {}` block at the very top of `global.scss`. |
| Remove legacy colour variables | Delete all `--color-primary`, `--color-secondary`, `--color-grey-*`, `--color-primary-*`, `--color-success-*`, `--color-error-*`, and `--main-navigation-bg-color` from `global.scss`. |
| Remove legacy notebook variables | Delete `--notebook-color-tab-default/red/blue/green/loading` and `--notebook-color-bg-*` from `global.scss`. |
| Update `--footer-height` | Change `55` → `70`. |
| Update `--breadcrumb-height` | Change `50` → `40`. |
| Update `font-family` on `html, body` | Change from `'Helvetica', 'Arial', sans-serif` to `var(--theme-font-sans)`. |
| Update `color` on `html, body` | Change from `rgb(98, 98, 98)` to `var(--theme-text-secondary)`. |
| Update `accent-color` on checkboxes | Change from `var(--color-primary)` to `var(--theme-green)`. |
| Remove `.snackbar { background: #2196f3; }` | The custom snackbar component (Section 12) replaces Vuetify's `v-snackbar`. |

### Notebook List Shared CSS (`notebook-list-shared-css.scss`)

Replace the entire file content with the styles from `notebook-list-shared.scss` in the Svelte reference. Key changes:
- Rename tab classes (`tab_red/blue/green/default` → `tab_forest/emerald/lime/sage`) — see Section 8
- Add spine bar classes (`.nb-spine-forest/emerald/lime/sage/loading`)
- Increase `.notebooks_list_left` size: `width: 27px; min-width: 27px; height: 40px`
- Add `.notebooks_list_outer` with `border-radius: 14px`, `padding: 13px 14px`, `gap: 12px`, white bg
- Remove `.notebooks_list li div:hover` (replaced by ghost-hover on outer)

### Breadcrumb Shared CSS (`breadcrumb_shared.scss`)

Key changes vs. legacy version:
- `.breadcrumb_container`: remove heavy 3-layer box-shadow; use `box-shadow: var(--theme-shadow-sm)` + `border-bottom: 1px solid var(--theme-border)`
- `.breadcrumb_container`: background `#ffffff` → `var(--theme-surface)` (same value, but now variable-driven)
- `.breadcrumbs_inner`: font from `Roboto, Helvetica, Arial` → `var(--theme-font-lato)`; color from `rgba(0,0,0,0.6)` → `var(--theme-text-muted)`; font-size `1rem` → `16px`
- `.breadcrumb_group`: same updates as `.breadcrumbs_inner`
- `.breadcrumb_edit_fab`: remove heavy shadow; use `box-shadow: var(--theme-shadow-sm)`; background `rgb(224,224,224)` → `var(--theme-bg)`

### Vuetify Component Replacements

The Vue app uses Vuetify 3 components throughout. Replace them with native HTML + the CSS classes from this spec:

| Vuetify component | Replacement |
|-------------------|-------------|
| `<v-btn color="secondary" class="contained">` | `<button class="btn-action-primary">` (see Section 10) |
| `<v-btn variant="text" class="basic large">` | `<button class="btn-action-ghost">` |
| `<v-btn color="secondary">` (cancel/danger) | `<button class="btn-action-ghost">` or `<button class="btn-action-danger">` |
| `<v-card>` | Plain `<div>` with appropriate background/border/radius |
| `<v-dialog>` (Add/Edit Notebook) | Bottom sheet pattern from Section 8 (`.sheet-overlay` + `.bottom-sheet`) |
| `<v-snackbar>` | Custom `.snackbar` component from Section 12 |
| `<v-menu>` + `<v-list>` (MenuDropdown) | Custom `.dropdown-menu` from Section 9 |
| `<v-form>` | Native `<form>` |
| `<v-btn class="contained medium button_fab">` (FAB) | `<button class="fab">` (see Section 8) |
| `<v-skeleton-loader>` | Simple loading state div |
| `<LoadingScreen />` | Simple loading spinner or text |

**Remove `vue-specific.scss` overrides that are no longer needed** once Vuetify components are replaced: `.v-card--variant-elevated`, `.v-btn`, `.v-btn.contained:hover`, `.v-snackbar__wrapper`, `.v-overlay__scrim`, `.rounded-xl`, `.dialogue-title`, `input/select/textarea` overrides. The autofill override (`input:-webkit-autofill` box-shadow trick) is still needed — move it to the shared global CSS.

### LayoutComponent Changes

In Vue (`LayoutComponent.vue`), make these structural changes:

1. **Add `.app-shell` wrapper** around all content.
2. **Import `useRoute`** and derive `const isLoginPage = computed(() => route.name === 'login')`.
3. **Conditionally hide `<MainNavigation />`**: `<MainNavigation v-if="!isLoginPage" />`.
4. **Add login-page class to `<main>`**: `<main :class="{ 'login-page': isLoginPage }">`.
5. **Remove the window resize listener for `mobileSizeStore.btnSize`** — button sizing is now handled by responsive CSS, not by Vuetify's `:size` prop.

```vue
<template>
  <div class="app-shell">
    <MainNavigation v-if="!isLoginPage" />
    <main :class="{ 'login-page': isLoginPage }">
      <slot></slot>
    </main>
    <Transition name="notification">
      <NotificationView v-if="status" ... />
    </Transition>
    <SnackBar />
  </div>
</template>
```

### MainNavigation Changes

Replace the entire scoped `<style>` block:

```css
/* REMOVE */
.header { background-color: #4d0000; }
.header_title { color: #ffffff; font-family: monospace; font-size: 2.4rem; }

/* ADD — matches Section 6 */
.header { background: var(--theme-surface); border-bottom: 1px solid var(--theme-border); padding: 10px 18px; display: flex; align-items: center; }
.header_container { display: flex; align-items: center; justify-content: space-between; width: 100%; min-height: 44px; }
.logo_mark { width: 30px; height: 30px; border-radius: 8px; background: var(--theme-green); display: flex; align-items: center; justify-content: center; margin-right: 5px; }
.logo_text { font-family: var(--theme-font-serif); font-size: 24px; font-weight: 600; letter-spacing: -0.02em; color: var(--theme-green); }
.header_toolbar { margin-left: auto; display: flex; align-items: center; gap: 10px; }
```

Update the template to use `.logo_mark` + `.logo_text` instead of `.header_title_logo` + `.header_title`, and add the edit-notes selection pill (see Section 10).

### MenuDropdown Changes

Replace the Vuetify `<v-menu>` + `<v-list>` with the custom dropdown from Section 9. The trigger button (`.icon.more_vert`) is a native `<button>` with a circular grey background. The menu panel is a positioned `<div class="dropdown-menu">` containing `<button class="dropdown-item">` elements.

### SnackBar Changes

Replace `<v-snackbar>` with the custom snackbar from Section 12. The Vuetify snackbar success styles (`color: #116600`) are replaced by the dark green themed snackbar. The `show` class is toggled via a reactive boolean that auto-clears after 2000ms.

### ProfileForm Changes

The current Vue `ProfileForm` uses two toggle buttons (show/hide form sections). Replace with the two-tab UI from Section 13 — `Username` tab and `Password` tab rendered in a `<div class="tabs">` + `<div class="tab-panel">` structure. Replace `v-btn` submit buttons with `<button class="btn-save">`. Replace `v-form` with native `<form>`. Add password strength bar and char counter (Section 13).

### UserProfile Changes

Add the gradient avatar circle above the username and email (Section 13). The avatar displays the first letter of the username. Replace the plain `<h2>` / `<h3>` with styled `.profile_name` / `.profile_email` divs.
