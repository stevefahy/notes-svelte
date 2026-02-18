/** @type {import('purgecss').UserDefinedOptions} */
export default {
  content: [
    'index.html',
    'src/**/*.svelte',
    'src/**/*.ts',
    'src/**/*.js',
  ],
  css: ['dist/assets/*.css'],
  rejected: true,
  rejectedCss: true,
  safelist: {
    standard: [
      'table',
      'table-striped',
      'image',
      /^hljs-/,
      /^language-/,
    ],
    // Keep all Svelte scoped component styles (.svelte-xxxxx)
    // Keep table compounds (markdown.ts renders tables with .table, .table-striped)
    greedy: [/^svelte-/, /^table/, /table-striped/],
  },
  skippedContentGlobs: ['node_modules/**'],
};
