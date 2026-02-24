# Theme Update Prompt — Notes App (Green Theme v2)

Use this document as a prompt/spec when updating the Next.js, React, Angular, and Vue versions of the Notes app to match the green theme design.

**Design reference:** `file:///C:/0930_ai_screenshots/notes-app/generated/notes-green-theme-v2_updated/notes-green-v2.html`

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

  /* Spacing / radii */
  --theme-radius-sm: 10px;
  --theme-radius-card: 24px;
}
```

---

## 2. Fonts

Add Google Fonts in your HTML `<head>` or equivalent:

```html
<link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap" rel="stylesheet">
```

Update `theme-color` meta tag to `#1B3D29`.

---

## 3. Layout Behavior

**Hide header/navigation on login route.** When the current route is `/login` (or equivalent), do not render the main navigation header or breadcrumb. The login page should be full-screen without the app chrome.

Ensure the main content area has `min-height: 100vh` when on the login page so the splash fills the viewport.

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

## 8. Implementation Checklist

- [ ] Add theme CSS variables to `:root`
- [ ] Add Lora and DM Sans fonts
- [ ] Update theme-color meta to `#1B3D29`
- [ ] Hide header/nav when route is login
- [ ] Ensure main content area fills viewport on login
- [ ] Implement splash + login card layout
- [ ] Add pencil-in-square logo SVG
- [ ] Style form inputs and button with theme variables
- [ ] Add focus states for inputs
- [ ] Ensure ErrorAlert is theme-aware or styled consistently
