import { describe, it, expect } from "vitest";
import { scoreItem, pickBalancedPieces } from "../script.utils.js";

function makeItem(overrides) {
  return {
    id: "item-1",
    name: "Test item",
    category: "Tops",
    colors: [],
    tags: [],
    favorite: false,
    ...overrides,
  };
}

describe("scoreItem", () => {
  it("scores 0 for no matching words", () => {
    const item = makeItem({ name: "Blue shirt", colors: ["blue"], tags: ["casual"] });
    expect(scoreItem(item, ["red", "formal"])).toBe(0);
  });

  it("scores 2 per matching word", () => {
    const item = makeItem({ name: "Blue shirt", colors: ["blue"], tags: ["casual"] });
    expect(scoreItem(item, ["blue"])).toBe(2);
    expect(scoreItem(item, ["blue", "casual"])).toBe(4);
  });

  it("matches against item name", () => {
    const item = makeItem({ name: "Summer dress" });
    expect(scoreItem(item, ["summer"])).toBe(2);
    expect(scoreItem(item, ["dress"])).toBe(2);
  });

  it("matches against category", () => {
    const item = makeItem({ category: "Dresses" });
    expect(scoreItem(item, ["dresses"])).toBe(2);
  });

  it("matches against colors", () => {
    const item = makeItem({ colors: ["navy", "white"] });
    expect(scoreItem(item, ["navy"])).toBe(2);
    expect(scoreItem(item, ["white"])).toBe(2);
  });

  it("matches against tags", () => {
    const item = makeItem({ tags: ["casual", "summer", "beach"] });
    expect(scoreItem(item, ["beach"])).toBe(2);
  });

  it("is case-insensitive", () => {
    const item = makeItem({ name: "BLUE SHIRT", tags: ["Casual"] });
    expect(scoreItem(item, ["blue"])).toBe(2);
    expect(scoreItem(item, ["casual"])).toBe(2);
  });

  it("scores partial word matches", () => {
    const item = makeItem({ tags: ["streetwear"] });
    expect(scoreItem(item, ["street"])).toBe(2);
  });

  it("returns 0 for empty words array", () => {
    const item = makeItem({ name: "Blue shirt" });
    expect(scoreItem(item, [])).toBe(0);
  });
});

describe("pickBalancedPieces", () => {
  it("picks one item per category", () => {
    const scoredItems = [
      { item: makeItem({ id: "1", category: "Tops" }), score: 4 },
      { item: makeItem({ id: "2", category: "Bottoms" }), score: 3 },
      { item: makeItem({ id: "3", category: "Shoes" }), score: 2 },
      { item: makeItem({ id: "4", category: "Tops" }), score: 1 },
    ];
    const result = pickBalancedPieces(scoredItems);
    expect(result).toHaveLength(3);
    expect(result.map((i) => i.category)).toEqual(["Tops", "Bottoms", "Shoes"]);
  });

  it("limits to 4 pieces maximum", () => {
    const scoredItems = [
      { item: makeItem({ id: "1", category: "Dresses" }), score: 5 },
      { item: makeItem({ id: "2", category: "Tops" }), score: 4 },
      { item: makeItem({ id: "3", category: "Bottoms" }), score: 3 },
      { item: makeItem({ id: "4", category: "Shoes" }), score: 2 },
      { item: makeItem({ id: "5", category: "Accessories" }), score: 1 },
    ];
    const result = pickBalancedPieces(scoredItems);
    expect(result).toHaveLength(4);
  });

  it("returns empty array when no items match", () => {
    expect(pickBalancedPieces([])).toEqual([]);
  });

  it("picks first match per category (highest scored since input is pre-sorted)", () => {
    const scoredItems = [
      { item: makeItem({ id: "1", category: "Tops", name: "Top A" }), score: 6 },
      { item: makeItem({ id: "2", category: "Tops", name: "Top B" }), score: 4 },
      { item: makeItem({ id: "3", category: "Bottoms" }), score: 2 },
    ];
    const result = pickBalancedPieces(scoredItems);
    expect(result[0].name).toBe("Top A");
  });

  it("does not duplicate items across categories", () => {
    const sharedItem = makeItem({ id: "1", category: "Tops" });
    const scoredItems = [
      { item: sharedItem, score: 5 },
      { item: makeItem({ id: "2", category: "Bottoms" }), score: 3 },
    ];
    const result = pickBalancedPieces(scoredItems);
    const ids = result.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("respects category priority order", () => {
    const scoredItems = [
      { item: makeItem({ id: "1", category: "Accessories" }), score: 10 },
      { item: makeItem({ id: "2", category: "Dresses" }), score: 10 },
      { item: makeItem({ id: "3", category: "Tops" }), score: 10 },
      { item: makeItem({ id: "4", category: "Bottoms" }), score: 10 },
      { item: makeItem({ id: "5", category: "Shoes" }), score: 10 },
    ];
    const result = pickBalancedPieces(scoredItems);
    expect(result.map((i) => i.category)).toEqual(["Dresses", "Tops", "Bottoms", "Shoes"]);
  });
});
