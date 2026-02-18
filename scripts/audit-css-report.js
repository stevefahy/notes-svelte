/**
 * Generates UNUSED_CSS_REPORT.md by running PurgeCSS against the built CSS.
 * Run: npm run audit:css (builds first, then generates report)
 * Cwd must be project root (set by npm run).
 */
import { PurgeCSS } from 'purgecss';
import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');

const config = {
  content: ['index.html', 'src/**/*.svelte', 'src/**/*.ts', 'src/**/*.js'],
  css: ['dist/assets/*.css'],
  rejected: true,
  rejectedCss: true,
  safelist: [
    'table',
    'table-striped',
    'image',
    /^hljs-/,
    /^language-/,
  ],
  skippedContentGlobs: ['node_modules/**'],
};

function buildReport(results) {
  const lines = [];
  lines.push('# Unused CSS Audit Report');
  lines.push('');
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push('');

  let totalRejected = 0;
  const fileSections = [];

  for (const result of results) {
    const rejected = result.rejected || [];
    totalRejected += rejected.length;
    const fileName = result.file?.split(/[/\\]/).pop() || 'unknown';

    if (rejected.length > 0) {
      fileSections.push({
        file: fileName,
        fullPath: result.file,
        count: rejected.length,
        selectors: rejected,
      });
    }
  }

  // Summary
  lines.push('## Summary');
  lines.push('');
  lines.push(`- **CSS files processed:** ${results.length}`);
  lines.push(`- **Unused selectors found:** ${totalRejected}`);
  lines.push('');
  lines.push('### Per-file breakdown');
  lines.push('');
  if (fileSections.length === 0) {
    lines.push('No unused selectors detected.');
  } else {
    for (const { file, count } of fileSections) {
      lines.push(`- \`${file}\`: ${count} unused selector(s)`);
    }
  }
  lines.push('');

  // Unused selectors by file
  lines.push('## Unused selectors by file');
  lines.push('');
  for (const { file, selectors } of fileSections) {
    lines.push(`### ${file}`);
    lines.push('');
    const sorted = [...selectors].sort();
    for (const sel of sorted) {
      lines.push(`- \`${sel}\``);
    }
    lines.push('');
  }

  // False-positive candidates
  lines.push('## False-positive candidates');
  lines.push('');
  lines.push('These patterns are used at runtime and should be safelisted if reported as unused:');
  lines.push('');
  lines.push('| Pattern | Source | Reason |');
  lines.push('| ------- | ------ | ------ |');
  lines.push('| `table`, `table-striped` | markdown.ts | md.renderer.rules.table_open |');
  lines.push('| `image` | markdown.ts | Image wrapper span |');
  lines.push('| `hljs`, `hljs-*` | markdown.ts | highlight.js output |');
  lines.push('| `language-*` | Possible markdown code blocks | If Prism/lang classes are used |');
  lines.push('| Vuetify-style classes | bits-ui, components | .v-btn, .v-theme--*, etc. |');
  lines.push('');
  lines.push(
    'If any of the above appear in the unused list, add them to `safelist` in purgecss.config.js and re-run.'
  );
  lines.push('');

  // Obvious removals
  lines.push('## Obvious removals');
  lines.push('');
  lines.push('- **veutify.min.css**: Never imported; safe to delete or exclude from future audits.');
  lines.push(
    '- **breadcrumb_shared.scss**: Contains commented-out CSS blocks that can be removed manually.'
  );
  lines.push('');
  lines.push(
    '---'
  );
  lines.push('');
  lines.push(
    '*Use this report as a prompt to fix unused CSS: for each file above, remove the listed selectors/rules. Keep safelist recommendations for dynamic classes.*'
  );

  return lines.join('\n');
}

async function main() {
  try {
    const purgeCSS = new PurgeCSS();
    const results = await purgeCSS.purge(config);

    const report = buildReport(results);
    const reportPath = resolve(projectRoot, 'UNUSED_CSS_REPORT.md');
    writeFileSync(reportPath, report, 'utf-8');

    console.log(`Report written to ${reportPath}`);
  } catch (err) {
    console.error('Audit failed:', err.message);
    process.exit(1);
  }
}

main();
