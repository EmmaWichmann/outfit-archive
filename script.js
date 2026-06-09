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
const hiddenStarterItemsKey = "outfit-archive-hidden-starter-items";
const trashItemsKey = "outfit-archive-trash-items";
const collagesKey = "outfit-archive-saved-collages";

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
const practiceSecondTopImage = document.getElementById("practice-second-top-image");
const practiceSecondTopName = document.getElementById("practice-second-top-name");
const practiceBottomImage = document.getElementById("practice-bottom-image");
const practiceBottomName = document.getElementById("practice-bottom-name");
const practiceDressImage = document.getElementById("practice-dress-image");
const practiceDressName = document.getElementById("practice-dress-name");
const practiceShoeImage = document.getElementById("practice-shoe-image");
const practiceShoeName = document.getElementById("practice-shoe-name");
const practicePieceButtons = document.querySelectorAll("[data-cycle-piece]");
const practicePresetButtons = document.querySelectorAll("[data-practice-preset]");
const outfitModeButtons = document.querySelectorAll("[data-outfit-mode]");
const topTypeButtons = document.querySelectorAll("[data-top-type]");
const separatesLevels = document.querySelectorAll("[data-separates-level]");
const dressLevel = document.querySelector("[data-dress-level]");
const undoClosetButton = document.getElementById("undo-closet-action");
const redoClosetButton = document.getElementById("redo-closet-action");
const openTrashButton = document.getElementById("open-trash");
const trashCount = document.getElementById("trash-count");
const trashDialog = document.getElementById("trash-dialog");
const closeTrashButton = document.getElementById("close-trash");
const trashList = document.getElementById("trash-list");
const trashEmpty = document.getElementById("trash-empty");
const emptyTrashButton = document.getElementById("empty-trash");
const secondTopLevel = document.querySelector("[data-optional-layer]");
const toggleSecondTopButton = document.getElementById("toggle-second-top");
const removeSecondTopButton = document.getElementById("remove-second-top");
const clearOutfitCanvasButton = document.getElementById("clear-outfit-canvas");
const builderStatus = document.getElementById("builder-status");
const collageTrayItems = document.getElementById("collage-tray-items");
const collageCanvas = document.getElementById("collage-canvas");
const saveCollageForm = document.getElementById("save-collage-form");
const collageNameInput = document.getElementById("collage-name");
const clearCollageButton = document.getElementById("clear-collage-canvas");
const bgSwatches = document.querySelectorAll("[data-bg-color]");

let wardrobeItems = readStorage(storageKey);
let savedOutfits = readStorage(outfitsKey);
let hiddenStarterItemIds = readStorage(hiddenStarterItemsKey);
let trashedItems = readStorage(trashItemsKey);
let savedCollages = readStorage(collagesKey);
let undoClosetActions = [];
let redoClosetActions = [];
let activeCategory = "All";
let searchTerm = "";
let photoData = "";
let draggedItemId = "";
let canvasPieces = [];
let canvasDragId = "";
let practiceTopIndex = 0;
let practiceSecondTopIndex = 2;
let practiceBottomIndex = 0;
let practiceDressIndex = 0;
let practiceShoeIndex = 0;
let practiceOutfitMode = "separates";
let activeTopType = "all";
let showSecondTop = false;
let pointerDrag = null;
let collagePieces = [];
let collageBackground = "#c9a87c";
let collagePointerDrag = null;

