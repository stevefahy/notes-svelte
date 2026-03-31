/**
 * Collect fenced code language tags from markdown (```lang).
 */
export function collectFenceLanguages(markdown: string): string[] {
  const re = /^```([\w+-]*)\s*$/gm;
  const seen = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = re.exec(markdown)) !== null) {
    const lang = m[1]?.trim().toLowerCase();
    if (lang) seen.add(lang);
  }
  return [...seen];
}

/** Map fence label -> prism component grammar name (filename prism-{name}.js). */
const LANG_ALIASES: Record<string, string> = {
  md: "markdown",
  js: "javascript",
  ts: "typescript",
  py: "python",
  sh: "bash",
  shell: "bash",
  zsh: "bash",
  yml: "yaml",
  rust: "rust",
  rs: "rust",
  go: "go",
  golang: "go",
  rb: "ruby",
  ruby: "ruby",
  java: "java",
  kt: "kotlin",
  kotlin: "kotlin",
  swift: "swift",
  php: "php",
  sql: "sql",
  html: "markup",
  xml: "markup",
  svg: "markup",
  vue: "markup",
  wasm: "wasm",
  json: "json",
  jsonc: "json",
  toml: "toml",
  dockerfile: "docker",
  docker: "docker",
  bash: "bash",
  ps1: "powershell",
  powershell: "powershell",
  cpp: "cpp",
  "c++": "cpp",
  cxx: "cpp",
  cs: "csharp",
  csharp: "csharp",
  fs: "fsharp",
  scala: "scala",
  r: "r",
  dart: "dart",
  lua: "lua",
  perl: "perl",
  nginx: "nginx",
  graphql: "graphql",
  diff: "diff",
  http: "http",
};

/** Prefer loading these before others when multiple langs appear (dependency-ish ordering). */
const LOAD_PRIORITY: Record<string, number> = {
  javascript: 0,
  css: 1,
  markup: 2,
  markdown: 3,
  jsx: 4,
  typescript: 5,
  tsx: 6,
};

const prismModulesRaw = import.meta.glob(
  "../../node_modules/prismjs/components/prism-*.js",
) as Record<string, () => Promise<unknown>>;

/** Exclude `*.min.js` so each grammar resolves to one chunk. */
const prismModules = Object.fromEntries(
  Object.entries(prismModulesRaw).filter(([path]) => !path.includes(".min.")),
) as Record<string, () => Promise<unknown>>;

function loaderForGrammar(grammar: string): (() => Promise<unknown>) | undefined {
  const needle = `prism-${grammar}.js`;
  for (const path of Object.keys(prismModules)) {
    if (path.endsWith(needle)) return prismModules[path];
  }
  return undefined;
}

const loadedGrammars = new Set<string>();

function resolveGrammar(lang: string): string {
  return LANG_ALIASES[lang] ?? lang;
}

/**
 * Dynamic-import Prism grammar components for languages present in markdown.
 * Safe to call before md.render; no-op for unknown langs.
 */
export async function ensurePrismLanguagesForMarkdown(
  markdown: string,
): Promise<void> {
  const raw = collectFenceLanguages(markdown);
  const grammars = [...new Set(raw.map(resolveGrammar))].sort((a, b) => {
    const pa = LOAD_PRIORITY[a] ?? 100;
    const pb = LOAD_PRIORITY[b] ?? 100;
    if (pa !== pb) return pa - pb;
    return a.localeCompare(b);
  });

  for (const g of grammars) {
    if (loadedGrammars.has(g)) continue;
    const load = loaderForGrammar(g);
    if (!load) continue;
    try {
      await load();
      loadedGrammars.add(g);
    } catch {
      /* grammar chunk missing or load error — fall back to plain code in highlight */
    }
  }
}
