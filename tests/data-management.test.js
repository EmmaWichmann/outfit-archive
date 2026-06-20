import { describe, it, expect, beforeEach } from "vitest";
import {
  readStorage,
  getAllClosetItems,
  getVisibleItems,
  buildExportData,
  validateImportData,
} from "../script.utils.js";

describe("readStorage", () => {
  let storage;

  beforeEach(() => {
    storage = {
      store: {},
      getItem(key) { return this.store[key] ?? null; },
      setItem(key, value) { this.store[key] = value; },
    };
  });

  it("returns parsed array from storage", () => {
    storage.setItem("key", JSON.stringify(["a", "b"]));
    expect(readStorage(storage, "key")).toEqual(["a", "b"]);
  });

  it("returns empty array when key does not exist", () => {
    expect(readStorage(storage, "missing")).toEqual([]);
  });

  it("returns empty array for null value", () => {
    storage.setItem("key", null);
    expect(readStorage(storage, "key")).toEqual([]);
  });

  it("returns empty array for invalid JSON", () => {
    storage.store["key"] = "not valid json{{{";
    expect(readStorage(storage, "key")).toEqual([]);
  });

  it("returns non-array parsed values as-is (known gap: no type check)", () => {
    // BUG: readStorage uses `|| []` which only catches falsy values.
    // A stored string like "string value" is truthy, so it's returned as-is.
    storage.setItem("key", JSON.stringify("string value"));
    expect(readStorage(storage, "key")).toBe("string value");
  });

  it("handles complex objects in arrays", () => {
    const items = [{ id: "1", name: "Item" }];
    storage.setItem("key", JSON.stringify(items));
    expect(readStorage(storage, "key")).toEqual(items);
  });
});

describe("getAllClosetItems", () => {
  it("combines wardrobe and visible starter items", () => {
    const wardrobe = [{ id: "w1", name: "My item" }];
    const starters = [
      { id: "s1", name: "Starter 1" },
      { id: "s2", name: "Starter 2" },
    ];
    const hidden = ["s2"];
    const result = getAllClosetItems(wardrobe, starters, hidden);
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe("w1");
    expect(result[1].id).toBe("s1");
  });

  it("returns only wardrobe items when all starters hidden", () => {
    const wardrobe = [{ id: "w1" }];
    const starters = [{ id: "s1" }, { id: "s2" }];
    const result = getAllClosetItems(wardrobe, starters, ["s1", "s2"]);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("w1");
  });

  it("returns only starters when wardrobe is empty", () => {
    const starters = [{ id: "s1" }, { id: "s2" }];
    const result = getAllClosetItems([], starters, []);
    expect(result).toHaveLength(2);
  });

  it("returns empty array when both are empty", () => {
    expect(getAllClosetItems([], [], [])).toEqual([]);
  });

  it("places wardrobe items before starter items", () => {
    const wardrobe = [{ id: "w1" }];
    const starters = [{ id: "s1" }];
    const result = getAllClosetItems(wardrobe, starters, []);
    expect(result[0].id).toBe("w1");
    expect(result[1].id).toBe("s1");
  });
});

