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
const vibeTabsKey = "outfit-archive-vibe-tabs";
const laundryKey = "outfit-archive-laundry-items";

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
const suggestionForm = document.getElementById("suggestion-form");
const occasionInput = document.getElementById("occasion-input");
const suggestionResults = document.getElementById("suggestion-results");
const itemCount = document.getElementById("item-count");
const outfitCount = document.getElementById("outfit-count");
const favoriteCount = document.getElementById("favorite-count");
const outfitModeButtons = document.querySelectorAll("[data-outfit-mode]");
const undoClosetButton = document.getElementById("undo-closet-action");
const redoClosetButton = document.getElementById("redo-closet-action");
const openTrashButton = document.getElementById("open-trash");
const trashCount = document.getElementById("trash-count");
const trashDialog = document.getElementById("trash-dialog");
const closeTrashButton = document.getElementById("close-trash");
const trashList = document.getElementById("trash-list");
const trashEmpty = document.getElementById("trash-empty");
const emptyTrashButton = document.getElementById("empty-trash");
const collageTrayItems = document.getElementById("collage-tray-items");
const collageCanvas = document.getElementById("collage-canvas");
const saveCollageForm = document.getElementById("save-collage-form");
const collageNameInput = document.getElementById("collage-name");
const trayFilterBar = document.getElementById("tray-filter-bar");
const savePracticeOutfitForm = document.getElementById("save-practice-outfit-form");
const practiceOutfitNameInput = document.getElementById("practice-outfit-name");
const exportWardrobeButton = document.getElementById("export-wardrobe");
const importWardrobeInput = document.getElementById("import-wardrobe");
const editDialog = document.getElementById("edit-dialog");
const editForm = document.getElementById("edit-form");
const editItemIdInput = document.getElementById("edit-item-id");
const editItemNameInput = document.getElementById("edit-item-name");
const editItemCategorySelect = document.getElementById("edit-item-category");
const editItemColorsInput = document.getElementById("edit-item-colors");
const editItemTagsInput = document.getElementById("edit-item-tags");
const laundryDialog = document.getElementById("laundry-dialog");
const laundryList = document.getElementById("laundry-list");
const laundryEmpty = document.getElementById("laundry-empty");
const washAllButton = document.getElementById("wash-all");
const laundryCountEl = document.getElementById("laundry-count");
const itemDetailDialog = document.getElementById("item-detail-dialog");

let wardrobeItems = readStorage(storageKey);
let savedOutfits = readStorage(outfitsKey);
let hiddenStarterItemIds = readStorage(hiddenStarterItemsKey);
let trashedItems = readStorage(trashItemsKey);
let savedCollages = readStorage(collagesKey);
let laundryItems = readStorage(laundryKey);
let undoClosetActions = [];
let redoClosetActions = [];
let activeCategory = "All";
let searchTerm = "";
let photoData = "";
let practiceOutfitMode = "separates";
let practiceIndices = { top: 0, bottom: 0, dress: 0, shoe: 0 };
let collagePieces = [];
const collageBackground = "#EDD6D1";
let collagePointerDrag = null;
let collageDragMoved = false;
let collageSelectedId = null;
let collageTrayFilter = "All";
let editingCollageId = null;

const defaultVibeTabs = [
  { id: "vibe-all", label: "All", filter: "all" },
  { id: "vibe-casual", label: "Casual", filter: "casual" },
  { id: "vibe-professional", label: "Professional", filter: "professional" },
  { id: "vibe-comfy", label: "Comfy", filter: "comfy" },
  { id: "vibe-movement", label: "Movement", filter: "movement" },
  { id: "vibe-favorites", label: "Favorites", filter: "favorites" },
  { id: "vibe-pjs", label: "PJs", filter: "pjs" },
  { id: "vibe-swimsuit", label: "Swimsuit", filter: "swimwear" },
];

const savedVibeTabs = readStorage(vibeTabsKey);
let vibeTabs = savedVibeTabs.length > 0 ? savedVibeTabs : [...defaultVibeTabs];

const newDefaultVibes = defaultVibeTabs.filter((d) => !vibeTabs.some((v) => v.id === d.id));
if (newDefaultVibes.length > 0) {
  vibeTabs = [...vibeTabs, ...newDefaultVibes];
  localStorage.setItem(vibeTabsKey, JSON.stringify(vibeTabs));
}
let activeVibe = "vibe-all";

