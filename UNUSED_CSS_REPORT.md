# Unused CSS Audit Report

Generated: 2026-02-19T13:03:04.951Z

## Summary

- **CSS files processed:** 8
- **Unused selectors found:** 70

### Per-file breakdown

- `index-fi9NzBlx.css`: 64 unused selector(s)
- `NotebooksPage-Di8YjF_h.css`: 6 unused selector(s)

## Unused selectors by file

### index-fi9NzBlx.css

- `.basic`
- `.delete_md`
- `.delete_md:before`
- `.editting`
- `.footnotes ol li`
- `.footnotes-list`
- `.highlightRoot`
- `.hljs-title.class_`
- `.icon_no_margin`
- `.icon_rotate_90`
- `.inlineCode`
- `.large`
- `.link_disabled`
- `.main-navigation_header_container`
- `.material-symbol-size`
- `.material-symbols.md-18`
- `.material-symbols.md-24`
- `.material-symbols.md-36`
- `.material-symbols.md-48`
- `.namespace`
- `.notebook_cover_blue`
- `.notebook_cover_default`
- `.notebook_cover_green`
- `.notebook_cover_red`
- `.page_scrollable_header_breadcrumb_list`
- `.post-it`
- `.post-it li`
- `.post-it:after`
- `.post-it:before`
- `.split_screen_button`
- `.split_screen_icon`
- `.v-btn--block`
- `.v-btn__overlay`
- `.v-btn__underlay`
- `.v-card--variant-flat`
- `.v-dialog>.v-overlay__content>.v-card`
- `.v-dialog>.v-overlay__content>.v-card>.v-card-text`
- `.v-dialog>.v-overlay__content>.v-sheet`
- `.v-dialog>.v-overlay__content>form>.v-card`
- `.v-dialog>.v-overlay__content>form>.v-card>.v-card-text`
- `.v-dialog>.v-overlay__content>form>.v-sheet`
- `.v-list-item__prepend>.v-badge~.v-list-item__spacer`
- `.v-list-item__prepend>.v-icon~.v-list-item__spacer`
- `.v-list-item__prepend>.v-tooltip~.v-list-item__spacer`
- `.v-overlay__content`
- `.v-overlay__content.v-snackbar__wrapper.v-theme--myCustomLightTheme.v-snackbar--variant-elevated`
- `.v-overlay__scrim`
- `.v-skeleton-loader__list-item`
- `.v-snackbar__content`
- `.v-snackbar__wrapper`
- `.viewnote_content ol`
- `blockquote`
- `blockquote:before`
- `body .m-3`
- `h1`
- `h4`
- `h5`
- `h6`
- `hr`
- `ins`
- `ins:before`
- `mark`
- `mark p`
- `textarea`

### NotebooksPage-Di8YjF_h.css

- `.notebook_default`
- `.tab_blue`
- `.tab_default`
- `.tab_green`
- `.tab_loading`
- `.tab_red`

## False-positive candidates

These patterns are used at runtime and should be safelisted if reported as unused:

| Pattern | Source | Reason |
| ------- | ------ | ------ |
| `table`, `table-striped` | markdown.ts | md.renderer.rules.table_open |
| `image` | markdown.ts | Image wrapper span |
| `hljs`, `hljs-*` | markdown.ts | highlight.js output |
| `language-*` | Possible markdown code blocks | If Prism/lang classes are used |
| Vuetify-style classes | bits-ui, components | .v-btn, .v-theme--*, etc. |
| `svelte-*` | Svelte components | Scoped class hashes (safelisted via greedy) |

If any of the above appear in the unused list, add them to `safelist` in purgecss.config.js and re-run.

## Obvious removals

- **veutify.min.css**: Never imported; safe to delete or exclude from future audits.
- **breadcrumb_shared.scss**: Contains commented-out CSS blocks that can be removed manually.

---

*Use this report as a prompt to fix unused CSS: for each file above, remove the listed selectors/rules. Keep safelist recommendations for dynamic classes.*