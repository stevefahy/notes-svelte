import { describe, it, expect } from "vitest";
import { collectFenceLanguages } from "./prismLazy";

describe("collectFenceLanguages", () => {
  it("returns distinct langs from fenced blocks", () => {
    const md = "```js\na\n```\n\n```ts\nb\n```\n```js\nc\n```";
    expect(collectFenceLanguages(md).sort()).toEqual(["js", "ts"]);
  });

  it("ignores fences with no language", () => {
    expect(collectFenceLanguages("```\nplain\n```")).toEqual([]);
  });

  it("normalizes to lowercase", () => {
    expect(collectFenceLanguages("```Python\nx\n```")).toEqual(["python"]);
  });
});