const starterWardrobeItems = [
  createStarterItem("starter-ivory-blouse", "Ivory blouse", "Short Sleeve Tops", "images/practice/ivory-blouse.png", ["ivory"], ["short sleeve", "classic"]),
  createStarterItem("starter-rust-top", "Rust knit top", "Short Sleeve Tops", "images/practice/rust-top.png", ["rust"], ["short sleeve", "casual"]),
  createStarterItem("starter-blue-shirt", "Blue striped shirt", "Long Sleeve Tops", "images/practice/blue-striped-shirt.png", ["blue", "white"], ["long sleeve", "layering"]),
  createStarterItem("starter-denim-shorts", "Denim shorts", "Bottoms", "images/practice/denim-shorts.png", ["denim", "blue"], ["shorts", "casual"]),
  createStarterItem("starter-plaid-skirt", "Cream plaid skirt", "Bottoms", "images/practice/plaid-skirt.png", ["cream"], ["skirt", "plaid"]),
  createStarterItem("starter-striped-shorts", "Striped sailor shorts", "Bottoms", "images/practice/striped-sailor-shorts.png", ["ivory", "blue"], ["shorts", "striped"]),
  createStarterItem("starter-floral-shorts", "Floral sailor shorts", "Bottoms", "images/practice/floral-sailor-shorts.png", ["cream", "floral"], ["shorts", "casual"]),
  createStarterItem("starter-rust-dress", "Rust shirt dress", "Dresses", "images/practice/rust-shirt-dress.png", ["rust"], ["dress", "summer"]),
  createStarterItem("starter-tan-sandals", "Tan sandals", "Shoes", "images/practice/tan-sandals.png", ["tan"], ["sandals", "casual"]),
  createStarterItem("starter-cream-heels", "Cream block heels", "Shoes", "images/practice/cream-heels.png", ["cream"], ["heels", "dressy"]),
  createStarterItem("starter-black-crossover-leggings", "Black crossover leggings", "Bottoms", "images/practice/black-crossover-leggings.png", ["black"], ["leggings", "activewear", "casual"]),
  createStarterItem("starter-black-flowy-shorts", "Black pleated flowy shorts", "Bottoms", "images/practice/black-flowy-shorts.png", ["black"], ["shorts", "activewear", "summer"]),
  createStarterItem("starter-sage-satin-pants", "Sage satin wide-leg pants", "Bottoms", "images/practice/sage-satin-pants.png", ["sage", "green"], ["wide leg", "satin", "lounge"]),
  createStarterItem("starter-black-ribbed-tank", "Black ribbed tank", "Short Sleeve Tops", "images/practice/black-ribbed-tank.png", ["black"], ["tank", "sleeveless", "casual"]),
  createStarterItem("starter-black-slides", "Black slide sandals", "Shoes", "images/practice/black-slides.png", ["black"], ["slides", "sandals", "casual"]),
  createStarterItem("starter-brown-black-sneakers", "Brown and black low-top sneakers", "Shoes", "images/practice/brown-black-sneakers.png", ["brown", "black", "cream"], ["sneakers", "casual", "streetwear"]),
  createStarterItem("starter-hollister-puppy-sweater", "Hollister puppy sweater", "Long Sleeve Tops", "images/practice/hollister-puppy-sweater.png", ["slate blue", "cream", "tan"], ["sweater", "long sleeve", "cozy"]),
];

const topCategories = ["Tops", "Short Sleeve Tops", "Long Sleeve Tops"];

migratePreviouslyRemovedStarters();
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
toggleSecondTopButton.addEventListener("click", () => {
  showSecondTop = true;
  renderPracticeOutfit();
});
removeSecondTopButton.addEventListener("click", () => {
  showSecondTop = false;
  renderPracticeOutfit();
});
clearOutfitCanvasButton.addEventListener("click", () => {
  canvasPieces = [];
  renderCanvas();
  builderStatus.textContent = "Canvas cleared. Tap a piece to start again.";
});

bgSwatches.forEach((swatch) => {
  swatch.addEventListener("click", () => {
    collageBackground = swatch.dataset.bgColor;
    collageCanvas.style.background = collageBackground;
    bgSwatches.forEach((s) => s.classList.toggle("active", s === swatch));
  });
});

clearCollageButton.addEventListener("click", () => {
  collagePieces = [];
  renderCollageCanvas();
});

collageTrayItems.addEventListener("click", (event) => {
  const piece = event.target.closest("[data-item-id]");
  if (!piece) return;
  addItemToCollage(piece.dataset.itemId);
});

collageCanvas.addEventListener("click", (event) => {
  const removeButton = event.target.closest("[data-remove-piece]");
  const resizeButton = event.target.closest("[data-resize-piece]");

  if (removeButton) {
    collagePieces = collagePieces.filter((piece) => piece.canvasId !== removeButton.dataset.removePiece);
    renderCollageCanvas();
  }

  if (resizeButton) {
    const piece = collagePieces.find((p) => p.canvasId === resizeButton.dataset.resizePiece);
    if (piece) {
      piece.size = clamp((piece.size || 130) + Number(resizeButton.dataset.delta), 60, 280);
      renderCollageCanvas();
    }
  }
});

