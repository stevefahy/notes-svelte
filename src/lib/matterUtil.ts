import fm from "front-matter";
import yaml from "js-yaml";

function matter(input: string): {
  content: string;
  data: Record<string, unknown>;
} {
  const parsed = fm(input);
  return {
    content: parsed.body,
    data: parsed.attributes as Record<string, unknown>,
  };
}

matter.stringify = function stringify(
  content: string,
  data?: Record<string, unknown>,
): string {
  if (!data || Object.keys(data).length === 0) return content;
  return `---\n${yaml.dump(data, { lineWidth: -1 }).trim()}\n---\n${content}`;
};

export { matter };
