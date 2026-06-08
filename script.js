/*
  Outfit Archive
  This file makes the wardrobe interactive.

  Beginner map:
  - HTML creates the sections and buttons.
  - CSS makes the app look editorial and polished.
  - JavaScript listens for user actions, updates the page, and saves private
    wardrobe data in localStorage.
*/

const storageKey = "outfit-archive-items";
const outfitsKey = "outfit-archive-saved-outfits";

const navButtons = document.querySelectorAll("[data-view-target]");
const sections = document.querySelectorAll("[data-view]");
const openDialogButton = document.getElementById("open-item-dialog");
const emptyAddButton = document.querySelector("[data-open-dialog]");
const closeDialogButton = document.getElementById("close-item-dialog");
const itemDialog = document.getElementById("item-dialog");
const itemForm = document.getElementById("item-form");
const itemPhotoInput = document.getElementById("item-photo");
const photoPreview = document.getElementById("photo-preview");
const uploadMessage = document.getElementById("upload-message");
const closetGrid = document.getElementById("closet-grid");
const closetEmpty = document.getElementById("closet-empty");
const itemTemplate = document.getElementById("item-card-template");
const categoryFilters = document.getElementById("category-filters");
const searchInput = document.getElementById("search-input");
const trayItems = document.getElementById("tray-items");
const outfitCanvas = document.getElementById("outfit-canvas");
const saveOutfitForm = document.getElementById("save-outfit-form");
const outfitNameInput = document.getElementById("outfit-name");
const suggestionForm = document.getElementById("suggestion-form");
const occasionInput = document.getElementById("occasion-input");
const suggestionResults = document.getElementById("suggestion-results");
const itemCount = document.getElementById("item-count");
const outfitCount = document.getElementById("outfit-count");
const favoriteCount = document.getElementById("favorite-count");
const practiceTopImage = document.getElementById("practice-top-image");
const practiceTopName = document.getElementById("practice-top-name");
const practiceBottomImage = document.getElementById("practice-bottom-image");
const practiceBottomName = document.getElementById("practice-bottom-name");
const practicePieceButtons = document.querySelectorAll("[data-cycle-piece]");
const practicePresetButtons = document.querySelectorAll("[data-practice-preset]");

let wardrobeItems = readStorage(storageKey);
let savedOutfits = readStorage(outfitsKey);
let activeCategory = "All";
let searchTerm = "";
let photoData = "";
let draggedItemId = "";
let canvasPieces = [];
let canvasDragId = "";
let practiceTopIndex = 0;
let practiceBottomIndex = 0;

const practiceTops = [
  { name: "Ivory blouse", photo: "images/practice/ivory-blouse.png" },
  { name: "Rust knit top", photo: "images/practice/rust-top.png" },
];

const practiceBottoms = [
  { name: "Denim shorts", photo: "images/practice/denim-shorts.png" },
  { name: "Cream plaid skirt", photo: "images/practice/plaid-skirt.png" },
];

renderApp();
showView(getViewFromHash());

// View navigation: shows one main feature at a time.
navButtons.forEach((button) => {
  button.addEventListener("click", () => {
    showView(button.dataset.viewTarget);
  });
});

openDialogButton.addEventListener("click", openItemDialog);
emptyAddButton.addEventListener("click", openItemDialog);
closeDialogButton.addEventListener("click", closeItemDialog);

// This turns an uploaded photo into a private data URL stored in localStorage.
itemPhotoInput.addEventListener("change", () => {
  const file = itemPhotoInput.files[0];

  if (!file) {
    resetPhoto();
    return;
  }

  const allowedTypes = ["image/png", "image/jpeg", "image/webp"];
  const maximumFileSize = 4 * 1024 * 1024;

  if (!allowedTypes.includes(file.type)) {
    resetPhoto("Please choose a PNG, JPG, or WEBP image.");
    itemPhotoInput.value = "";
    return;
  }

  if (file.size > maximumFileSize) {
    resetPhoto("This image is larger than 4 MB. Resize it, then try again.");
    itemPhotoInput.value = "";
    return;
  }

  const reader = new FileReader();
  reader.addEventListener("load", () => {
    photoData = reader.result;
    photoPreview.src = photoData;
    photoPreview.hidden = false;
    uploadMessage.textContent =
      file.type === "image/png"
        ? "PNG selected. Any transparent background will stay transparent."
        : "Image ready. Use a PNG file when you need a transparent background.";
  });
  reader.addEventListener("error", () => {
    resetPhoto("That image could not be read. Please try a different file.");
  });
  reader.readAsDataURL(file);
});

itemForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = document.getElementById("item-name").value.trim();
  const category = document.getElementById("item-category").value;
  const colors = parseList(document.getElementById("item-colors").value);
  const tags = parseList(document.getElementById("item-tags").value);

  if (!name || !category || !photoData) {
    return;
  }

  const newItem = {
    id: crypto.randomUUID(),
    name,
    category,
    colors,
    tags,
    photo: photoData,
    favorite: false,
    createdAt: new Date().toISOString(),
  };

  wardrobeItems.unshift(newItem);
  saveItems();
  closeItemDialog();
  renderApp();
});

categoryFilters.addEventListener("click", (event) => {
  const button = event.target.closest("[data-category]");

  if (!button) {
    return;
  }

  activeCategory = button.dataset.category;
  categoryFilters.querySelectorAll(".filter-button").forEach((item) => {
    item.classList.toggle("active", item === button);
  });
  renderCloset();
});

searchInput.addEventListener("input", () => {
  searchTerm = searchInput.value.trim().toLowerCase();
  renderCloset();
});

closetGrid.addEventListener("click", (event) => {
  const favoriteButton = event.target.closest(".favorite-button");
  const deleteButton = event.target.closest(".delete-item");

  if (favoriteButton) {
    toggleFavorite(favoriteButton.dataset.id);
  }

  if (deleteButton) {
    deleteItem(deleteButton.dataset.id);
  }
});

trayItems.addEventListener("dragstart", (event) => {
  const piece = event.target.closest("[data-item-id]");

  if (!piece) {
    return;
  }

  draggedItemId = piece.dataset.itemId;
});

outfitCanvas.addEventListener("dragover", (event) => {
  event.preventDefault();
  outfitCanvas.classList.add("drag-over");
});

outfitCanvas.addEventListener("dragleave", () => {
  outfitCanvas.classList.remove("drag-over");
});

outfitCanvas.addEventListener("drop", (event) => {
  event.preventDefault();
  outfitCanvas.classList.remove("drag-over");

  if (canvasDragId) {
    moveCanvasPiece(canvasDragId, event);
    canvasDragId = "";
    return;
  }

  if (!draggedItemId) {
    return;
  }

  addItemToCanvas(draggedItemId, event);
  draggedItemId = "";
});

outfitCanvas.addEventListener("click", (event) => {
  const removeButton = event.target.closest("[data-remove-piece]");

  if (!removeButton) {
    return;
  }

  canvasPieces = canvasPieces.filter((piece) => piece.canvasId !== removeButton.dataset.removePiece);
  renderCanvas();
});

saveOutfitForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (canvasPieces.length === 0) {
    outfitNameInput.placeholder = "Add at least one piece first...";
    return;
  }

  const savedOutfit = {
    id: crypto.randomUUID(),
    name: outfitNameInput.value.trim(),
    pieceIds: canvasPieces.map((piece) => piece.itemId),
    favorite: false,
    createdAt: new Date().toISOString(),
  };

  savedOutfits.unshift(savedOutfit);
  localStorage.setItem(outfitsKey, JSON.stringify(savedOutfits));
  outfitNameInput.value = "";
  canvasPieces = [];
  renderApp();
  showView("closet");
});

suggestionForm.addEventListener("submit", (event) => {
  event.preventDefault();
  renderSuggestions(occasionInput.value);
});

practicePieceButtons.forEach((button) => {
  button.addEventListener("click", () => {
    cyclePracticePiece(button.dataset.cyclePiece, Number(button.dataset.direction));
  });
});

practicePresetButtons.forEach((button) => {
  button.addEventListener("click", () => {
    practiceTopIndex = Number(button.dataset.practicePreset);
    practiceBottomIndex = Number(button.dataset.practicePreset);
    renderPracticeOutfit();
  });
});

function showView(viewName) {
  const validView = [...sections].some((section) => section.dataset.view === viewName)
    ? viewName
    : "closet";

  navButtons.forEach((button) => {
    const isActive = button.dataset.viewTarget === validView;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });

  sections.forEach((section) => {
    section.hidden = section.dataset.view !== validView;
  });

  history.replaceState(null, "", `#${validView}`);
  document.getElementById("top").scrollIntoView({ behavior: "smooth" });
}

function renderApp() {
  renderStats();
  renderCloset();
  renderTray();
  renderCanvas();
}

function renderStats() {
  itemCount.textContent = wardrobeItems.length;
  outfitCount.textContent = savedOutfits.length;
  favoriteCount.textContent = wardrobeItems.filter((item) => item.favorite).length;
}

