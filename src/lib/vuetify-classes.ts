// Vuetify-style class names for Svelte (matches Vue/Vuetify structure)

export const V_CARD =
  "v-card v-theme--myCustomLightTheme v-card--density-default v-card--variant-elevated";

export const V_CARD_TEXT = "v-card-text";

export const V_CARD_TITLE = "v-card-title";

/** Combines V_CARD with extra classes */
export function vCard(...extra: (string | undefined)[]): string {
  return [V_CARD, ...extra.filter(Boolean)].join(" ");
}

/** Combines V_CARD_TEXT with extra classes */
export function vCardText(...extra: (string | undefined)[]): string {
  return [V_CARD_TEXT, ...extra.filter(Boolean)].join(" ");
}

/** Combines V_CARD_TITLE with extra classes */
export function vCardTitle(...extra: (string | undefined)[]): string {
  return [V_CARD_TITLE, ...extra.filter(Boolean)].join(" ");
}