const starterWardrobeItems = [
  createStarterItem("starter-blue-shirt", "Blue striped shirt", "Long Sleeve Tops", "images/closet/blue-striped-shirt.png", ["blue", "white"], ["long sleeve", "layering"]),
  createStarterItem("starter-striped-shorts", "Striped sailor shorts", "Bottoms", "images/closet/striped-sailor-shorts.png", ["ivory", "blue"], ["shorts", "striped"]),
  createStarterItem("starter-floral-shorts", "Floral sailor shorts", "Bottoms", "images/closet/floral-sailor-shorts.png", ["cream", "floral"], ["shorts", "casual"]),
  createStarterItem("starter-rust-dress", "Rust shirt dress", "Dresses", "images/closet/rust-shirt-dress.png", ["rust"], ["dress", "summer"]),
  createStarterItem("starter-black-crossover-leggings", "Black crossover leggings", "Bottoms", "images/closet/black-crossover-leggings.png", ["black"], ["leggings", "activewear", "casual"]),
  createStarterItem("starter-black-flowy-shorts", "Black pleated flowy shorts", "Bottoms", "images/closet/black-flowy-shorts.png", ["black"], ["shorts", "activewear", "summer"]),
  createStarterItem("starter-sage-satin-pants", "Sage satin wide-leg pants", "Bottoms", "images/closet/sage-satin-pants.png", ["sage", "green"], ["wide leg", "satin", "lounge"]),
  createStarterItem("starter-black-ribbed-tank", "Black ribbed tank", "Short Sleeve Tops", "images/closet/black-ribbed-tank.png", ["black"], ["tank", "sleeveless", "casual"]),
  createStarterItem("starter-black-slides", "Black slide sandals", "Shoes", "images/closet/black-slides.png", ["black"], ["slides", "sandals", "casual"]),
  createStarterItem("starter-brown-black-sneakers", "Brown and black low-top sneakers", "Shoes", "images/closet/brown-black-sneakers.png", ["brown", "black", "cream"], ["sneakers", "casual", "streetwear"]),
  createStarterItem("starter-hollister-puppy-sweater", "Hollister puppy sweater", "Long Sleeve Tops", "images/closet/hollister-puppy-sweater.png", ["slate blue", "cream", "tan"], ["sweater", "long sleeve", "cozy"]),
  createStarterItem("starter-lyra-mini-dress", "Lyra mini dress", "Dresses", "images/closet/lyra-mini-dress.png", ["burgundy", "cream"], ["mini", "halter", "polka dot", "date night", "summer"]),
  createStarterItem("starter-denim-corset-top", "Wild Fable denim corset top", "Short Sleeve Tops", "images/closet/denim-corset-top.png", ["denim", "blue"], ["strapless", "corset", "crop top"]),
  createStarterItem("starter-charcoal-lounge-shorts", "Charcoal lounge shorts", "Bottoms", "images/closet/charcoal-lounge-shorts.png", ["charcoal", "gray"], ["shorts", "loungewear", "casual"]),
  createStarterItem("starter-skeleton-cowboy-tee", "Skeleton cowboy graphic tee", "Short Sleeve Tops", "images/closet/skeleton-cowboy-tee.png", ["black", "tan"], ["graphic tee", "short sleeve", "halloween"]),
  createStarterItem("starter-herringbone-wide-leg-pants", "Herringbone wide-leg pants", "Bottoms", "images/closet/charcoal-wide-leg-pants.png", ["charcoal", "gray"], ["wide leg", "drawstring", "work"]),
  createStarterItem("starter-distressed-denim-shorts", "Distressed denim cutoff shorts", "Bottoms", "images/closet/distressed-denim-shorts.png", ["denim", "blue"], ["shorts", "distressed", "casual"]),
  createStarterItem("starter-navy-wide-leg-sweatpants", "Navy wide-leg sweatpants", "Bottoms", "images/closet/navy-wide-leg-sweatpants.png", ["navy"], ["wide leg", "sweatpants", "loungewear"]),
  createStarterItem("starter-cheers-crop-tee", "Cheers crop tee", "Short Sleeve Tops", "images/closet/cheers-crop-tee.png", ["black", "white"], ["crop top", "graphic tee", "short sleeve"]),
  createStarterItem("starter-butterfly-graphic-tee", "Butterfly graphic tee", "Short Sleeve Tops", "images/closet/butterfly-graphic-tee.png", ["caramel", "pink"], ["graphic tee", "oversized", "short sleeve"]),
  createStarterItem("starter-rust-tie-front-top", "Rust tie-front crop top", "Short Sleeve Tops", "images/closet/rust-tie-front-top.png", ["rust", "terracotta"], ["crop top", "tie front", "casual", "summer"]),
  createStarterItem("starter-gold-tennis-necklace", "Gold rhinestone tennis necklace", "Accessories", "images/closet/gold-tennis-necklace.png", ["gold", "silver"], ["necklace", "jewelry", "dressy"]),
  createStarterItem("starter-rattan-hoop-earrings", "Rattan woven hoop earrings", "Accessories", "images/closet/rattan-hoop-earrings.png", ["tan", "natural"], ["earrings", "hoops", "casual"]),
  createStarterItem("starter-gold-crescent-earrings", "Gold crescent hoop earrings", "Accessories", "images/closet/gold-crescent-earrings.png", ["gold"], ["earrings", "hoops", "dressy"]),
  createStarterItem("starter-gold-twisted-hoops", "Gold twisted rope hoop earrings", "Accessories", "images/closet/gold-twisted-hoops.png", ["gold"], ["earrings", "hoops", "dressy"]),
  createStarterItem("starter-california-jersey", "California Giants baseball jersey", "Short Sleeve Tops", "images/closet/california-jersey.png", ["cream", "orange", "black"], ["jersey", "graphic", "short sleeve", "casual"]),
  createStarterItem("starter-lavender-crop-sweatshirt", "Lavender crop sweatshirt", "Long Sleeve Tops", "images/closet/lavender-crop-sweatshirt.png", ["lavender", "purple"], ["sweatshirt", "crop", "cozy", "casual"]),
  createStarterItem("starter-light-wash-straight-jeans", "Light wash straight-leg jeans", "Bottoms", "images/closet/light-wash-straight-jeans.png", ["denim", "light blue"], ["jeans", "straight leg", "casual"]),
  createStarterItem("starter-brown-stripe-tee", "Brown stripe fitted tee", "Short Sleeve Tops", "images/closet/brown-stripe-tee.png", ["brown", "cream", "ivory"], ["striped", "short sleeve", "fitted", "casual"]),
  createStarterItem("starter-black-fitted-tee", "Black fitted tee", "Short Sleeve Tops", "images/closet/black-fitted-tee.png", ["black"], ["short sleeve", "fitted", "basic", "casual"]),
  createStarterItem("starter-black-rose-off-shoulder", "Black rose off-shoulder top", "Short Sleeve Tops", "images/closet/black-rose-off-shoulder-top.png", ["black", "gold"], ["off shoulder", "embroidered", "short sleeve", "dressy"]),
  createStarterItem("starter-blue-cami-tank", "Blue cami tank", "Short Sleeve Tops", "images/closet/blue-cami-tank.png", ["blue", "royal blue"], ["tank", "cami", "sleeveless", "casual"]),
  createStarterItem("starter-sage-ribbed-tank", "Sage ribbed tank", "Short Sleeve Tops", "images/closet/sage-ribbed-tank.png", ["sage", "green"], ["tank", "ribbed", "sleeveless", "casual"]),
  createStarterItem("starter-black-ribbed-tank-top", "Black ribbed tank top", "Short Sleeve Tops", "images/closet/black-ribbed-tank-top.png", ["black"], ["tank", "ribbed", "sleeveless", "basic"]),
  createStarterItem("starter-black-wf-tank", "Black Wild Fable tank", "Short Sleeve Tops", "images/closet/black-wf-tank.png", ["black"], ["tank", "sleeveless", "basic", "casual"]),
  createStarterItem("starter-navy-floral-skirt", "Navy floral pleated skirt", "Bottoms", "images/closet/navy-floral-skirt.png", ["navy", "blue"], ["skirt", "floral", "pleated", "casual"]),
  createStarterItem("starter-strawberry-bikini", "Strawberry print bikini", "Swimsuit", "images/closet/strawberry-bikini.png", ["pink", "red"], ["bikini", "swimwear", "summer", "beach"]),
  createStarterItem("starter-snakeskin-bandeau-bikini", "Snakeskin bandeau bikini", "Swimsuit", "images/closet/snakeskin-bandeau-bikini.png", ["brown", "tan", "black"], ["bikini", "swimwear", "summer", "beach"]),
  createStarterItem("starter-brown-bikini-set", "Brown bikini set", "Swimsuit", "images/closet/brown-bikini-set.png", ["brown", "chocolate"], ["bikini", "swimwear", "summer", "beach"]),
  createStarterItem("starter-reptile-string-bikini", "Reptile print string bikini", "Swimsuit", "images/closet/reptile-string-bikini.png", ["orange", "green", "red"], ["bikini", "swimwear", "summer", "beach"]),
  createStarterItem("starter-pink-floral-bandeau-bikini", "Pink floral bandeau bikini", "Swimsuit", "images/closet/pink-floral-bandeau-bikini.png", ["pink", "magenta"], ["bikini", "swimwear", "summer", "beach"]),
  createStarterItem("starter-f1-racing-jersey", "F1 racing jersey", "Long Sleeve Tops", "images/closet/f1-racing-jersey.png", ["black", "white", "red"], ["jersey", "graphic", "streetwear", "casual"]),
  createStarterItem("starter-leopard-lounge-pants", "Leopard lounge pants", "Bottoms", "images/closet/leopard-lounge-pants.png", ["brown", "tan", "black"], ["leopard", "lounge", "casual", "print"]),
  createStarterItem("starter-leopard-camp-shirt", "Leopard camp shirt", "Short Sleeve Tops", "images/closet/leopard-camp-shirt.png", ["brown", "tan", "black"], ["leopard", "camp collar", "casual", "print"]),
  createStarterItem("starter-sage-cargo-skirt", "Sage cargo mini skirt", "Bottoms", "images/closet/sage-cargo-skirt.png", ["sage", "green"], ["skirt", "mini", "cargo", "casual"]),
  createStarterItem("starter-pink-athletic-shorts", "Pink athletic shorts", "Bottoms", "images/closet/pink-athletic-shorts.png", ["pink", "blush"], ["shorts", "athletic", "activewear"]),
  createStarterItem("starter-orange-nike-shorts", "Orange Nike athletic shorts", "Bottoms", "images/closet/orange-nike-shorts.png", ["orange"], ["shorts", "athletic", "activewear", "nike"]),
  createStarterItem("starter-gray-denim-cargo-shorts", "Gray denim cargo shorts", "Bottoms", "images/closet/gray-denim-cargo-shorts.png", ["gray", "charcoal"], ["shorts", "denim", "cargo", "casual"]),
  createStarterItem("starter-navy-polka-dot-shorts", "Navy polka dot lounge shorts", "Bottoms", "images/closet/navy-polka-dot-shorts.png", ["navy", "multicolor"], ["shorts", "lounge", "casual"]),
  createStarterItem("starter-white-denim-shorts", "White denim cutoff shorts", "Bottoms", "images/closet/white-denim-shorts.png", ["white", "cream"], ["shorts", "denim", "casual", "summer"]),
  createStarterItem("starter-olive-midi-dress", "Olive midi sundress", "Dresses", "images/closet/olive-midi-dress.png", ["olive", "green"], ["dress", "midi", "sundress", "summer", "casual"]),
  createStarterItem("starter-dark-wash-flare-jeans", "Dark wash flare jeans", "Bottoms", "images/closet/dark-wash-flare-jeans.png", ["navy", "dark blue"], ["jeans", "flare", "denim", "casual"]),
  createStarterItem("starter-gray-wide-leg-pants", "Gray wide-leg pants", "Bottoms", "images/closet/gray-wide-leg-pants.png", ["gray", "light gray"], ["wide leg", "drawstring", "work", "casual"]),
  createStarterItem("starter-black-wide-leg-pants", "Black wide-leg pants", "Bottoms", "images/closet/black-wide-leg-pants.png", ["black"], ["wide leg", "drawstring", "work", "casual"]),
  createStarterItem("starter-sage-linen-wide-leg-pants", "Sage linen wide-leg pants", "Bottoms", "images/closet/sage-linen-wide-leg-pants.png", ["sage", "olive", "green"], ["wide leg", "drawstring", "linen", "casual", "summer"]),
  createStarterItem("starter-black-biker-shorts", "Black biker shorts", "Bottoms", "images/closet/black-biker-shorts.png", ["black"], ["shorts", "biker", "athletic", "casual"]),
  createStarterItem("starter-black-face-graphic-tee", "Black face graphic tee", "Short Sleeve Tops", "images/closet/black-face-graphic-tee.png", ["black", "white"], ["graphic tee", "casual", "streetwear"]),
  createStarterItem("starter-navy-pinstripe-flare-jeans", "Navy pinstripe flare jeans", "Bottoms", "images/closet/navy-pinstripe-flare-jeans.png", ["navy", "white"], ["jeans", "flare", "pinstripe", "denim", "casual"]),
  createStarterItem("starter-leopard-print-shorts", "Leopard print shorts", "Bottoms", "images/closet/leopard-print-shorts.png", ["brown", "tan", "black"], ["leopard", "shorts", "casual", "print"]),
  createStarterItem("starter-snakeskin-heeled-sandals", "Snakeskin heeled sandals", "Shoes", "images/closet/snakeskin-heeled-sandals.png", ["tan", "brown", "cream"], ["heels", "sandals", "snakeskin", "dressy"]),
  createStarterItem("starter-umd-block-graphic-tee", "UMD Block graphic tee", "Short Sleeve Tops", "images/closet/umd-block-graphic-tee.png", ["navy", "multicolor"], ["graphic tee", "casual", "college"]),
  createStarterItem("starter-sage-open-knit-sweater", "Sage open-knit sweater", "Long Sleeve Tops", "images/closet/sage-open-knit-sweater.png", ["sage", "green"], ["sweater", "knit", "crochet", "casual", "layering"]),
  createStarterItem("starter-lime-ruffle-crop-top", "Lime ruffle crop top", "Long Sleeve Tops", "images/closet/lime-ruffle-crop-top.png", ["lime", "neon green", "yellow-green"], ["crop top", "ruffle", "tie-front", "summer", "casual"]),
  createStarterItem("starter-green-do-your-thing-tee", "Green Do Your Thing tee", "Short Sleeve Tops", "images/closet/green-do-your-thing-tee.png", ["forest green", "white"], ["graphic tee", "casual", "streetwear"]),
  createStarterItem("starter-retro-print-mini-skirt", "Retro print mini skirt", "Bottoms", "images/closet/retro-print-mini-skirt.png", ["orange", "green", "red", "yellow"], ["skirt", "mini", "retro", "print", "summer"]),
  createStarterItem("starter-fish-print-pants", "Fish print pants", "Bottoms", "images/closet/fish-print-pants.png", ["black", "tan"], ["pants", "print", "casual", "streetwear"]),
  createStarterItem("starter-gray-crop-sweater", "Gray crop sweater", "Long Sleeve Tops", "images/closet/gray-crop-sweater.png", ["gray"], ["sweater", "crop", "cozy", "casual"]),
  createStarterItem("starter-mauve-mesh-off-shoulder-top", "Mauve mesh off-shoulder top", "Short Sleeve Tops", "images/closet/mauve-mesh-off-shoulder-top.png", ["mauve", "dusty rose", "pink"], ["off shoulder", "mesh", "ruched", "casual", "summer"]),
  createStarterItem("starter-true-crime-graphic-tee", "True Crime Social Club tee", "Short Sleeve Tops", "images/closet/true-crime-graphic-tee.png", ["black", "red"], ["graphic tee", "casual"]),
  createStarterItem("starter-gray-tailored-trousers", "Gray tailored trousers", "Bottoms", "images/closet/gray-tailored-trousers.png", ["gray", "charcoal"], ["trousers", "wide leg", "tailored", "work", "dressy"]),
  createStarterItem("starter-light-wash-flare-jeans", "Light wash flare jeans", "Bottoms", "images/closet/light-wash-flare-jeans.png", ["light blue", "denim"], ["jeans", "flare", "denim", "casual"]),
  createStarterItem("starter-mojave-crop-tee", "Mojave crop tee", "Short Sleeve Tops", "images/closet/mojave-crop-tee.png", ["black", "charcoal"], ["graphic tee", "crop", "casual", "streetwear"]),
  createStarterItem("starter-tiger-print-button-up", "Tiger print button-up", "Long Sleeve Tops", "images/closet/tiger-print-button-up.png", ["black", "cream", "white"], ["tiger print", "button up", "animal print", "casual"]),
  createStarterItem("starter-navy-strapless-mini-dress", "Navy strapless mini dress", "Dresses", "images/closet/navy-strapless-mini-dress.png", ["navy", "dark blue"], ["dress", "mini", "strapless", "bodycon", "date night"]),
  createStarterItem("starter-gray-adidas-track-pants", "Gray Adidas track pants", "Bottoms", "images/closet/gray-adidas-track-pants.png", ["light gray", "white"], ["track pants", "athletic", "adidas", "activewear"]),
  createStarterItem("starter-tan-batwing-sweater", "Tan batwing sweater", "Long Sleeve Tops", "images/closet/tan-batwing-sweater.png", ["tan", "oatmeal", "cream"], ["sweater", "batwing", "oversized", "cozy", "casual"]),
  createStarterItem("starter-black-running-shorts", "Black running shorts", "Bottoms", "images/closet/black-running-shorts.png", ["black"], ["shorts", "athletic", "running", "activewear"]),
  createStarterItem("starter-burgundy-babydoll-dress", "Burgundy babydoll dress", "Dresses", "images/closet/burgundy-babydoll-dress.png", ["burgundy", "wine", "red"], ["dress", "babydoll", "slip dress", "summer", "casual"]),
  createStarterItem("starter-denim-utility-shorts", "Denim utility shorts", "Bottoms", "images/closet/denim-utility-shorts.png", ["light blue", "denim"], ["shorts", "denim", "cargo", "utility", "casual"]),
  createStarterItem("starter-black-satin-pj-shirt", "Black satin PJ shirt", "PJs", "images/closet/black-satin-pj-shirt.png", ["black", "cream"], ["pjs", "satin", "lounge", "cozy"]),
  createStarterItem("starter-black-satin-pj-shorts", "Black satin PJ shorts", "PJs", "images/closet/black-satin-pj-shorts.png", ["black", "cream"], ["pjs", "satin", "lounge", "cozy"]),
  createStarterItem("starter-blue-stripe-button-up", "Blue stripe button-up shirt", "Long Sleeve Tops", "images/closet/blue-stripe-button-up.png", ["blue", "white"], ["button up", "striped", "long sleeve", "casual"]),
  createStarterItem("starter-skull-free-graphic-tee", "Skull Free graphic baby tee", "Short Sleeve Tops", "images/closet/skull-free-graphic-tee.png", ["black", "gray"], ["graphic tee", "short sleeve", "streetwear"]),
  createStarterItem("starter-orange-paisley-tie-front-top", "Orange paisley tie-front crop top", "Short Sleeve Tops", "images/closet/orange-paisley-tie-front-top.png", ["orange", "rust"], ["crop top", "tie front", "summer", "boho"]),
  createStarterItem("starter-charcoal-marled-lounge-shorts", "Charcoal marled lounge shorts", "Bottoms", "images/closet/charcoal-marled-lounge-shorts.png", ["charcoal", "gray"], ["shorts", "lounge", "casual", "cozy"]),
  createStarterItem("starter-charcoal-crewneck-sweater", "Charcoal crewneck sweater", "Long Sleeve Tops", "images/closet/charcoal-crewneck-sweater.png", ["charcoal", "gray"], ["sweater", "crewneck", "cozy", "casual"]),
  createStarterItem("starter-dark-brown-crop-zip-hoodie", "Dark brown crop zip hoodie", "Long Sleeve Tops", "images/closet/dark-brown-crop-zip-hoodie.png", ["dark brown", "charcoal"], ["hoodie", "zip up", "crop", "cozy", "casual"]),
  createStarterItem("starter-blue-striped-wrap-skirt", "Blue striped wrap midi skirt", "Bottoms", "images/closet/blue-striped-wrap-skirt.png", ["blue", "white"], ["skirt", "midi", "striped", "wrap", "summer"]),
  createStarterItem("starter-blue-striped-strapless-top", "Blue striped strapless bandeau top", "Short Sleeve Tops", "images/closet/blue-striped-strapless-top.png", ["blue", "white"], ["strapless", "bandeau", "summer", "casual"]),
  createStarterItem("starter-baby-blue-flare-pants", "Baby blue flare lounge pants", "Bottoms", "images/closet/baby-blue-flare-pants.png", ["baby blue", "light blue"], ["wide leg", "flare", "lounge", "casual"]),
  createStarterItem("starter-black-diamond-midi-dress", "Black diamond print midi dress", "Dresses", "images/closet/black-diamond-midi-dress.png", ["black", "tan", "orange"], ["dress", "midi", "spaghetti straps", "tiered", "casual"]),
  createStarterItem("starter-white-open-knit-crop-sweater", "White open-knit crop sweater", "Long Sleeve Tops", "images/closet/white-open-knit-crop-sweater.png", ["white", "cream"], ["sweater", "knit", "crochet", "crop", "layering", "summer"]),
  createStarterItem("starter-cream-lace-ruffle-skirt", "Cream lace ruffle mini skirt", "Bottoms", "images/closet/cream-lace-ruffle-skirt.png", ["cream", "ivory"], ["skirt", "mini", "lace", "ruffle", "dressy"]),
  createStarterItem("starter-black-ribbed-long-sleeve", "Black ribbed long sleeve top", "Long Sleeve Tops", "images/closet/black-ribbed-long-sleeve.png", ["black"], ["long sleeve", "ribbed", "fitted", "basic", "casual"]),
  createStarterItem("starter-gray-boxy-tee", "Gray boxy tee", "Short Sleeve Tops", "images/closet/gray-boxy-tee.png", ["gray", "heather gray"], ["tee", "short sleeve", "basic", "casual"]),
  createStarterItem("starter-hot-pink-shoulder-bag", "Hot pink shoulder bag", "Accessories", "images/closet/hot-pink-shoulder-bag.png", ["hot pink", "fuchsia"], ["bag", "shoulder bag", "going out"]),
  createStarterItem("starter-navy-track-jacket", "Navy New York track jacket", "Long Sleeve Tops", "images/closet/navy-track-jacket.png", ["navy", "white"], ["jacket", "track jacket", "zip up", "athletic", "streetwear"]),
  createStarterItem("starter-black-eyelet-cami-top", "Black eyelet corset cami top", "Short Sleeve Tops", "images/closet/black-eyelet-cami-top.png", ["black"], ["cami", "corset", "eyelet", "summer", "going out"]),
  createStarterItem("starter-olive-leggings", "Olive high-waist leggings", "Bottoms", "images/closet/olive-leggings.png", ["olive", "green"], ["leggings", "high waist", "athletic", "activewear"]),
  createStarterItem("starter-black-athletic-leggings", "Black high-waist athletic leggings", "Bottoms", "images/closet/black-athletic-leggings.png", ["black"], ["leggings", "high waist", "athletic", "activewear"]),
  createStarterItem("starter-mint-butterfly-bag", "Mint butterfly print shoulder bag", "Accessories", "images/closet/mint-butterfly-bag.png", ["mint", "light blue"], ["bag", "shoulder bag", "casual"]),
  createStarterItem("starter-black-shoulder-bag", "Black mini shoulder bag", "Accessories", "images/closet/black-shoulder-bag.png", ["black"], ["bag", "shoulder bag", "casual", "going out"]),
  createStarterItem("starter-black-bow-print-sleep-dress", "Black bow print sleep dress", "PJs", "images/closet/black-bow-print-sleep-dress.png", ["black", "pink", "green"], ["pjs", "sleep dress", "lounge", "cozy"]),
  createStarterItem("starter-pink-plaid-sleep-dress", "Pink plaid Snooze sleep dress", "PJs", "images/closet/pink-plaid-sleep-dress.png", ["pink", "burgundy"], ["pjs", "sleep dress", "plaid", "lounge", "cozy"]),
  createStarterItem("starter-born-to-live-graphic-tee", "Born to Live skull graphic tee", "Short Sleeve Tops", "images/closet/born-to-live-graphic-tee.png", ["black", "charcoal"], ["graphic tee", "short sleeve", "casual", "streetwear"]),
  createStarterItem("starter-black-cat-eye-sunglasses", "Black cat-eye sunglasses", "Accessories", "images/closet/black-cat-eye-sunglasses.png", ["black"], ["sunglasses", "accessories"]),
  createStarterItem("starter-gold-studded-hoops", "Gold studded hoop earrings", "Accessories", "images/closet/gold-studded-hoops.png", ["gold"], ["earrings", "hoops", "jewelry", "dressy"]),
  createStarterItem("starter-tan-crossover-sandals", "Tan crossover slide sandals", "Shoes", "images/closet/tan-crossover-sandals.png", ["tan", "brown"], ["sandals", "slides", "casual", "summer"]),
  createStarterItem("starter-olive-cami-tank", "Olive cami tank", "Short Sleeve Tops", "images/closet/olive-cami-tank.png", ["olive", "green"], ["tank", "cami", "sleeveless", "casual", "summer"]),
  createStarterItem("starter-tortoise-cat-eye-sunglasses", "Tortoise cat-eye sunglasses", "Accessories", "images/closet/tortoise-cat-eye-sunglasses.png", ["brown", "tortoise"], ["sunglasses", "accessories"]),
  createStarterItem("starter-gold-buckle-bracelet", "Gold buckle bangle bracelet", "Accessories", "images/closet/gold-buckle-bracelet.png", ["gold"], ["bracelet", "jewelry", "dressy"]),
  createStarterItem("starter-gold-snake-chain-bracelet", "Gold snake chain bracelet", "Accessories", "images/closet/gold-snake-chain-bracelet.png", ["gold"], ["bracelet", "jewelry", "dressy", "layering"]),
  createStarterItem("starter-olay-football-jersey", "Olay #28 football jersey", "Short Sleeve Tops", "images/closet/olay-football-jersey.png", ["white", "black", "gold"], ["jersey", "graphic", "short sleeve", "casual", "streetwear"]),
  createStarterItem("starter-moon-graphic-tee", "Moon graphic tee", "Short Sleeve Tops", "images/closet/moon-graphic-tee.png", ["black", "gold"], ["graphic tee", "short sleeve", "casual"]),
  createStarterItem("starter-gold-pearl-rhinestone-bracelet", "Gold pearl rhinestone bracelet", "Accessories", "images/closet/gold-pearl-rhinestone-bracelet.png", ["gold", "cream", "ivory"], ["bracelet", "jewelry", "dressy", "pearl"]),
  createStarterItem("starter-black-lace-trim-cami", "Black lace-trim cami", "Short Sleeve Tops", "images/closet/black-lace-trim-cami.png", ["black"], ["cami", "lace", "sleeveless", "casual"]),
  createStarterItem("starter-blue-suede-slides", "Blue suede double-strap slides", "Shoes", "images/closet/blue-suede-slides.png", ["blue", "slate blue"], ["slides", "sandals", "casual", "summer"]),
  createStarterItem("starter-olive-lace-trim-cami", "Olive lace-trim cami", "Short Sleeve Tops", "images/closet/olive-lace-trim-cami.png", ["olive", "sage", "green"], ["cami", "lace", "sleeveless", "casual"]),
  createStarterItem("starter-black-polo-top", "Black long-sleeve polo top", "Long Sleeve Tops", "images/closet/black-polo-top.png", ["black"], ["polo", "collared", "long sleeve", "casual"]),
  createStarterItem("starter-pink-seamless-biker-shorts", "Pink seamless biker shorts", "Bottoms", "images/closet/pink-seamless-biker-shorts.png", ["pink", "dusty rose"], ["shorts", "biker", "seamless", "activewear"]),
  createStarterItem("starter-tan-flip-flops", "Tan flip flops", "Shoes", "images/closet/tan-flip-flops.png", ["tan", "gold"], ["flip flops", "sandals", "casual", "summer", "beach"]),
  createStarterItem("starter-rust-linen-tee", "Rust linen tee", "Short Sleeve Tops", "images/closet/rust-linen-tee.png", ["rust", "terracotta"], ["tee", "short sleeve", "linen", "casual", "summer"]),
  createStarterItem("starter-green-heart-baby-tee", "Green heart baby tee", "Short Sleeve Tops", "images/closet/green-heart-baby-tee.png", ["forest green", "white"], ["baby tee", "short sleeve", "fitted", "casual"]),
  createStarterItem("starter-black-crop-baby-tee", "Black crop baby tee", "Short Sleeve Tops", "images/closet/black-crop-baby-tee.png", ["black"], ["baby tee", "crop top", "short sleeve", "basic", "casual"]),
  createStarterItem("starter-navy-colorblock-tube-top", "Navy colorblock tube top", "Short Sleeve Tops", "images/closet/navy-colorblock-tube-top.png", ["navy", "white"], ["tube top", "strapless", "colorblock", "casual", "summer"]),
  createStarterItem("starter-pink-tiedye-midi-skirt", "Pink tie-dye asymmetric midi skirt", "Bottoms", "images/closet/pink-tiedye-midi-skirt.png", ["pink", "red", "magenta"], ["skirt", "midi", "tie-dye", "asymmetric", "summer"]),
  createStarterItem("starter-hot-pink-one-piece", "Hot pink one-piece swimsuit", "Swimsuit", "images/closet/hot-pink-one-piece.png", ["hot pink", "fuchsia"], ["one piece", "swimwear", "summer", "beach"]),
  createStarterItem("starter-red-plaid-flannel", "Red plaid flannel shirt", "Long Sleeve Tops", "images/closet/red-plaid-flannel.png", ["red", "brown", "tan"], ["flannel", "plaid", "button up", "long sleeve", "casual", "layering"]),
  createStarterItem("starter-black-long-sleeve-fitted", "Black long-sleeve fitted top", "Long Sleeve Tops", "images/closet/black-long-sleeve-fitted.png", ["black"], ["long sleeve", "fitted", "basic", "casual"]),
  createStarterItem("starter-purple-camo-sports-bra", "Purple camo sports bra", "Short Sleeve Tops", "images/closet/purple-camo-sports-bra.png", ["purple", "mauve", "lavender"], ["sports bra", "activewear", "camo", "athletic"]),
  createStarterItem("starter-wildflower-tube-top", "Wildflower tube top", "Short Sleeve Tops", "images/closet/wildflower-tube-top.png", ["cream", "ivory", "yellow"], ["tube top", "strapless", "graphic", "casual", "summer", "boho"]),
  createStarterItem("starter-we-dont-give-up-crop-tank", "We Don't Give Up crop tank", "Short Sleeve Tops", "images/closet/we-dont-give-up-crop-tank.png", ["lavender", "purple"], ["crop top", "tank", "graphic", "casual"]),
  createStarterItem("starter-navy-dotted-chiffon-blouse", "Navy dotted chiffon blouse", "Long Sleeve Tops", "images/closet/navy-dotted-chiffon-blouse.png", ["navy", "dark blue"], ["blouse", "chiffon", "long sleeve", "dressy", "work"]),
  createStarterItem("starter-black-slingback-heels", "Black patent slingback heels", "Shoes", "images/closet/black-slingback-heels.png", ["black"], ["heels", "slingback", "patent", "pointed toe", "dressy"]),
  createStarterItem("starter-blue-sleeveless-button-up", "Blue sleeveless button-up shirt", "Short Sleeve Tops", "images/closet/blue-sleeveless-button-up.png", ["blue", "light blue"], ["button up", "sleeveless", "casual", "summer"]),
  createStarterItem("starter-pink-marble-tube-top", "Pink marble ruched tube top", "Short Sleeve Tops", "images/closet/pink-marble-tube-top.png", ["pink", "gold", "blush"], ["tube top", "strapless", "ruched", "going out", "dressy"]),
  createStarterItem("starter-lavender-off-shoulder-crop", "Lavender off-shoulder crop top", "Short Sleeve Tops", "images/closet/lavender-off-shoulder-crop.png", ["lavender", "purple"], ["off shoulder", "crop top", "casual", "summer"]),
  createStarterItem("starter-gold-flat-hoop-earrings", "Gold flat hoop earrings", "Accessories", "images/closet/gold-flat-hoop-earrings.png", ["gold"], ["earrings", "hoops", "jewelry", "dressy", "casual"]),
  createStarterItem("starter-black-mini-skirt", "Black mini skirt", "Bottoms", "images/closet/black-mini-skirt.png", ["black"], ["skirt", "mini", "casual", "going out"]),
  createStarterItem("starter-black-floral-velvet-top", "Black floral velvet bell-sleeve top", "Long Sleeve Tops", "images/closet/black-floral-velvet-top.png", ["black"], ["velvet", "floral", "bell sleeve", "going out", "dressy"]),
];