function renderCloset() {
  const visibleItems = getVisibleItems();
  closetGrid.innerHTML = "";

  visibleItems.forEach((item) => {
    closetGrid.append(createItemCard(item));
  });

  savedOutfits.forEach((outfit) => {
    if (activeCategory === "All" || activeCategory === "Full Outfits") {
      closetGrid.append(createOutfitCard(outfit));
    }
  });

  closetEmpty.hidden = closetGrid.children.length > 0;
}

function getVisibleItems() {
  return wardrobeItems.filter((item) => {
    const matchesCategory = activeCategory === "All" || item.category === activeCategory;
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

function createItemCard(item) {
  const card = itemTemplate.content.firstElementChild.cloneNode(true);
  card.dataset.itemId = item.id;

  card.querySelector(".card-image").src = item.photo;
  card.querySelector(".card-image").alt = item.name;
  card.querySelector(".card-name").textContent = item.name;
  card.querySelector(".card-category").textContent = item.category;

  const favoriteButton = card.querySelector(".favorite-button");
  favoriteButton.dataset.id = item.id;
  favoriteButton.classList.toggle("is-favorite", item.favorite);
  favoriteButton.textContent = item.favorite ? "♥" : "♡";

  const deleteButton = card.querySelector(".delete-item");
  deleteButton.dataset.id = item.id;

  const tagList = card.querySelector(".tag-list");
  [...item.colors, ...item.tags].forEach((tag) => {
    tagList.append(createTag(tag));
  });

  card.addEventListener("dragstart", () => {
    draggedItemId = item.id;
  });

  return card;
}

function createOutfitCard(outfit) {
  const article = document.createElement("article");
  article.className = "outfit-card";

  const pieces = outfit.pieceIds
    .map((id) => wardrobeItems.find((item) => item.id === id))
    .filter(Boolean);

  const images = document.createElement("div");
  images.className = "saved-outfit-images";

  pieces.forEach((piece) => {
    const image = document.createElement("img");
    image.src = piece.photo;
    image.alt = piece.name;
    images.append(image);
  });

  const body = document.createElement("div");
  body.className = "card-body";
  body.innerHTML = `
    <div class="card-heading">
      <h3 class="card-name">${escapeHtml(outfit.name)}</h3>
      <span class="card-category">Full Outfits</span>
    </div>
  `;

  article.append(images, body);
  return article;
}

function createTag(label) {
  const tag = document.createElement("span");
  tag.className = "tag";
  tag.textContent = label;
  return tag;
}

function renderTray() {
  trayItems.innerHTML = "";

  wardrobeItems.forEach((item) => {
    const piece = document.createElement("article");
    piece.className = "tray-piece";
    piece.dataset.itemId = item.id;
    piece.draggable = true;
    piece.innerHTML = `
      <img src="${item.photo}" alt="${escapeHtml(item.name)}" />
      <p>${escapeHtml(item.name)}</p>
    `;
    trayItems.append(piece);
  });
}

function addItemToCanvas(itemId, event) {
  const rect = outfitCanvas.getBoundingClientRect();
  canvasPieces.push({
    canvasId: crypto.randomUUID(),
    itemId,
    x: event.clientX - rect.left - 75,
    y: event.clientY - rect.top - 95,
  });
  renderCanvas();
}

function moveCanvasPiece(canvasId, event) {
  const rect = outfitCanvas.getBoundingClientRect();
  const piece = canvasPieces.find((item) => item.canvasId === canvasId);

  if (!piece) {
    return;
  }

  piece.x = event.clientX - rect.left - 75;
  piece.y = event.clientY - rect.top - 95;
  renderCanvas();
}

function renderCanvas() {
  const note = outfitCanvas.querySelector(".canvas-note");
  outfitCanvas.querySelectorAll(".canvas-piece").forEach((piece) => piece.remove());
  note.hidden = canvasPieces.length > 0;

  canvasPieces.forEach((piece) => {
    const item = wardrobeItems.find((entry) => entry.id === piece.itemId);

    if (!item) {
      return;
    }

    const node = document.createElement("article");
    node.className = "canvas-piece";
    node.draggable = true;
    node.style.left = `${piece.x}px`;
    node.style.top = `${piece.y}px`;
    node.innerHTML = `
      <img src="${item.photo}" alt="${escapeHtml(item.name)}" />
      <button data-remove-piece="${piece.canvasId}" type="button" aria-label="Remove ${escapeHtml(item.name)}">×</button>
    `;
    node.addEventListener("dragstart", () => {
      canvasDragId = piece.canvasId;
    });
    outfitCanvas.append(node);
  });
}

function renderSuggestions(prompt) {
  const words = prompt.toLowerCase().split(/\W+/).filter(Boolean);
  const scoredItems = wardrobeItems
    .map((item) => ({
      item,
      score: scoreItem(item, words),
    }))
    .sort((a, b) => b.score - a.score);

  const suggestion = pickBalancedPieces(scoredItems);
  suggestionResults.innerHTML = "";

  if (suggestion.length === 0) {
    suggestionResults.innerHTML = `
      <div class="empty-state compact">
        <span class="empty-monogram">AI</span>
        <h3>No suggestion yet.</h3>
        <p>Add more clothing pieces so the local suggestion tool has something to match.</p>
      </div>
    `;
    return;
  }

  const wrapper = document.createElement("article");
  wrapper.className = "suggested-look";

  const images = document.createElement("div");
  images.className = "suggestion-pieces";
  suggestion.forEach((item) => {
    const image = document.createElement("img");
    image.src = item.photo;
    image.alt = item.name;
    images.append(image);
  });

  const copy = document.createElement("div");
  copy.className = "suggestion-copy";
  copy.innerHTML = `
    <h3>Try this combination.</h3>
    <p>This suggestion matched your mood or occasion with the closest colors, tags, and categories in your archive.</p>
  `;

  wrapper.append(images, copy);
  suggestionResults.append(wrapper);
}

function scoreItem(item, words) {
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

function pickBalancedPieces(scoredItems) {
  const categories = ["Dresses", "Tops", "Bottoms", "Shoes", "Accessories", "Full Outfits"];
  const picks = [];

  categories.forEach((category) => {
    const match = scoredItems.find(({ item }) => item.category === category && !picks.includes(item));
    if (match) {
      picks.push(match.item);
    }
  });

  return picks.slice(0, 4);
}

function deleteItem(id) {
  const item = wardrobeItems.find((entry) => entry.id === id);

  if (!item || !window.confirm(`Remove "${item.name}" from your closet?`)) {
    return;
  }

  wardrobeItems = wardrobeItems.filter((item) => item.id !== id);
  canvasPieces = canvasPieces.filter((piece) => piece.itemId !== id);
  savedOutfits = savedOutfits
    .map((outfit) => ({
      ...outfit,
      pieceIds: outfit.pieceIds.filter((pieceId) => pieceId !== id),
    }))
    .filter((outfit) => outfit.pieceIds.length > 0);
  saveItems();
  localStorage.setItem(outfitsKey, JSON.stringify(savedOutfits));
  renderApp();
}

function toggleFavorite(id) {
  const item = wardrobeItems.find((entry) => entry.id === id);

  if (!item) {
    return;
  }

  item.favorite = !item.favorite;
  saveItems();
  renderApp();
}

function openItemDialog() {
  itemDialog.showModal();
}

function closeItemDialog() {
  itemForm.reset();
  resetPhoto();
  itemDialog.close();
}

function resetPhoto(message = "") {
  photoData = "";
  photoPreview.hidden = true;
  photoPreview.removeAttribute("src");
  uploadMessage.textContent = message;
}

function getViewFromHash() {
  return window.location.hash.replace("#", "") || "closet";
}

function cyclePracticePiece(pieceType, direction) {
  if (pieceType === "top") {
    practiceTopIndex = wrapIndex(practiceTopIndex + direction, practiceTops.length);
  } else {
    practiceBottomIndex = wrapIndex(practiceBottomIndex + direction, practiceBottoms.length);
  }

  renderPracticeOutfit();
}

function renderPracticeOutfit() {
  const top = practiceTops[practiceTopIndex];
  const bottom = practiceBottoms[practiceBottomIndex];

  practiceTopImage.src = top.photo;
  practiceTopImage.alt = top.name;
  practiceTopName.textContent = top.name;
  practiceBottomImage.src = bottom.photo;
  practiceBottomImage.alt = bottom.name;
  practiceBottomName.textContent = bottom.name;
}

function wrapIndex(index, length) {
  return (index + length) % length;
}

function saveItems() {
  localStorage.setItem(storageKey, JSON.stringify(wardrobeItems));
}

function readStorage(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
}

function parseList(value) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/*
  JavaScript alternative for HTML partials:
  If you later want to keep section markup only in /components, you can fetch
  each file and inject it into a container. This project keeps direct fallback
  sections in index.html so it works without a server.

  async function loadComponent(path, target) {
    const response = await fetch(path);
    document.querySelector(target).innerHTML = await response.text();
  }
*/
