/**
 * Type declarations for markdown-it plugins that lack @types packages.
 * These plugins export functions compatible with markdown-it's .use() API.
 */
declare module 'markdown-it-emoji' {
  export const full: (md: import('markdown-it').default) => void
}

declare module 'markdown-it-footnote'

declare module 'markdown-it-sub'

declare module 'markdown-it-sup'

declare module 'markdown-it-ins'

declare module 'markdown-it-mark'

declare module 'markdown-it-abbr'

declare module 'markdown-it-attrs'

declare module 'markdown-it-task-checkbox'

declare module 'markdown-it-container' {
  import type { PluginWithParams } from 'markdown-it'
  const container: PluginWithParams
  export default container
}

declare module 'markdown-it-anchor'
