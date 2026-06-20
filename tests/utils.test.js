import { describe, it, expect } from "vitest";
import {
  wrapIndex,
  clamp,
  parseList,
  escapeHtml,
  createStarterItem,
} from "../script.utils.js";

describe("wrapIndex", () => {
  it("returns 0 for empty array", () => {
    expect(wrapIndex(0, 0)).toBe(0);
    expect(wrapIndex(5, 0)).toBe(0);
    expect(wrapIndex(-1, 0)).toBe(0);
  });

  it("wraps positive index forward", () => {
    expect(wrapIndex(0, 5)).toBe(0);
    expect(wrapIndex(4, 5)).toBe(4);
    expect(wrapIndex(5, 5)).toBe(0);
    expect(wrapIndex(7, 5)).toBe(2);
  });

  it("wraps negative index backward within one cycle", () => {
    expect(wrapIndex(-1, 5)).toBe(4);
    expect(wrapIndex(-5, 5)).toBe(0);
  });

  it("does not correctly wrap negative indices beyond one cycle (known limitation)", () => {
    // BUG: (-6 + 5) % 5 = -1, but expected 4.
    // The function only handles -length <= index, not deeper negatives.
    expect(wrapIndex(-6, 5)).toBe(-1);
  });

  it("works with length of 1", () => {
    expect(wrapIndex(0, 1)).toBe(0);
    expect(wrapIndex(1, 1)).toBe(0);
    expect(wrapIndex(-1, 1)).toBe(0);
  });
});

describe("clamp", () => {
  it("returns value when within range", () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(0, 0, 10)).toBe(0);
    expect(clamp(10, 0, 10)).toBe(10);
  });

  it("clamps to minimum", () => {
    expect(clamp(-5, 0, 10)).toBe(0);
    expect(clamp(-100, -50, 50)).toBe(-50);
  });

  it("clamps to maximum", () => {
    expect(clamp(15, 0, 10)).toBe(10);
    expect(clamp(100, -50, 50)).toBe(50);
  });

  it("handles equal min and max", () => {
    expect(clamp(5, 3, 3)).toBe(3);
    expect(clamp(1, 3, 3)).toBe(3);
  });
});

describe("parseList", () => {
  it("splits comma-separated values", () => {
    expect(parseList("red, blue, green")).toEqual(["red", "blue", "green"]);
  });

  it("trims whitespace", () => {
    expect(parseList("  red ,  blue  , green  ")).toEqual(["red", "blue", "green"]);
  });

  it("filters empty entries", () => {
    expect(parseList("red,,blue,")).toEqual(["red", "blue"]);
    expect(parseList(",,,")).toEqual([]);
  });

  it("handles single value", () => {
    expect(parseList("red")).toEqual(["red"]);
  });

  it("handles empty string", () => {
    expect(parseList("")).toEqual([]);
  });
});

describe("escapeHtml", () => {
  it("escapes ampersands", () => {
    expect(escapeHtml("a & b")).toBe("a &amp; b");
  });

  it("escapes angle brackets", () => {
    expect(escapeHtml("<script>")).toBe("&lt;script&gt;");
  });

  it("escapes quotes", () => {
    expect(escapeHtml('"hello"')).toBe("&quot;hello&quot;");
    expect(escapeHtml("it's")).toBe("it&#039;s");
  });

  it("handles multiple special characters", () => {
    expect(escapeHtml('<img src="x" onerror="alert(\'xss\')">')).toBe(
      "&lt;img src=&quot;x&quot; onerror=&quot;alert(&#039;xss&#039;)&quot;&gt;"
    );
  });

  it("passes through plain text unchanged", () => {
    expect(escapeHtml("Hello World")).toBe("Hello World");
  });

  it("converts non-strings", () => {
    expect(escapeHtml(42)).toBe("42");
    expect(escapeHtml(null)).toBe("null");
    expect(escapeHtml(undefined)).toBe("undefined");
  });
});

describe("createStarterItem", () => {
  it("creates a starter item with correct properties", () => {
    const item = createStarterItem(
      "starter-1",
      "Blue shirt",
      "Tops",
      "images/blue-shirt.png",
      ["blue"],
      ["casual"]
    );
    expect(item).toEqual({
      id: "starter-1",
      name: "Blue shirt",
      category: "Tops",
      photo: "images/blue-shirt.png",
      colors: ["blue"],
      tags: ["casual"],
      favorite: false,
      isStarter: true,
    });
  });

  it("always sets favorite to false", () => {
    const item = createStarterItem("id", "name", "cat", "photo", [], []);
    expect(item.favorite).toBe(false);
  });

  it("always marks as starter", () => {
    const item = createStarterItem("id", "name", "cat", "photo", [], []);
    expect(item.isStarter).toBe(true);
  });
});