collageCanvas.addEventListener("pointerdown", (event) => {
  const pieceNode = event.target.closest(".collage-piece");
  if (!pieceNode || event.target.closest("button")) return;

  const piece = collagePieces.find((item) => item.canvasId === pieceNode.dataset.canvasId);
  if (!piece) return;

  const rect = collageCanvas.getBoundingClientRect();
  collagePointerDrag = {
    piece,
    offsetX: event.clientX - rect.left - piece.x,
    offsetY: event.clientY - rect.top - piece.y,
  };
  pieceNode.setPointerCapture(event.pointerId);
});

collageCanvas.addEventListener("pointermove", (event) => {
  if (!collagePointerDrag) return;

  const rect = collageCanvas.getBoundingClientRect();
  collagePointerDrag.piece.x = clamp(event.clientX - rect.left - collagePointerDrag.offsetX, 0, rect.width - 60);
  collagePointerDrag.piece.y = clamp(event.clientY - rect.top - collagePointerDrag.offsetY, 0, rect.height - 60);
  const pieceNode = collageCanvas.querySelector(`[data-canvas-id="${collagePointerDrag.piece.canvasId}"]`);
  if (pieceNode) {
    pieceNode.style.left = `${collagePointerDrag.piece.x}px`;
    pieceNode.style.top = `${collagePointerDrag.piece.y}px`;
  }
});

collageCanvas.addEventListener("pointerup", () => {
  if (collagePointerDrag) {
    collagePointerDrag.piece.z = Math.max(0, ...collagePieces.map((p) => p.z || 0)) + 1;
    collagePointerDrag = null;
  }
});

saveCollageForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (collagePieces.length === 0) {
    collageNameInput.placeholder = "Add at least one piece first...";
    return;
  }

  const collage = {
    id: crypto.randomUUID(),
    name: collageNameInput.value.trim(),
    background: collageBackground,
    pieceIds: collagePieces.map((p) => p.itemId),
    layout: collagePieces.map(({ itemId, x, y, z, size }) => ({ itemId, x, y, z: z || 0, size: size || 130 })),
    createdAt: new Date().toISOString(),
  };

  savedCollages.unshift(collage);
  localStorage.setItem(collagesKey, JSON.stringify(savedCollages));
  collageNameInput.value = "";
  collagePieces = [];
  renderApp();
  showView("closet");
});
openTrashButton.addEventListener("click", () => {
  renderTrash();
  trashDialog.showModal();
});
closeTrashButton.addEventListener("click", () => trashDialog.close());
emptyTrashButton.addEventListener("click", emptyTrash);
undoClosetButton.addEventListener("click", undoClosetAction);
redoClosetButton.addEventListener("click", redoClosetAction);

trashList.addEventListener("click", (event) => {
  const restoreButton = event.target.closest("[data-restore-item]");

  if (restoreButton) {
    restoreItem(restoreButton.dataset.restoreItem);
  }
});

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

trayItems.addEventListener("click", (event) => {
  const piece = event.target.closest("[data-item-id]");

  if (!piece) {
    return;
  }

  addItemToCanvas(piece.dataset.itemId);
  builderStatus.textContent = "Added. Drag the piece to position it.";
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
  const forwardButton = event.target.closest("[data-bring-forward]");

  if (removeButton) {
    canvasPieces = canvasPieces.filter((piece) => piece.canvasId !== removeButton.dataset.removePiece);
    renderCanvas();
  }

  if (forwardButton) {
    const piece = canvasPieces.find((item) => item.canvasId === forwardButton.dataset.bringForward);
    if (piece) {
      piece.z = Math.max(0, ...canvasPieces.map((item) => item.z || 0)) + 1;
      renderCanvas();
    }
  }
});

outfitCanvas.addEventListener("pointerdown", (event) => {
  const pieceNode = event.target.closest(".canvas-piece");

  if (!pieceNode || event.target.closest("button")) {
    return;
  }

  const piece = canvasPieces.find((item) => item.canvasId === pieceNode.dataset.canvasId);
  if (!piece) {
    return;
  }

  const rect = outfitCanvas.getBoundingClientRect();
  pointerDrag = {
    piece,
    offsetX: event.clientX - rect.left - piece.x,
    offsetY: event.clientY - rect.top - piece.y,
  };
  pieceNode.setPointerCapture(event.pointerId);
});

