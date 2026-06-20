export function wrapIndex(index, length) {
  if (length === 0) {
    return 0;
  }
  return (index + length) % length;
}

export function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum);
}

export function parseList(value) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function createStarterItem(id, name, category, photo, colors, tags) {
  return {
    id,
    name,
    category,
    photo,
    colors,
    tags,
    favorite: false,
    isStarter: true,
  };
}

export function scoreItem(item, words) {
  const searchableText = [
    item.name,
    item.category,
    ...item.colors,
    ...item.tags,
  ]
    .join(" ")
    .toLowerCase();

  return words.reduce((score, word) => {
    return searchableText.includes(word) ? score + 2 : score;
  }, 0);
}

export function pickBalancedPieces(scoredItems) {
  const categories = ["Dresses", "Tops", "Bottoms", "Shoes", "Accessories", "Full Outfits", "Swimsuit", "PJs"];
  const picks = [];

  categories.forEach((category) => {
    const match = scoredItems.find(({ item }) => item.category === category && !picks.includes(item));
    if (match) {
      picks.push(match.item);
    }
  });

  return picks.slice(0, 4);
}

export function readStorage(storage, key) {
  try {
    return JSON.parse(storage.getItem(key)) || [];
  } catch {
    return [];
  }
}

export function getVisibleItems(allItems, laundryItems, activeCategory, searchTerm, topCategories) {
  return allItems.filter((item) => {
    if (laundryItems.includes(item.id)) return false;
    const matchesCategory =
      activeCategory === "All" ||
      item.category === activeCategory ||
      (activeCategory === "Tops" && topCategories.includes(item.category));
    const searchableText = [
      item.name,
      item.category,
      ...item.colors,
      ...item.tags,
    ]
      .join(" ")
      .toLowerCase();
    const matchesSearch = searchableText.includes(searchTerm);
    return matchesCategory && matchesSearch;
  });
}

export function getAllClosetItems(wardrobeItems, starterWardrobeItems, hiddenStarterItemIds) {
  const visibleStarterItems = starterWardrobeItems.filter(
    (item) => !hiddenStarterItemIds.includes(item.id),
  );
  return [...wardrobeItems, ...visibleStarterItems];
}

export function buildExportData(wardrobeItems, savedOutfits, hiddenStarterItemIds, trashedItems, savedCollages, vibeTabs) {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    data: {
      items: wardrobeItems,
      savedOutfits,
      hiddenStarterItemIds,
      trashedItems,
      savedCollages,
      vibeTabs,
    },
  };
}

export function validateImportData(backup) {
  const data = backup?.data;
  const requiredLists = [
    data?.items,
    data?.savedOutfits,
    data?.hiddenStarterItemIds,
    data?.trashedItems,
    data?.savedCollages,
  ];
  return data && requiredLists.every((list) => Array.isArray(list));
}