const topCategories = ["Tops", "Short Sleeve Tops", "Long Sleeve Tops"];

const PRESET_TAGS = [
  { group: "Occasion", tags: ["work", "interview", "date night", "travel", "going out", "lounge"] },
  { group: "Mood",     tags: ["effortless", "confident", "comfy", "romantic"] },
  { group: "Season",   tags: ["summer", "winter", "layering", "hot day"] },
  { group: "Aesthetic",tags: ["earthy", "coastal", "classic", "minimal"] },
  { group: "Style",    tags: ["casual", "professional", "movement", "streetwear", "dressy", "boho"] },
];

migratePreviouslyRemovedStarters();
renderApp();
showView(getViewFromHash());
cleanBrokenWardrobe();

// View navigation: shows one main feature at a time.
navButtons.forEach((button) => {
  button.addEventListener("click", () => {
    showView(button.dataset.viewTarget);
  });
});

openDialogButton.addEventListener("click", openItemDialog);
emptyAddButton.addEventListener("click", openItemDialog);
closeDialogButton.addEventListener("click", closeItemDialog);
document.getElementById("close-edit-dialog").addEventListener("click", () => editDialog.close());

editForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const id = editItemIdInput.value;
  const name = editItemNameInput.value.trim();
  const category = editItemCategorySelect.value;
  const colors = parseList(editItemColorsInput.value);
  const tags = parseList(editItemTagsInput.value);

  if (!name || !category) return;

  const starterItem = starterWardrobeItems.find((entry) => entry.id === id);
  const regularItem = wardrobeItems.find((entry) => entry.id === id);

  if (starterItem && !regularItem) {
    wardrobeItems.unshift({ ...starterItem, name, category, colors, tags, isStarter: false, createdAt: new Date().toISOString() });
    hiddenStarterItemIds = [...new Set([...hiddenStarterItemIds, id])];
  } else if (regularItem) {
    regularItem.name = name;
    regularItem.category = category;
    regularItem.colors = colors;
    regularItem.tags = tags;
  }

  saveItems();
  saveClosetAndTrash();
  renderApp();
  renderPracticeCarousels();
  editDialog.close();
});