outfitCanvas.addEventListener("pointermove", (event) => {
  if (!pointerDrag) {
    return;
  }

  const rect = outfitCanvas.getBoundingClientRect();
  pointerDrag.piece.x = clamp(event.clientX - rect.left - pointerDrag.offsetX, 0, rect.width - 110);
  pointerDrag.piece.y = clamp(event.clientY - rect.top - pointerDrag.offsetY, 0, rect.height - 140);
  const pieceNode = outfitCanvas.querySelector(`[data-canvas-id="${pointerDrag.piece.canvasId}"]`);
  if (pieceNode) {
    pieceNode.style.left = `${pointerDrag.piece.x}px`;
    pieceNode.style.top = `${pointerDrag.piece.y}px`;
  }
});

outfitCanvas.addEventListener("pointerup", () => {
  pointerDrag = null;
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
    layout: canvasPieces.map(({ itemId, x, y, z }) => ({ itemId, x, y, z: z || 0 })),
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
    const preset = Number(button.dataset.practicePreset);

    if (preset === 0) {
      setPracticeMode("separates");
      practiceTopIndex = 0;
      practiceBottomIndex = 0;
      practiceShoeIndex = 0;
    } else {
      setPracticeMode("dress");
      practiceDressIndex = 0;
      practiceShoeIndex = 1;
    }

    renderPracticeOutfit();
  });
});

outfitModeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setPracticeMode(button.dataset.outfitMode);
    renderPracticeOutfit();
  });
});

topTypeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeTopType = button.dataset.topType;
    practiceTopIndex = 0;
    topTypeButtons.forEach((item) => {
      item.classList.toggle("active", item === button);
    });
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
  renderCollageTray();
  renderPracticeOutfit();
  renderTrash();
  updateClosetActionButtons();
}

function renderStats() {
  const allItems = getAllClosetItems();
  itemCount.textContent = allItems.length;
  outfitCount.textContent = savedOutfits.length + savedCollages.length;
  favoriteCount.textContent = allItems.filter((item) => item.favorite).length;
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

  savedCollages.forEach((collage) => {
    if (activeCategory === "All" || activeCategory === "Full Outfits") {
      closetGrid.append(createCollageCard(collage));
    }
  });

  closetEmpty.hidden = closetGrid.children.length > 0;
}

