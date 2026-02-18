// Vuetify-style class names for Svelte (matches Vue/Vuetify structure)

export const V_CARD =
  'v-card v-theme--myCustomLightTheme v-card--density-default v-card--variant-elevated'

export const V_CARD_TEXT = 'v-card-text'

export const V_CARD_TITLE = 'v-card-title'

/** Combines V_CARD with extra classes */
export function vCard(...extra: (string | undefined)[]): string {
  return [V_CARD, ...extra.filter(Boolean)].join(' ')
}

/** Combines V_CARD_TEXT with extra classes */
export function vCardText(...extra: (string | undefined)[]): string {
  return [V_CARD_TEXT, ...extra.filter(Boolean)].join(' ')
}

/** Combines V_CARD_TITLE with extra classes */
export function vCardTitle(...extra: (string | undefined)[]): string {
  return [V_CARD_TITLE, ...extra.filter(Boolean)].join(' ')
}

export const V_BTN =
  'v-btn v-btn--elevated v-theme--myCustomLightTheme v-btn--density-default v-btn--size-default v-btn--variant-elevated'

/** Combines V_BTN with extra classes */
export function vBtn(...extra: (string | undefined)[]): string {
  return [V_BTN, ...extra.filter(Boolean)].join(' ')
}