trayFilterBar.addEventListener("click", (event) => {
  const btn = event.target.closest("[data-tray-filter]");
  if (!btn) return;
  collageTrayFilter = btn.dataset.trayFilter;
  renderCollageTray();
});

collageTrayItems.addEventListener("click", (event) => {
  const piece = event.target.closest("[data-item-id]");
  if (!piece) return;
  addItemToCollage(piece.dataset.itemId);
});

collageCanvas.addEventListener("click", (event) => {
  const removeButton = event.target.closest("[data-remove-piece]");
  const resizeButton = event.target.closest("[data-resize-piece]");
  const layerButton = event.target.closest("[data-layer-piece]");

  if (removeButton) {
    collagePieces = collagePieces.filter((piece) => piece.canvasId !== removeButton.dataset.removePiece);
    if (collageSelectedId === removeButton.dataset.removePiece) collageSelectedId = null;
    renderCollageCanvas();
    return;
  }

  if (resizeButton) {
    const piece = collagePieces.find((p) => p.canvasId === resizeButton.dataset.resizePiece);
    if (piece) {
      piece.size = clamp((piece.size || 130) + Number(resizeButton.dataset.delta), 60, 280);
      renderCollageCanvas();
    }
    return;
  }

  if (layerButton) {
    const piece = collagePieces.find((p) => p.canvasId === layerButton.dataset.layerPiece);
    if (piece) {
      piece.z = (piece.z || 0) + Number(layerButton.dataset.layerDir);
      renderCollageCanvas();
    }
    return;
  }

  if (!event.target.closest(".collage-piece")) {
    collageSelectedId = null;
    renderCollageCanvas();
  }
});