function getVisibleItems() {
  return getAllClosetItems().filter((item) => {
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
  favoriteButton.hidden = item.isStarter;

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
  const allItems = getAllClosetItems();

  const pieces = outfit.pieceIds
    .map((id) => allItems.find((item) => item.id === id))
    .filter(Boolean);

  const images = document.createElement("div");
  images.className = "saved-outfit-images";

  pieces.forEach((piece, index) => {
    const image = document.createElement("img");
    image.src = piece.photo;
    image.alt = piece.name;
    const layoutPiece = outfit.layout?.[index];
    if (layoutPiece) {
      image.style.left = `${clamp((layoutPiece.x / 560) * 100, 0, 72)}%`;
      image.style.top = `${clamp((layoutPiece.y / 560) * 100, 0, 68)}%`;
      image.style.zIndex = String(layoutPiece.z || index);
    }
    images.append(image);
  });

  const body = document.createElement("div");
  body.className = "card-body";
  body.innerHTML = `
    <div class="card-heading">
      <h3 class="card-name">${escapeHtml(outfit.name)}</h3>
      <span class="card-category">Full Outfits</span>
    </div>
    <p class="outfit-piece-count">${pieces.length} pieces</p>
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

  getAllClosetItems().forEach((item) => {
    const piece = document.createElement("article");
    piece.className = "tray-piece";
    piece.dataset.itemId = item.id;
    piece.draggable = true;
    piece.innerHTML = `
      <img src="${item.photo}" alt="${escapeHtml(item.name)}" />
      <p>${escapeHtml(item.name)}</p>
      <span>Tap to add</span>
    `;
    trayItems.append(piece);
  });
}

function addItemToCanvas(itemId, event) {
  const rect = outfitCanvas.getBoundingClientRect();
  const stagger = canvasPieces.length % 5;
  canvasPieces.push({
    canvasId: crypto.randomUUID(),
    itemId,
    x: event ? event.clientX - rect.left - 75 : rect.width / 2 - 75 + stagger * 12,
    y: event ? event.clientY - rect.top - 95 : 45 + stagger * 34,
    z: canvasPieces.length,
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
    const item = getAllClosetItems().find((entry) => entry.id === piece.itemId);

    if (!item) {
      return;
    }

    const node = document.createElement("article");
    node.className = "canvas-piece";
    node.dataset.canvasId = piece.canvasId;
    node.draggable = true;
    node.style.left = `${piece.x}px`;
    node.style.top = `${piece.y}px`;
    node.style.zIndex = String(piece.z || 0);
    node.innerHTML = `
      <img src="${item.photo}" alt="${escapeHtml(item.name)}" />
      <button class="canvas-forward" data-bring-forward="${piece.canvasId}" type="button" aria-label="Bring ${escapeHtml(item.name)} forward">↑</button>
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
  const scoredItems = getAllClosetItems()
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
  const item = getAllClosetItems().find((entry) => entry.id === id);

  if (!item || !window.confirm(`Move "${item.name}" to Trash?`)) {
    return;
  }

  moveItemToTrash(item, true);
}

function moveItemToTrash(item, recordAction) {
  if (!item || trashedItems.some((entry) => entry.id === item.id)) {
    return;
  }

  trashedItems.unshift(item);

  if (item.isStarter) {
    hiddenStarterItemIds = [...new Set([...hiddenStarterItemIds, item.id])];
  } else {
    wardrobeItems = wardrobeItems.filter((entry) => entry.id !== item.id);
  }

  canvasPieces = canvasPieces.filter((piece) => piece.itemId !== item.id);
  saveClosetAndTrash();

  if (recordAction) {
    recordClosetAction("remove", item);
  }

  renderApp();
}

function restoreItem(id, recordAction = true) {
  const item = trashedItems.find((entry) => entry.id === id);

  if (!item) {
    return;
  }

  trashedItems = trashedItems.filter((entry) => entry.id !== id);

  if (item.isStarter) {
    hiddenStarterItemIds = hiddenStarterItemIds.filter((itemId) => itemId !== id);
  } else if (!wardrobeItems.some((entry) => entry.id === id)) {
    wardrobeItems.unshift(item);
  }

  saveClosetAndTrash();

  if (recordAction) {
    recordClosetAction("restore", item);
  }

  renderApp();
}

function emptyTrash() {
  if (
    trashedItems.length === 0 ||
    !window.confirm("Permanently delete every item in Trash? This cannot be undone.")
  ) {
    return;
  }

  trashedItems = [];
  undoClosetActions = [];
  redoClosetActions = [];
  saveClosetAndTrash();
  renderApp();
}

function recordClosetAction(type, item) {
  undoClosetActions.push({ type, item });
  redoClosetActions = [];
}

function undoClosetAction() {
  const action = undoClosetActions.pop();

  if (!action) {
    return;
  }

  if (action.type === "remove") {
    restoreItem(action.item.id, false);
  } else {
    moveItemToTrash(action.item, false);
  }

  redoClosetActions.push(action);
  updateClosetActionButtons();
}

function redoClosetAction() {
  const action = redoClosetActions.pop();

  if (!action) {
    return;
  }

  if (action.type === "remove") {
    moveItemToTrash(action.item, false);
  } else {
    restoreItem(action.item.id, false);
  }

  undoClosetActions.push(action);
  updateClosetActionButtons();
}

function renderTrash() {
  trashList.innerHTML = "";

  trashedItems.forEach((item) => {
    const article = document.createElement("article");
    article.className = "trash-item";
    article.innerHTML = `
      <img src="${item.photo}" alt="${escapeHtml(item.name)}" />
      <div>
        <h3>${escapeHtml(item.name)}</h3>
        <p>${escapeHtml(item.category)}</p>
      </div>
      <button class="utility-button" data-restore-item="${item.id}" type="button">Restore</button>
    `;
    trashList.append(article);
  });

  trashCount.textContent = trashedItems.length;
  trashEmpty.hidden = trashedItems.length > 0;
  emptyTrashButton.disabled = trashedItems.length === 0;
}

function updateClosetActionButtons() {
  undoClosetButton.disabled = undoClosetActions.length === 0;
  redoClosetButton.disabled = redoClosetActions.length === 0;
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
  const tops = getPracticeTops();
  const bottoms = getPracticeItems(["Bottoms"]);
  const dresses = getPracticeItems(["Dresses"]);
  const shoes = getPracticeItems(["Shoes"]);

  if (pieceType === "top") {
    practiceTopIndex = wrapIndex(practiceTopIndex + direction, tops.length);
  } else if (pieceType === "second-top") {
    practiceSecondTopIndex = wrapIndex(practiceSecondTopIndex + direction, tops.length);
  } else if (pieceType === "bottom") {
    practiceBottomIndex = wrapIndex(practiceBottomIndex + direction, bottoms.length);
  } else if (pieceType === "dress") {
    practiceDressIndex = wrapIndex(practiceDressIndex + direction, dresses.length);
  } else {
    practiceShoeIndex = wrapIndex(practiceShoeIndex + direction, shoes.length);
  }

  renderPracticeOutfit();
}

function renderPracticeOutfit() {
  const tops = getPracticeTops();
  const bottoms = getPracticeItems(["Bottoms"]);
  const dresses = getPracticeItems(["Dresses"]);
  const shoeOptions = getPracticeItems(["Shoes"]);

  practiceTopIndex = wrapIndex(practiceTopIndex, tops.length);
  practiceBottomIndex = wrapIndex(practiceBottomIndex, bottoms.length);
  practiceDressIndex = wrapIndex(practiceDressIndex, dresses.length);
  practiceShoeIndex = wrapIndex(practiceShoeIndex, shoeOptions.length);

  const top = tops[practiceTopIndex] || createEmptyPracticeItem("Add a top");
  const secondTop = tops[practiceSecondTopIndex] || createEmptyPracticeItem("Add a layered top");
  const bottom = bottoms[practiceBottomIndex] || createEmptyPracticeItem("Add a bottom");
  const dress = dresses[practiceDressIndex] || createEmptyPracticeItem("Add a dress");
  const shoes = shoeOptions[practiceShoeIndex] || createEmptyPracticeItem("Add shoes");

  practiceTopImage.src = top.photo;
  practiceTopImage.alt = top.name;
  practiceTopName.textContent = top.name;
  practiceSecondTopImage.src = secondTop.photo;
  practiceSecondTopImage.alt = secondTop.name;
  practiceSecondTopName.textContent = secondTop.name;
  secondTopLevel.hidden = practiceOutfitMode === "dress" || !showSecondTop;
  toggleSecondTopButton.hidden = showSecondTop;
  practiceBottomImage.src = bottom.photo;
  practiceBottomImage.alt = bottom.name;
  practiceBottomName.textContent = bottom.name;
  practiceDressImage.src = dress.photo;
  practiceDressImage.alt = dress.name;
  practiceDressName.textContent = dress.name;
  practiceShoeImage.src = shoes.photo;
  practiceShoeImage.alt = shoes.name;
  practiceShoeName.textContent = shoes.name;
}

function getPracticeItems(categories) {
  return getAllClosetItems()
    .filter((item) => categories.includes(item.category))
    .map((item) => ({
      name: item.name,
      photo: item.photo,
    }));
}

function getPracticeTops() {
  const allTops = getAllClosetItems()
    .filter((item) => topCategories.includes(item.category))
    .map((item) => ({
      name: item.name,
      photo: item.photo,
      topType: getTopType(item),
    }));

  if (activeTopType === "all") {
    return allTops;
  }

  return allTops.filter((item) => item.topType === activeTopType);
}

function getTopType(item) {
  if (item.category === "Short Sleeve Tops") {
    return "short";
  }

  if (item.category === "Long Sleeve Tops") {
    return "long";
  }

  const itemText = [item.name, ...item.tags].join(" ").toLowerCase();
  const longSleeveWords = ["long sleeve", "button-down", "button down", "oxford", "layering"];

  return longSleeveWords.some((word) => itemText.includes(word)) ? "long" : "short";
}

function setPracticeMode(mode) {
  practiceOutfitMode = mode;
  const showDress = practiceOutfitMode === "dress";

  separatesLevels.forEach((level) => {
    level.hidden = showDress || (level.hasAttribute("data-optional-layer") && !showSecondTop);
  });
  dressLevel.hidden = !showDress;
  outfitModeButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.outfitMode === practiceOutfitMode);
  });
}