describe("getVisibleItems", () => {
  const topCategories = ["Tops", "Short Sleeve Tops", "Long Sleeve Tops"];

  const items = [
    { id: "1", name: "Blue shirt", category: "Short Sleeve Tops", colors: ["blue"], tags: ["casual"] },
    { id: "2", name: "Red dress", category: "Dresses", colors: ["red"], tags: ["dressy"] },
    { id: "3", name: "Black pants", category: "Bottoms", colors: ["black"], tags: ["work"] },
    { id: "4", name: "White sneakers", category: "Shoes", colors: ["white"], tags: ["casual"] },
  ];

  it("returns all items when category is All and no search", () => {
    const result = getVisibleItems(items, [], "All", "", topCategories);
    expect(result).toHaveLength(4);
  });

  it("filters by exact category", () => {
    const result = getVisibleItems(items, [], "Dresses", "", topCategories);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Red dress");
  });

  it("groups top categories under Tops filter", () => {
    const result = getVisibleItems(items, [], "Tops", "", topCategories);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Blue shirt");
  });

  it("filters by search term in name", () => {
    const result = getVisibleItems(items, [], "All", "dress", topCategories);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Red dress");
  });

  it("filters by search term in colors", () => {
    const result = getVisibleItems(items, [], "All", "blue", topCategories);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Blue shirt");
  });

  it("filters by search term in tags", () => {
    const result = getVisibleItems(items, [], "All", "work", topCategories);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Black pants");
  });

  it("combines category and search filters", () => {
    const result = getVisibleItems(items, [], "Tops", "blue", topCategories);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Blue shirt");
  });

  it("excludes items in laundry", () => {
    const result = getVisibleItems(items, ["1", "3"], "All", "", topCategories);
    expect(result).toHaveLength(2);
    expect(result.map((i) => i.id)).toEqual(["2", "4"]);
  });

  it("expects search term to already be lowercased (caller responsibility)", () => {
    // The original code lowercases searchTerm in the event handler before
    // passing it to getVisibleItems. Uppercase input won't match.
    const upper = getVisibleItems(items, [], "All", "BLUE", topCategories);
    expect(upper).toHaveLength(0);
    const lower = getVisibleItems(items, [], "All", "blue", topCategories);
    expect(lower).toHaveLength(1);
  });

  it("returns empty when nothing matches", () => {
    const result = getVisibleItems(items, [], "All", "nonexistent", topCategories);
    expect(result).toHaveLength(0);
  });
});

describe("buildExportData", () => {
  it("creates export object with version and data", () => {
    const result = buildExportData(
      [{ id: "1" }],
      [{ id: "outfit-1" }],
      ["s1"],
      [{ id: "t1" }],
      [{ id: "c1" }],
      [{ id: "v1" }]
    );
    expect(result.version).toBe(1);
    expect(result.exportedAt).toBeTruthy();
    expect(result.data.items).toEqual([{ id: "1" }]);
    expect(result.data.savedOutfits).toEqual([{ id: "outfit-1" }]);
    expect(result.data.hiddenStarterItemIds).toEqual(["s1"]);
    expect(result.data.trashedItems).toEqual([{ id: "t1" }]);
    expect(result.data.savedCollages).toEqual([{ id: "c1" }]);
    expect(result.data.vibeTabs).toEqual([{ id: "v1" }]);
  });

  it("includes ISO timestamp", () => {
    const result = buildExportData([], [], [], [], [], []);
    expect(result.exportedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});

describe("validateImportData", () => {
  it("accepts valid backup data", () => {
    const backup = {
      data: {
        items: [],
        savedOutfits: [],
        hiddenStarterItemIds: [],
        trashedItems: [],
        savedCollages: [],
      },
    };
    expect(validateImportData(backup)).toBe(true);
  });

  it("rejects missing data property", () => {
    expect(validateImportData({})).toBeFalsy();
    expect(validateImportData(null)).toBeFalsy();
    expect(validateImportData(undefined)).toBeFalsy();
  });

  it("rejects when required arrays are missing", () => {
    expect(validateImportData({ data: { items: [] } })).toBe(false);
  });

  it("rejects when required properties are not arrays", () => {
    const backup = {
      data: {
        items: "not an array",
        savedOutfits: [],
        hiddenStarterItemIds: [],
        trashedItems: [],
        savedCollages: [],
      },
    };
    expect(validateImportData(backup)).toBe(false);
  });

  it("accepts data with extra properties", () => {
    const backup = {
      version: 1,
      data: {
        items: [],
        savedOutfits: [],
        hiddenStarterItemIds: [],
        trashedItems: [],
        savedCollages: [],
        vibeTabs: [],
        extraField: "ok",
      },
    };
    expect(validateImportData(backup)).toBe(true);
  });
});