collageCanvas.addEventListener("pointerdown", (event) => {
  const pieceNode = event.target.closest(".collage-piece");
  if (!pieceNode || event.target.closest("button")) return;

  const piece = collagePieces.find((item) => item.canvasId === pieceNode.dataset.canvasId);
  if (!piece) return;

  collageDragMoved = false;
  const rect = collageCanvas.getBoundingClientRect();
  collagePointerDrag = {
    piece,
    startX: event.clientX,
    startY: event.clientY,
    offsetX: event.clientX - rect.left - piece.x,
    offsetY: event.clientY - rect.top - piece.y,
  };
  pieceNode.setPointerCapture(event.pointerId);
});

collageCanvas.addEventListener("pointermove", (event) => {
  if (!collagePointerDrag) return;

  const dx = event.clientX - collagePointerDrag.startX;
  const dy = event.clientY - collagePointerDrag.startY;
  if (Math.abs(dx) > 4 || Math.abs(dy) > 4) collageDragMoved = true;

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
    if (!collageDragMoved) {
      collageSelectedId = collagePointerDrag.piece.canvasId;
    } else {
      collagePointerDrag.piece.z = Math.max(0, ...collagePieces.map((p) => p.z || 0)) + 1;
    }
    collagePointerDrag = null;
    renderCollageCanvas();
  }
});

collageCanvas.addEventListener("pointercancel", () => {
  if (!collagePointerDrag) return;
  collagePointerDrag.piece.z = Math.max(0, ...collagePieces.map((p) => p.z || 0)) + 1;
  collagePointerDrag = null;
  renderCollageCanvas();
});

savePracticeOutfitForm.addEventListener("submit", savePracticeOutfit);
exportWardrobeButton.addEventListener("click", exportWardrobe);
importWardrobeInput.addEventListener("change", importWardrobe);

saveCollageForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (collagePieces.length === 0) {
    collageNameInput.placeholder = "Add at least one piece first...";
    return;
  }

  const canvasRect = collageCanvas.getBoundingClientRect();
  const collage = {
    id: crypto.randomUUID(),
    name: collageNameInput.value.trim(),
    background: collageBackground,
    canvasWidth: canvasRect.width,
    canvasHeight: canvasRect.height,
    pieceIds: collagePieces.map((p) => p.itemId),
    layout: collagePieces.map(({ itemId, x, y, z, size }) => ({ itemId, x, y, z: z || 0, size: size || 130 })),
    createdAt: new Date().toISOString(),
  };

  savedCollages.unshift(collage);
  localStorage.setItem(collagesKey, JSON.stringify(savedCollages));
  collageNameInput.value = "";
  collagePieces = [];
  collageSelectedId = null;
  renderCollageCanvas();
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
  if (restoreButton) restoreItem(restoreButton.dataset.restoreItem);
});

document.getElementById("open-laundry").addEventListener("click", () => {
  renderLaundryDialog();
  laundryDialog.showModal();
});
document.getElementById("close-laundry").addEventListener("click", () => laundryDialog.close());
document.getElementById("wash-all").addEventListener("click", washAll);

laundryList.addEventListener("click", (event) => {
  const cleanBtn = event.target.closest("[data-clean-id]");
  if (cleanBtn) markClean(cleanBtn.dataset.cleanId);
});

document.getElementById("close-detail-dialog").addEventListener("click", () => itemDetailDialog.close());

itemDetailDialog.addEventListener("click", (event) => {
  const editBtn = event.target.closest("#detail-edit-btn");
  const dirtyBtn = event.target.closest("#detail-dirty-btn");
  const deleteBtn = event.target.closest("#detail-delete-btn");

  if (editBtn) {
    itemDetailDialog.close();
    openEditDialog(editBtn.dataset.editId);
  } else if (dirtyBtn) {
    const id = dirtyBtn.dataset.dirtyId;
    if (dirtyBtn.dataset.dirtyAction === "clean") {
      markClean(id);
    } else {
      markDirty(id, null);
    }
    itemDetailDialog.close();
  } else if (deleteBtn) {
    itemDetailDialog.close();
    deleteItem(deleteBtn.dataset.id);
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

  if (deleteButton && deleteButton.dataset.id) {
    deleteItem(deleteButton.dataset.id);
  }

  if (deleteButton && deleteButton.dataset.deleteOutfit) {
    deleteOutfit(deleteButton.dataset.deleteOutfit);
  }

  if (deleteButton && deleteButton.dataset.deleteCollage) {
    deleteCollage(deleteButton.dataset.deleteCollage);
  }

  const editButton = event.target.closest("[data-edit-id]");
  if (editButton) {
    openEditDialog(editButton.dataset.editId);
  }

  const editCollageButton = event.target.closest("[data-edit-collage]");
  if (editCollageButton) {
    loadCollageForEditing(editCollageButton.dataset.editCollage);
  }

  const dirtyBtn = event.target.closest("[data-dirty-id]");
  if (dirtyBtn) {
    const card = dirtyBtn.closest(".outfit-card");
    markDirty(dirtyBtn.dataset.dirtyId, card);
  }

  const cardImageWrap = event.target.closest(".card-image-wrap");
  if (cardImageWrap && !event.target.closest("button")) {
    const card = cardImageWrap.closest("[data-item-id]");
    if (card) openItemDetail(card.dataset.itemId);
  }
});

suggestionForm.addEventListener("submit", (event) => {
  event.preventDefault();
  renderSuggestions(occasionInput.value);
});

outfitModeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setPracticeMode(button.dataset.outfitMode);
  });
});

document.getElementById("vibe-tabs").addEventListener("click", (event) => {
  const tabBtn = event.target.closest("[data-vibe-id]");
  const editBtn = event.target.closest("[data-vibe-edit]");
  const deleteBtn = event.target.closest("[data-vibe-delete]");
  const addBtn = event.target.closest("[data-vibe-add]");

  if (tabBtn) {
    activeVibe = tabBtn.dataset.vibeId;
    practiceIndices = { top: 0, bottom: 0, dress: 0, shoe: 0 };
    renderVibeTabs();
    renderPracticeCarousels();
  }

  if (editBtn) {
    const tab = vibeTabs.find((t) => t.id === editBtn.dataset.vibeEdit);
    if (!tab) return;
    const newLabel = window.prompt("Edit vibe name:", tab.label);
    if (!newLabel || !newLabel.trim()) return;
    tab.label = newLabel.trim();
    tab.filter = newLabel.trim().toLowerCase();
    localStorage.setItem(vibeTabsKey, JSON.stringify(vibeTabs));
    renderVibeTabs();
    renderPracticeCarousels();
  }

  if (deleteBtn) {
    const id = deleteBtn.dataset.vibeDelete;
    if (!window.confirm("Remove this vibe tab?")) return;
    vibeTabs = vibeTabs.filter((t) => t.id !== id);
    if (activeVibe === id) activeVibe = "vibe-all";
    localStorage.setItem(vibeTabsKey, JSON.stringify(vibeTabs));
    renderVibeTabs();
    renderPracticeCarousels();
  }

  if (addBtn) {
    openVibePicker();
  }
});