function wrapIndex(index, length) {
  if (length === 0) {
    return 0;
  }

  return (index + length) % length;
}

function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum);
}

function createStarterItem(id, name, category, photo, colors, tags) {
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

function getAllClosetItems() {
  const visibleStarterItems = starterWardrobeItems.filter(
    (item) => !hiddenStarterItemIds.includes(item.id),
  );
  return [...wardrobeItems, ...visibleStarterItems];
}

function migratePreviouslyRemovedStarters() {
  hiddenStarterItemIds.forEach((id) => {
    const starterItem = starterWardrobeItems.find((item) => item.id === id);

    if (starterItem && !trashedItems.some((item) => item.id === id)) {
      trashedItems.push(starterItem);
    }
  });
  localStorage.setItem(trashItemsKey, JSON.stringify(trashedItems));
}

function saveClosetAndTrash() {
  saveItems();
  localStorage.setItem(hiddenStarterItemsKey, JSON.stringify(hiddenStarterItemIds));
  localStorage.setItem(trashItemsKey, JSON.stringify(trashedItems));
}

function createEmptyPracticeItem(name) {
  return {
    name,
    photo:
      "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='240' viewBox='0 0 300 240'%3E%3Crect width='300' height='240' fill='%23f7f2e9'/%3E%3Ctext x='150' y='125' text-anchor='middle' font-family='Arial' font-size='18' fill='%23736f68'%3EUse Add a piece%3C/text%3E%3C/svg%3E",
  };
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

function renderCollageTray() {
  collageTrayItems.innerHTML = "";

  getAllClosetItems().forEach((item) => {
    const piece = document.createElement("article");
    piece.className = "tray-piece";
    piece.dataset.itemId = item.id;
    piece.innerHTML = `
      <img src="${item.photo}" alt="${escapeHtml(item.name)}" />
      <p>${escapeHtml(item.name)}</p>
      <span>Tap to add</span>
    `;
    collageTrayItems.append(piece);
  });
}

function addItemToCollage(itemId) {
  const rect = collageCanvas.getBoundingClientRect();
  const canvasWidth = rect.width || 400;
  const stagger = collagePieces.length % 5;
  collagePieces.push({
    canvasId: crypto.randomUUID(),
    itemId,
    x: canvasWidth / 2 - 65 + stagger * 20,
    y: 60 + stagger * 44,
    z: collagePieces.length,
    size: 130,
  });
  renderCollageCanvas();
}

function renderCollageCanvas() {
  const note = collageCanvas.querySelector(".canvas-note");
  collageCanvas.querySelectorAll(".collage-piece").forEach((piece) => piece.remove());
  note.hidden = collagePieces.length > 0;

  collagePieces.forEach((piece) => {
    const item = getAllClosetItems().find((entry) => entry.id === piece.itemId);
    if (!item) return;

    const size = piece.size || 130;
    const node = document.createElement("article");
    node.className = "collage-piece";
    node.dataset.canvasId = piece.canvasId;
    node.style.left = `${piece.x}px`;
    node.style.top = `${piece.y}px`;
    node.style.width = `${size}px`;
    node.style.zIndex = String(piece.z || 0);
    node.innerHTML = `
      <img src="${item.photo}" alt="${escapeHtml(item.name)}" />
      <button class="collage-btn collage-remove" data-remove-piece="${piece.canvasId}" type="button" aria-label="Remove ${escapeHtml(item.name)}">×</button>
      <button class="collage-btn collage-shrink" data-resize-piece="${piece.canvasId}" data-delta="-20" type="button" aria-label="Make smaller">−</button>
      <button class="collage-btn collage-grow" data-resize-piece="${piece.canvasId}" data-delta="20" type="button" aria-label="Make bigger">+</button>
    `;
    collageCanvas.append(node);
  });
}

function createCollageCard(collage) {
  const article = document.createElement("article");
  article.className = "outfit-card";
  const allItems = getAllClosetItems();

  const pieces = collage.pieceIds
    .map((id) => allItems.find((item) => item.id === id))
    .filter(Boolean);

  const preview = document.createElement("div");
  preview.className = "collage-preview";
  preview.style.background = collage.background || "#c9a87c";

  pieces.slice(0, 6).forEach((piece, index) => {
    const layout = collage.layout?.[index];
    const img = document.createElement("img");
    img.src = piece.photo;
    img.alt = piece.name;
    if (layout) {
      img.style.left = `${clamp((layout.x / 500) * 100, 0, 62)}%`;
      img.style.top = `${clamp((layout.y / 500) * 100, 0, 58)}%`;
      img.style.width = `${clamp((layout.size || 130) / 500 * 100, 14, 44)}%`;
      img.style.zIndex = String(layout.z || index);
    }
    preview.append(img);
  });

  const body = document.createElement("div");
  body.className = "card-body";
  body.innerHTML = `
    <div class="card-heading">
      <h3 class="card-name">${escapeHtml(collage.name)}</h3>
      <span class="card-category">Collage</span>
    </div>
    <p class="outfit-piece-count">${pieces.length} pieces</p>
  `;

  article.append(preview, body);
  return article;
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
