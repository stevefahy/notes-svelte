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
  safelist: [
    // Dynamic classes from markdown rendering (markdown.ts)
    'table',
    'table-striped',
    'image',
    /^hljs-/, // highlight.js syntax classes
    /^language-/, // Prism/lang prefix (if any markdown uses it)
    // bits-ui / component lib classes if needed
  ],
  skippedContentGlobs: ['node_modules/**'],
};