document.getElementById("practice-carousels").addEventListener("click", (event) => {
  const prevBtn = event.target.closest("[data-carousel-prev]");
  const nextBtn = event.target.closest("[data-carousel-next]");

  if (prevBtn) {
    const type = prevBtn.dataset.carouselPrev;
    const items = getCarouselItems(type);
    practiceIndices[type] = wrapIndex(practiceIndices[type] - 1, items.length);
    renderPracticeCarousels();
  }

  if (nextBtn) {
    const type = nextBtn.dataset.carouselNext;
    const items = getCarouselItems(type);
    practiceIndices[type] = wrapIndex(practiceIndices[type] + 1, items.length);
    renderPracticeCarousels();
  }
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

async function cleanBrokenWardrobe() {
  const results = await Promise.all(
    wardrobeItems.map(
      (item) =>
        new Promise((resolve) => {
          const img = new Image();
          img.onload = () => resolve(null);
          img.onerror = () => resolve(item.id);
          img.src = item.photo;
        })
    )
  );
  const brokenIds = results.filter(Boolean);
  if (brokenIds.length > 0) {
    wardrobeItems = wardrobeItems.filter((i) => !brokenIds.includes(i.id));
    localStorage.setItem(storageKey, JSON.stringify(wardrobeItems));
    renderApp();
  }
}

function renderApp() {
  renderStats();
  renderCloset();
  renderCollageTray();
  renderVibeTabs();
  renderPracticeCarousels();
  updateTrashSummary();
  updateLaundrySummary();
  updateClosetActionButtons();
}

function renderStats() {
  const allItems = getAllClosetItems();
  itemCount.textContent = allItems.length;
  outfitCount.textContent = savedOutfits.length + savedCollages.length;
  favoriteCount.textContent = allItems.filter((item) => item.favorite).length;
}

function centerAllPreviews() {
  document.querySelectorAll(".saved-outfit-images, .collage-preview").forEach((container) => {
    const containerW = container.offsetWidth;
    const containerH = container.offsetHeight;
    if (!containerW || !containerH) return;

    const imgs = [...container.querySelectorAll("img[data-base-left]")];
    if (!imgs.length) return;

    const positions = imgs.map((img) => {
      const x = (parseFloat(img.dataset.baseLeft) / 100) * containerW;
      const y = (parseFloat(img.dataset.baseTop) / 100) * containerH;
      const w = (parseFloat(img.dataset.baseWidth) / 100) * containerW;
      const h = img.offsetHeight || w;
      return { img, x, y, w, h };
    });

    const minX = Math.min(...positions.map((p) => p.x));
    const minY = Math.min(...positions.map((p) => p.y));
    const maxX = Math.max(...positions.map((p) => p.x + p.w));
    const maxY = Math.max(...positions.map((p) => p.y + p.h));
    const dx = containerW / 2 - (minX + maxX) / 2;
    const dy = containerH / 2 - (minY + maxY) / 2;

    positions.forEach(({ img, x, y, w, h }) => {
      img.style.left = `${clamp(x + dx, 0, containerW - w)}px`;
      img.style.top = `${clamp(y + dy, 0, containerH - h)}px`;
    });
  });
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
  requestAnimationFrame(centerAllPreviews);
}

function getVisibleItems() {
  return getAllClosetItems().filter((item) => {
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

function createItemCard(item) {
  const card = itemTemplate.content.firstElementChild.cloneNode(true);
  card.dataset.itemId = item.id;

  const cardImg = card.querySelector(".card-image");
  cardImg.src = item.photo;
  cardImg.alt = item.name;
  cardImg.onerror = () => card.remove();
  card.querySelector(".card-name").textContent = item.name;
  card.querySelector(".card-category").textContent = item.category;

  const favoriteButton = card.querySelector(".favorite-button");
  favoriteButton.dataset.id = item.id;
  favoriteButton.classList.toggle("is-favorite", item.favorite);
  favoriteButton.textContent = item.favorite ? "♥" : "♡";
  favoriteButton.hidden = item.isStarter;

  const deleteButton = card.querySelector(".delete-item");
  deleteButton.dataset.id = item.id;
  deleteButton.classList.remove("text-button");
  deleteButton.classList.add("delete-button");

  const editButton = document.createElement("button");
  editButton.className = "edit-button";
  editButton.dataset.editId = item.id;
  editButton.type = "button";
  editButton.textContent = "Edit";

  const dirtyButton = document.createElement("button");
  dirtyButton.className = "dirty-button text-button";
  dirtyButton.dataset.dirtyId = item.id;
  dirtyButton.type = "button";
  dirtyButton.textContent = "Dirty";

  card.querySelector(".card-body").append(editButton, dirtyButton);

  const tagList = card.querySelector(".tag-list");
  [...item.colors, ...item.tags].forEach((tag) => {
    tagList.append(createTag(tag));
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

  const categoryOrder = ["Bottoms", "Tops", "Short Sleeve Tops", "Long Sleeve Tops", "Dresses", "Shoes", "Accessories"];
  const sortedOutfitPieces = pieces.sort((a, b) => {
    const ai = categoryOrder.findIndex((c) => a.category?.includes(c) || c === a.category);
    const bi = categoryOrder.findIndex((c) => b.category?.includes(c) || c === b.category);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });
  const outfitLayouts = [
    { left: "8%",  top: "5%",  width: "52%", zIndex: 1 },
    { left: "38%", top: "2%",  width: "44%", zIndex: 2 },
    { left: "18%", top: "48%", width: "34%", zIndex: 3 },
    { left: "55%", top: "50%", width: "26%", zIndex: 4 },
    { left: "5%",  top: "30%", width: "30%", zIndex: 2 },
    { left: "60%", top: "30%", width: "26%", zIndex: 2 },
  ];
  sortedOutfitPieces.forEach((piece, index) => {
    const pos = outfitLayouts[index] || outfitLayouts[outfitLayouts.length - 1];
    const image = document.createElement("img");
    image.src = piece.photo;
    image.alt = piece.name;
    image.style.position = "absolute";
    image.style.objectFit = "contain";
    image.style.width = pos.width;
    image.style.left = pos.left;
    image.style.top = pos.top;
    image.style.zIndex = String(pos.zIndex);
    image.dataset.baseLeft = String(parseFloat(pos.left));
    image.dataset.baseTop = String(parseFloat(pos.top));
    image.dataset.baseWidth = String(parseFloat(pos.width));
    image.addEventListener("load", () => requestAnimationFrame(centerAllPreviews), { once: true });
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
  const deleteBtn = document.createElement("button");
  deleteBtn.className = "delete-item text-button";
  deleteBtn.dataset.deleteOutfit = outfit.id;
  deleteBtn.textContent = "Remove";
  body.append(deleteBtn);

  article.append(images, body);
  return article;
}

function createTag(label) {
  const tag = document.createElement("span");
  tag.className = "tag";
  tag.textContent = label;
  return tag;
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

function deleteItem(id) {
  const item = getAllClosetItems().find((entry) => entry.id === id);

  if (!item || !window.confirm(`Move "${item.name}" to Trash?`)) {
    return;
  }

  moveItemToTrash(item, true);
}

function deleteOutfit(id) {
  const outfit = savedOutfits.find((o) => o.id === id);
  if (!outfit || !window.confirm(`Move "${outfit.name}" to Trash?`)) return;
  savedOutfits = savedOutfits.filter((o) => o.id !== id);
  trashedItems.unshift({ ...outfit, itemType: "outfit" });
  localStorage.setItem(outfitsKey, JSON.stringify(savedOutfits));
  saveClosetAndTrash();
  renderApp();
  renderTrashIfOpen();
}

function deleteCollage(id) {
  const collage = savedCollages.find((c) => c.id === id);
  if (!collage || !window.confirm(`Move "${collage.name}" to Trash?`)) return;
  savedCollages = savedCollages.filter((c) => c.id !== id);
  trashedItems.unshift({ ...collage, itemType: "collage" });
  localStorage.setItem(collagesKey, JSON.stringify(savedCollages));
  saveClosetAndTrash();
  renderApp();
  renderTrashIfOpen();
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

  collagePieces = collagePieces.filter((piece) => piece.itemId !== item.id);
  saveClosetAndTrash();

  if (recordAction) {
    recordClosetAction("remove", item);
  }

  renderApp();
  renderTrashIfOpen();
}

function restoreItem(id, recordAction = true) {
  const item = trashedItems.find((entry) => entry.id === id);

  if (!item) {
    return;
  }

  trashedItems = trashedItems.filter((entry) => entry.id !== id);

  if (item.itemType === "outfit") {
    if (!savedOutfits.some((o) => o.id === id)) savedOutfits.unshift(item);
    localStorage.setItem(outfitsKey, JSON.stringify(savedOutfits));
  } else if (item.itemType === "collage") {
    if (!savedCollages.some((c) => c.id === id)) savedCollages.unshift(item);
    localStorage.setItem(collagesKey, JSON.stringify(savedCollages));
  } else {
    if (item.isStarter) {
      hiddenStarterItemIds = hiddenStarterItemIds.filter((itemId) => itemId !== id);
    } else if (!wardrobeItems.some((entry) => entry.id === id)) {
      wardrobeItems.unshift(item);
    }
    if (recordAction) {
      recordClosetAction("restore", item);
    }
  }

  saveClosetAndTrash();
  renderApp();
  renderTrashIfOpen();
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
  renderTrashIfOpen();
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

    if (item.itemType === "outfit" || item.itemType === "collage") {
      const swatchColor = item.itemType === "collage" ? (item.background || "#d4c5b0") : "#d4c5b0";
      article.innerHTML = `
        <div class="trash-outfit-swatch" style="background:${swatchColor}"></div>
        <div>
          <h3>${escapeHtml(item.name)}</h3>
          <p>${item.itemType === "collage" ? "Collage" : "Full Outfit"}</p>
        </div>
        <button class="utility-button" data-restore-item="${item.id}" type="button">Restore</button>
      `;
    } else {
      article.innerHTML = `
        <img src="${item.photo}" alt="${escapeHtml(item.name)}" />
        <div>
          <h3>${escapeHtml(item.name)}</h3>
          <p>${escapeHtml(item.category)}</p>
        </div>
        <button class="utility-button" data-restore-item="${item.id}" type="button">Restore</button>
      `;
    }

    trashList.append(article);
  });

  trashCount.textContent = trashedItems.length;
  trashEmpty.hidden = trashedItems.length > 0;
  emptyTrashButton.disabled = trashedItems.length === 0;
}

function updateTrashSummary() {
  trashCount.textContent = trashedItems.length;
}

function renderTrashIfOpen() {
  if (trashDialog.open) {
    renderTrash();
  }
}

function markDirty(id, cardEl) {
  if (!laundryItems.includes(id)) {
    laundryItems.push(id);
    localStorage.setItem(laundryKey, JSON.stringify(laundryItems));
  }
  animateDirty(cardEl);
  updateLaundrySummary();
  renderApp();
}

function markClean(id) {
  laundryItems = laundryItems.filter((i) => i !== id);
  localStorage.setItem(laundryKey, JSON.stringify(laundryItems));
  updateLaundrySummary();
  renderLaundryDialog();
  renderApp();
}

function washAll() {
  laundryItems = [];
  localStorage.setItem(laundryKey, JSON.stringify(laundryItems));
  updateLaundrySummary();
  renderLaundryDialog();
  renderApp();
}

function updateLaundrySummary() {
  laundryCountEl.textContent = laundryItems.length;
}

function renderLaundryDialog() {
  laundryList.innerHTML = "";
  const allItems = getAllClosetItems();
  const dirtyItems = laundryItems
    .map((id) => allItems.find((item) => item.id === id))
    .filter(Boolean);

  laundryEmpty.hidden = dirtyItems.length > 0;
  washAllButton.disabled = dirtyItems.length === 0;

  dirtyItems.forEach((item) => {
    const row = document.createElement("div");
    row.className = "trash-item";
    row.innerHTML = `
      <img src="${escapeHtml(item.photo)}" alt="${escapeHtml(item.name)}" style="width:48px;height:48px;object-fit:contain;border-radius:6px;background:#f5ede4;" />
      <span>${escapeHtml(item.name)}</span>
      <button class="utility-button" data-clean-id="${escapeHtml(item.id)}" type="button">Clean</button>
    `;
    laundryList.append(row);
  });
}

function animateDirty(cardEl) {
  if (!cardEl) return;
  const cardRect = cardEl.getBoundingClientRect();
  const basketBtn = document.getElementById("open-laundry");
  if (!basketBtn) return;
  const basketRect = basketBtn.getBoundingClientRect();

  const ghost = document.createElement("div");
  ghost.style.cssText = `
    position:fixed;left:${cardRect.left}px;top:${cardRect.top}px;
    width:${cardRect.width}px;height:${Math.round(cardRect.height * 0.4)}px;
    background:var(--dusty-rose,#e8d0c5);border-radius:10px;
    pointer-events:none;z-index:9999;
    transition:all 0.45s cubic-bezier(0.4,0,0.2,1);opacity:0.9;
  `;
  document.body.appendChild(ghost);
  requestAnimationFrame(() => requestAnimationFrame(() => {
    ghost.style.left = `${basketRect.left + basketRect.width / 2 - 20}px`;
    ghost.style.top = `${basketRect.top}px`;
    ghost.style.width = "40px";
    ghost.style.height = "40px";
    ghost.style.borderRadius = "50%";
    ghost.style.opacity = "0";
    ghost.style.transform = "scale(0.2)";
  }));
  setTimeout(() => ghost.remove(), 500);
}

function openItemDetail(id) {
  const allItems = getAllClosetItems();
  const item = allItems.find((i) => i.id === id);
  if (!item) return;

  document.getElementById("detail-photo").src = item.photo;
  document.getElementById("detail-photo").alt = item.name;
  document.getElementById("detail-name").textContent = item.name;
  document.getElementById("detail-category").textContent = item.category;

  const tagList = document.getElementById("detail-tags");
  tagList.innerHTML = "";
  [...item.colors, ...item.tags].forEach((tag) => tagList.append(createTag(tag)));

  document.getElementById("detail-edit-btn").dataset.editId = id;
  document.getElementById("detail-dirty-btn").dataset.dirtyId = id;
  document.getElementById("detail-delete-btn").dataset.id = id;

  const dirtyBtn = document.getElementById("detail-dirty-btn");
  const isInLaundry = laundryItems.includes(id);
  dirtyBtn.textContent = isInLaundry ? "Mark clean" : "Mark dirty";
  dirtyBtn.dataset.dirtyAction = isInLaundry ? "clean" : "dirty";

  itemDetailDialog.showModal();
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

function openEditDialog(id) {
  const item = getAllClosetItems().find((entry) => entry.id === id);
  if (!item) return;

  editItemIdInput.value = id;
  editItemNameInput.value = item.name;
  editItemCategorySelect.value = item.category;
  editItemColorsInput.value = item.colors.join(", ");

  const picker = document.getElementById("edit-tag-picker");
  picker.innerHTML = "";
  const currentTags = item.tags || [];

  function syncTagInput() {
    const activeTags = [...picker.querySelectorAll(".tag-chip.active")].map((c) => c.dataset.vibe);
    editItemTagsInput.value = activeTags.join(", ");
  }

  function makeChip(label, value) {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.dataset.vibe = value;
    chip.className = "tag-chip" + (currentTags.some((t) => t.toLowerCase() === value.toLowerCase()) ? " active" : "");
    chip.textContent = label;
    chip.addEventListener("click", () => { chip.classList.toggle("active"); syncTagInput(); });
    return chip;
  }

  PRESET_TAGS.forEach(({ group, tags }) => {
    const label = document.createElement("p");
    label.className = "tag-group-label";
    label.textContent = group;
    picker.appendChild(label);
    const row = document.createElement("div");
    row.className = "tag-group-row";
    tags.forEach((tag) => row.appendChild(makeChip(tag, tag)));
    picker.appendChild(row);
  });

  const customVibes = vibeTabs.filter(
    (tab) => tab.filter !== "all" && tab.filter !== "favorites" &&
    !PRESET_TAGS.flatMap((g) => g.tags).includes(tab.filter)
  );
  if (customVibes.length > 0) {
    const label = document.createElement("p");
    label.className = "tag-group-label";
    label.textContent = "My vibes";
    picker.appendChild(label);
    const row = document.createElement("div");
    row.className = "tag-group-row";
    customVibes.forEach((tab) => row.appendChild(makeChip(tab.label, tab.filter)));
    picker.appendChild(row);
  }

  editItemTagsInput.value = currentTags.join(", ");

  editDialog.showModal();
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
  return window.location.hash.replace("#", "") || "style-me";
}

function setPracticeMode(mode) {
  practiceOutfitMode = mode;
  outfitModeButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.outfitMode === mode);
  });
  practiceIndices = { top: 0, bottom: 0, dress: 0, shoe: 0 };
  renderPracticeCarousels();
}

function getCurrentPracticePieces() {
  if (practiceOutfitMode === "dress") {
    const dresses = getCarouselItems("dress");
    const shoes = getCarouselItems("shoe");
    return [
      dresses[wrapIndex(practiceIndices.dress, dresses.length)],
      shoes[wrapIndex(practiceIndices.shoe, shoes.length)],
    ].filter((item) => item?.id);
  }

  const tops = getCarouselItems("top");
  const bottoms = getCarouselItems("bottom");
  const shoes = getCarouselItems("shoe");
  return [
    tops[wrapIndex(practiceIndices.top, tops.length)],
    bottoms[wrapIndex(practiceIndices.bottom, bottoms.length)],
    shoes[wrapIndex(practiceIndices.shoe, shoes.length)],
  ].filter((item) => item?.id);
}

function savePracticeOutfit(event) {
  event.preventDefault();

  const name = practiceOutfitNameInput.value.trim();
  const pieces = getCurrentPracticePieces();

  if (!name || pieces.length === 0) {
    practiceOutfitNameInput.focus();
    return;
  }

  savedOutfits.unshift({
    id: crypto.randomUUID(),
    name,
    pieceIds: pieces.map((item) => item.id),
    createdAt: new Date().toISOString(),
  });
  localStorage.setItem(outfitsKey, JSON.stringify(savedOutfits));
  practiceOutfitNameInput.value = "";
  activeCategory = "Full Outfits";
  categoryFilters.querySelectorAll(".filter-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.category === activeCategory);
  });
  renderApp();
}

function getPracticeItems(categories) {
  return getAllClosetItems()
    .filter((item) => categories.includes(item.category) && !laundryItems.includes(item.id))
    .map((item) => ({
      id: item.id,
      name: item.name,
      photo: item.photo,
      tags: item.tags || [],
      favorite: item.favorite || false,
    }));
}

function getVibeFilteredItems(categories) {
  const all = getPracticeItems(categories);
  const tab = vibeTabs.find((t) => t.id === activeVibe);

  if (!tab || tab.filter === "all") return all;
  if (tab.filter === "favorites") return all.filter((item) => item.favorite);

  return all.filter((item) =>
    item.tags.some((tag) => tag.toLowerCase().includes(tab.filter.toLowerCase()))
  );
}

function getCarouselItems(type) {
  if (type === "top") return getVibeFilteredItems(topCategories);
  if (type === "bottom") return getVibeFilteredItems(["Bottoms"]);
  if (type === "dress") return getVibeFilteredItems(["Dresses"]);
  if (type === "shoe") return getVibeFilteredItems(["Shoes"]);
  return [];
}

function addVibetab(label) {
  const filter = label.trim().toLowerCase();
  if (!filter || vibeTabs.some((t) => t.filter === filter)) return;
  vibeTabs.push({ id: crypto.randomUUID(), label: label.trim(), filter });
  localStorage.setItem(vibeTabsKey, JSON.stringify(vibeTabs));
  renderVibeTabs();
}

function openVibePicker() {
  const dialog = document.getElementById("vibe-picker-dialog");
  const presetsEl = document.getElementById("vibe-picker-presets");
  presetsEl.innerHTML = "";

  PRESET_TAGS.forEach(({ group, tags }) => {
    const label = document.createElement("p");
    label.className = "tag-group-label";
    label.textContent = group;
    presetsEl.appendChild(label);
    const row = document.createElement("div");
    row.className = "tag-group-row";
    tags.forEach((tag) => {
      const already = vibeTabs.some((t) => t.filter === tag);
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "tag-chip" + (already ? " active" : "");
      chip.textContent = tag;
      chip.disabled = already;
      chip.addEventListener("click", () => {
        addVibetab(tag);
        chip.classList.add("active");
        chip.disabled = true;
      });
      row.appendChild(chip);
    });
    presetsEl.appendChild(row);
  });

  dialog.showModal();
}

document.getElementById("close-vibe-picker").addEventListener("click", () => {
  document.getElementById("vibe-picker-dialog").close();
});

document.getElementById("vibe-custom-add").addEventListener("click", () => {
  const input = document.getElementById("vibe-custom-input");
  addVibetab(input.value);
  input.value = "";
  document.getElementById("vibe-picker-dialog").close();
});

document.getElementById("vibe-custom-input").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    document.getElementById("vibe-custom-add").click();
  }
});

function renderVibeTabs() {
  const nav = document.getElementById("vibe-tabs");
  nav.innerHTML = "";

  vibeTabs.forEach((tab) => {
    const row = document.createElement("div");
    row.className = "vibe-tab-row" + (tab.id === activeVibe ? " active" : "");

    const btn = document.createElement("button");
    btn.className = "vibe-tab-btn";
    btn.dataset.vibeId = tab.id;
    btn.type = "button";
    btn.textContent = tab.label;
    row.append(btn);

    if (tab.filter !== "all" && tab.filter !== "favorites") {
      const editBtn = document.createElement("button");
      editBtn.className = "vibe-tab-edit";
      editBtn.dataset.vibeEdit = tab.id;
      editBtn.type = "button";
      editBtn.setAttribute("aria-label", `Edit ${tab.label}`);
      editBtn.textContent = "✎";

      const delBtn = document.createElement("button");
      delBtn.className = "vibe-tab-delete";
      delBtn.dataset.vibeDelete = tab.id;
      delBtn.type = "button";
      delBtn.setAttribute("aria-label", `Delete ${tab.label}`);
      delBtn.textContent = "\xd7";

      row.append(editBtn, delBtn);
    }

    nav.append(row);
  });

  const addRow = document.createElement("div");
  addRow.className = "vibe-tab-add-row";

  const addBtn = document.createElement("button");
  addBtn.className = "vibe-tab-add";
  addBtn.dataset.vibeAdd = "";
  addBtn.type = "button";
  addBtn.textContent = "+ Add vibe";
  addRow.append(addBtn);

  nav.append(addRow);
}

function buildCarousel(label, items, type, index) {
  const section = document.createElement("div");
  section.className = "carousel-section";

  const pieceLabel = document.createElement("p");
  pieceLabel.className = "piece-label";
  pieceLabel.textContent = label;
  section.append(pieceLabel);

  const display = items[index] || createEmptyPracticeItem(`Add a ${label.toLowerCase()}`);
  const isTall = type === "dress";

  const img = document.createElement("img");
  img.className = "carousel-image" + (isTall ? " tall" : "");
  img.src = display.photo;
  img.alt = display.name;
  section.append(img);

  if (items.length === 0) {
    const empty = document.createElement("p");
    empty.className = "carousel-empty";
    empty.textContent = "No items match this vibe.";
    section.append(empty);
    return section;
  }

  const controls = document.createElement("div");
  controls.className = "carousel-controls";

  const prevBtn = document.createElement("button");
  prevBtn.dataset.carouselPrev = type;
  prevBtn.type = "button";
  prevBtn.setAttribute("aria-label", `Previous ${label}`);
  prevBtn.textContent = "◄";

  const nameSpan = document.createElement("span");
  nameSpan.textContent = display.name;

  const nextBtn = document.createElement("button");
  nextBtn.dataset.carouselNext = type;
  nextBtn.type = "button";
  nextBtn.setAttribute("aria-label", `Next ${label}`);
  nextBtn.textContent = "►";

  controls.append(prevBtn, nameSpan, nextBtn);
  section.append(controls);

  return section;
}

function renderPracticeCarousels() {
  const container = document.getElementById("practice-carousels");
  container.innerHTML = "";

  if (practiceOutfitMode === "separates") {
    const tops = getCarouselItems("top");
    const bottoms = getCarouselItems("bottom");
    const shoes = getCarouselItems("shoe");

    practiceIndices.top = wrapIndex(practiceIndices.top, tops.length);
    practiceIndices.bottom = wrapIndex(practiceIndices.bottom, bottoms.length);
    practiceIndices.shoe = wrapIndex(practiceIndices.shoe, shoes.length);

    container.append(
      buildCarousel("Tops", tops, "top", practiceIndices.top),
      buildCarousel("Bottoms", bottoms, "bottom", practiceIndices.bottom),
      buildCarousel("Shoes", shoes, "shoe", practiceIndices.shoe)
    );
  } else {
    const dresses = getCarouselItems("dress");
    const shoes = getCarouselItems("shoe");

    practiceIndices.dress = wrapIndex(practiceIndices.dress, dresses.length);
    practiceIndices.shoe = wrapIndex(practiceIndices.shoe, shoes.length);

    container.append(
      buildCarousel("Dress", dresses, "dress", practiceIndices.dress),
      buildCarousel("Shoes", shoes, "shoe", practiceIndices.shoe)
    );
  }
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

function exportWardrobe() {
  const backup = {
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
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  const date = new Date().toISOString().slice(0, 10);
  link.href = URL.createObjectURL(blob);
  link.download = `outfit-archive-backup-${date}.json`;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(link.href), 0);
}

function importWardrobe() {
  const file = importWardrobeInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.addEventListener("load", () => {
    try {
      const backup = JSON.parse(reader.result);
      const data = backup?.data;
      const requiredLists = [
        data?.items,
        data?.savedOutfits,
        data?.hiddenStarterItemIds,
        data?.trashedItems,
        data?.savedCollages,
      ];

      if (!data || requiredLists.some((list) => !Array.isArray(list))) {
        throw new Error("Invalid backup");
      }

      if (!window.confirm("Import this backup and replace the wardrobe currently saved in this browser?")) {
        return;
      }

      localStorage.setItem(storageKey, JSON.stringify(data.items));
      localStorage.setItem(outfitsKey, JSON.stringify(data.savedOutfits));
      localStorage.setItem(hiddenStarterItemsKey, JSON.stringify(data.hiddenStarterItemIds));
      localStorage.setItem(trashItemsKey, JSON.stringify(data.trashedItems));
      localStorage.setItem(collagesKey, JSON.stringify(data.savedCollages));
      if (Array.isArray(data.vibeTabs)) {
        localStorage.setItem(vibeTabsKey, JSON.stringify(data.vibeTabs));
      }

      wardrobeItems = readStorage(storageKey);
      savedOutfits = readStorage(outfitsKey);
      hiddenStarterItemIds = readStorage(hiddenStarterItemsKey);
      trashedItems = readStorage(trashItemsKey);
      savedCollages = readStorage(collagesKey);
      const importedVibes = readStorage(vibeTabsKey);
      vibeTabs = importedVibes.length > 0 ? importedVibes : [...defaultVibeTabs];
      activeVibe = "vibe-all";
      activeCategory = "All";
      searchTerm = "";
      searchInput.value = "";
      categoryFilters.querySelectorAll(".filter-button").forEach((button) => {
        button.classList.toggle("active", button.dataset.category === "All");
      });
      undoClosetActions = [];
      redoClosetActions = [];
      collagePieces = [];
      renderApp();
    } catch {
      window.alert("This file is not a valid Outfit Archive backup.");
    } finally {
      importWardrobeInput.value = "";
    }
  });
  reader.readAsText(file);
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
  const items = getAllClosetItems();
  const allCategories = [...new Set(items.map((i) => i.category || "Uncategorized"))];
  const filterOptions = ["All", ...allCategories];

  trayFilterBar.innerHTML = "";
  filterOptions.forEach((cat) => {
    const btn = document.createElement("button");
    btn.className = "tray-filter-btn" + (cat === collageTrayFilter ? " active" : "");
    btn.textContent = cat;
    btn.dataset.trayFilter = cat;
    btn.type = "button";
    trayFilterBar.append(btn);
  });

  collageTrayItems.innerHTML = "";

  const filtered =
    collageTrayFilter === "All"
      ? items
      : items.filter((i) => (i.category || "Uncategorized") === collageTrayFilter);

  if (collageTrayFilter === "All") {
    const groups = {};
    filtered.forEach((item) => {
      const cat = item.category || "Uncategorized";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });
    Object.entries(groups).forEach(([cat, catItems]) => {
      const header = document.createElement("p");
      header.className = "tray-category-header";
      header.textContent = cat;
      collageTrayItems.append(header);
      catItems.forEach((item) => collageTrayItems.append(makeTrayPiece(item)));
    });
  } else {
    filtered.forEach((item) => collageTrayItems.append(makeTrayPiece(item)));
  }
}

function makeTrayPiece(item) {
  const piece = document.createElement("article");
  piece.className = "tray-piece";
  piece.dataset.itemId = item.id;
  piece.innerHTML = `
    <img src="${item.photo}" alt="${escapeHtml(item.name)}" />
    <p>${escapeHtml(item.name)}</p>
    <span>Tap to add</span>
  `;
  return piece;
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
    const isSelected = piece.canvasId === collageSelectedId;
    const node = document.createElement("article");
    node.className = "collage-piece" + (isSelected ? " is-selected" : "");
    node.dataset.canvasId = piece.canvasId;
    node.style.left = `${piece.x}px`;
    node.style.top = `${piece.y}px`;
    node.style.width = `${size}px`;
    node.style.zIndex = String(piece.z || 0);
    node.innerHTML = `
      <img src="${item.photo}" alt="${escapeHtml(item.name)}" />
      <button class="collage-btn collage-remove" data-remove-piece="${piece.canvasId}" type="button" aria-label="Remove">\xd7</button>
      <button class="collage-btn collage-layer collage-above" data-layer-piece="${piece.canvasId}" data-layer-dir="1" type="button" aria-label="Bring above">↑</button>
      <button class="collage-btn collage-layer collage-below" data-layer-piece="${piece.canvasId}" data-layer-dir="-1" type="button" aria-label="Send below">↓</button>
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

  const preview = document.createElement("div");
  preview.className = "collage-preview";
  preview.style.background = collage.background || "#EDD6D1";

  const canvasW = collage.canvasWidth || 400;
  const canvasH = collage.canvasHeight || Math.round(canvasW * 4 / 3);
  const layout = collage.layout || [];
  const pieceCount = layout.length;

  [...layout].sort((a, b) => (a.z || 0) - (b.z || 0)).forEach((entry) => {
    const item = allItems.find((i) => i.id === entry.itemId);
    if (!item) return;
    const img = document.createElement("img");
    img.src = item.photo;
    img.alt = item.name;
    img.style.position = "absolute";
    img.style.objectFit = "contain";
    img.style.left = `${(entry.x / canvasW) * 100}%`;
    img.style.top = `${(entry.y / canvasH) * 100}%`;
    img.style.width = `${((entry.size || 130) / canvasW) * 100}%`;
    img.style.zIndex = String(entry.z || 0);
    preview.append(img);
  });

  const body = document.createElement("div");
  body.className = "card-body";
  body.innerHTML = `
    <div class="card-heading">
      <h3 class="card-name">${escapeHtml(collage.name)}</h3>
      <span class="card-category">Collage</span>
    </div>
    <p class="outfit-piece-count">${pieceCount} pieces</p>
  `;
  const deleteBtn = document.createElement("button");
  deleteBtn.className = "delete-item delete-button";
  deleteBtn.dataset.deleteCollage = collage.id;
  deleteBtn.textContent = "Remove";
  body.append(deleteBtn);

  const editBtn = document.createElement("button");
  editBtn.className = "edit-button";
  editBtn.dataset.editCollage = collage.id;
  editBtn.type = "button";
  editBtn.textContent = "Edit";
  body.append(editBtn);

  article.append(preview, body);
  return article;
}

function loadCollageForEditing(id) {
  const collage = savedCollages.find((c) => c.id === id);
  if (!collage) return;

  editingCollageId = id;
  collageSelectedId = null;
  collageCanvas.style.background = collageBackground;

  const allItems = getAllClosetItems();
  collagePieces = (collage.layout || []).map((entry) => ({
    canvasId: crypto.randomUUID(),
    itemId: entry.itemId,
    x: entry.x,
    y: entry.y,
    z: entry.z || 0,
    size: entry.size || 130,
    photo: allItems.find((item) => item.id === entry.itemId)?.photo || "",
    name: allItems.find((item) => item.id === entry.itemId)?.name || "",
  }));

  collageNameInput.value = collage.name;

  savedCollages = savedCollages.filter((c) => c.id !== id);
  localStorage.setItem(collagesKey, JSON.stringify(savedCollages));

  renderCollageCanvas();
  showView("collage");
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
