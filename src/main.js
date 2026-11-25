import "./style.css";
import "./design-system/tokens.css";
import { initAppearance } from "./design-system/appearance.js";
import { brandArt } from "./design-system/brand.js";
import { products, categories, filterProducts } from "./catalog.js";

const $ = (selector) => document.querySelector(selector);
const escape = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const displayTitle = (title) =>
  title.replaceAll("QYXOS", "QYXos").replaceAll("QYX AI", "QYXai");
let category = "All";
let query = "";
let filtered = [...products];
let currentProduct = null;
let dialogSource = null;
const dialog = $("#product-dialog");

function art(product, extra = "") {
  return `<div class="card-art ${product.color} ${extra}" aria-hidden="true"><span class="art-circle"></span><span class="art-circle"></span><span class="product-emblem">${brandArt(product)}</span><span class="art-sparkle">✧</span><span class="art-label">QUANTUMYIELD / ${escape(displayTitle(product.title))}</span></div>`;
}

function renderGrid() {
  filtered = filterProducts(products, category, query);
  $("#filters").innerHTML = categories
    .map(
      (c) =>
        `<button data-category="${escape(c)}" aria-pressed="${c === category}">${escape(c)}</button>`,
    )
    .join("");
  $("#product-grid").innerHTML = filtered
    .map(
      (p, i) =>
        `<article class="product-card" style="animation-delay:${Math.min(i * 35, 250)}ms"><button class="card-button" data-product="${p.id}" aria-label="Explore ${escape(displayTitle(p.title))}">${art(p)}<div class="card-copy"><div class="card-category"><span>${escape(p.category)}</span><span>QYX</span></div><h3>${escape(displayTitle(p.title))}</h3><p>${escape(p.tagline)}</p><div class="card-more"><span>Discover ${p.projects.length > 1 ? `${p.projects.length} projects` : "the project"}</span><span aria-hidden="true">↗</span></div></div></button></article>`,
    )
    .join("");
  $("#empty-state").hidden = filtered.length !== 0;
  $("#result-count").textContent =
    `${filtered.length} of ${products.length} product families · ${filtered.reduce((sum, p) => sum + p.projects.length, 0)} projects`;
}

function selectCategory(value) {
  category = value;
  renderGrid();
}

$("#filters").addEventListener("click", (event) => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  selectCategory(button.dataset.category);
  // Rendering replaces the buttons. Restore keyboard focus to the chosen filter.
  [...$("#filters").querySelectorAll("button")]
    .find((b) => b.dataset.category === category)
    ?.focus({ preventScroll: true });
});
$("#search").addEventListener("input", (event) => {
  query = event.target.value;
  renderGrid();
});
$("#reset-filters").addEventListener("click", () => {
  category = "All";
  query = "";
  $("#search").value = "";
  renderGrid();
  $("#search").focus();
});

function dialogItems() {
  return filtered.some((p) => p.id === currentProduct?.id)
    ? filtered
    : products;
}
function renderDialog(product) {
  currentProduct = product;
  $("#dialog-content").innerHTML =
    `${art(product, "dialog-art")}<p class="dialog-category">${escape(product.category)}</p><h2 id="dialog-title">${escape(displayTitle(product.title))}</h2><p class="dialog-description">${escape(product.description)}</p><h3 class="destination-heading">${product.projects.length > 1 ? "Projects & editions" : "Project destination"}</h3><div class="destination-list">${product.projects.map((p, i) => `<div class="destination"><span>${escape(p.name)}<small>${i === 0 ? "Featured project" : "Related edition / project variant"}</small></span>${p.url ? `<a href="${escape(p.url)}" target="_blank" rel="noopener noreferrer" aria-label="Open ${escape(p.name)} in a new tab">Open ↗</a>` : '<span class="no-destination">No production URL in snapshot</span>'}</div>`).join("")}</div><p class="dialog-caveat">External projects open in a new tab and may require access. Interfaces, prototypes, and concepts are not guarantees of a live service. This explorer does not connect wallets, move funds, or share a login across products.</p>`;
  const items = dialogItems();
  $("#dialog-position").textContent =
    `${items.findIndex((p) => p.id === product.id) + 1} / ${items.length}`;
  $("#dialog-prev").disabled = items.length < 2;
  $("#dialog-next").disabled = items.length < 2;
}
function openProduct(id, source) {
  const product = products.find((p) => p.id === id);
  if (!product) return;
  renderDialog(product);
  if (!dialog.open) {
    dialogSource = source || document.activeElement;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    $("#dialog-close").focus();
  }
  history.replaceState(null, "", `#product/${id}`);
}
function moveProduct(direction) {
  const items = dialogItems();
  const index = items.findIndex((p) => p.id === currentProduct.id);
  openProduct(items[(index + direction + items.length) % items.length].id);
  $("#dialog-content").scrollTop = 0;
  dialog.scrollTop = 0;
}
$("#dialog-close").addEventListener("click", () => dialog.close());
$("#dialog-prev").addEventListener("click", () => moveProduct(-1));
$("#dialog-next").addEventListener("click", () => moveProduct(1));
dialog.addEventListener("click", (event) => {
  if (event.target !== dialog) return;
  const rect = dialog.getBoundingClientRect();
  if (
    event.clientX < rect.left ||
    event.clientX > rect.right ||
    event.clientY < rect.top ||
    event.clientY > rect.bottom
  )
    dialog.close();
});
dialog.addEventListener("close", () => {
  document.body.style.overflow = "";
  history.replaceState(null, "", "#ecosystem");
  if (dialogSource?.isConnected) dialogSource.focus({ preventScroll: true });
});

document.addEventListener("click", (event) => {
  const target = event.target.closest("[data-product]");
  if (target) openProduct(target.dataset.product, target);
  const link = event.target.closest("[data-filter-link]");
  if (link) {
    query = "";
    $("#search").value = "";
    selectCategory(link.dataset.filterLink);
  }
});

const stories = [
  {
    id: "qyxos",
    category: "QYXos + WORKSPACE",
    title: "A space for everything you do.",
    description:
      "A fresh perspective on your digital day. Explore QYXos, then discover the console interfaces that put the wider ecosystem in view.",
    visual: `<div class="mini-desktop" aria-hidden="true"><div class="desktop-chrome"><i></i><i></i><i></i><span>QYXos / YOUR SPACE</span></div><div class="desktop-content"><div class="desktop-sidebar"><span>⌘</span><span>▦</span><span>◈</span><span>✳</span></div><div class="desktop-main"><small>WELCOME TO YOUR WORKSPACE</small><h4>A little more connected.</h4><div class="desktop-widgets"><span>✳<small>DISCOVER</small></span><span>◈<small>EXPLORE</small></span><span>◎<small>CONNECT</small></span></div><div class="desktop-dock">⌘ ◈ ✳ ◎</div></div></div></div><div class="floating-label"><b>✦</b> Many possibilities. One workspace.</div>`,
  },
  {
    id: "ai",
    category: "QYXai + INTELLIGENCE",
    title: "Give your curiosity more room.",
    description:
      "From conversation interfaces to intelligent-workspace experiments, discover the AI side of QuantumYield. Your next idea could start with a question.",
    visual: `<div class="ai-sphere" aria-hidden="true"><img data-brand="qyxai" src="/brand/qyx/qyxai-white.png" alt="" /></div><div class="chat-bubble chat-one" aria-hidden="true">Where could my next idea take me?</div><div class="chat-bubble chat-two" aria-hidden="true">✧ Start with a little curiosity.<br/>Explore the QYXai universe.</div>`,
  },
  {
    id: "social",
    category: "Q SOCIAL + COMMUNITY",
    title: "Find your people. Expand your world.",
    description:
      "Discover community interfaces, playful projects, and a different side of QYX. Explore Q Social, QYX TV, and the Arcade in the ecosystem directory.",
    visual: `<div class="social-rings" aria-hidden="true"><div class="social-center">◎</div><div class="avatar a">✳</div><div class="avatar b">✦</div><div class="avatar c">⌘</div></div><div class="floating-label"><b>◎</b> A universe of shared possibilities.</div>`,
  },
];
let storyIndex = 0;
function showStory(index, focus = false) {
  storyIndex = (index + stories.length) % stories.length;
  const story = stories[storyIndex];

  $("#story-panel").setAttribute("aria-labelledby", `tab-${storyIndex}`);
  $("#story-panel").innerHTML =
    `<div class="story-copy"><p class="eyebrow">${story.category}</p><h3>${story.title}</h3><p>${story.description}</p><button class="button primary" data-product="${story.id}">Explore ${displayTitle(products.find((p) => p.id === story.id).title)} <span aria-hidden="true">↗</span></button></div><div class="story-visual">${story.visual}</div>`;
  document.querySelectorAll("[role=tab]").forEach((tab, index) => {
    tab.setAttribute("aria-selected", String(index === storyIndex));
    tab.tabIndex = index === storyIndex ? 0 : -1;
  });
  $("#story-count").textContent = `0${storyIndex + 1} / 03`;
  if (focus) $(`#tab-${storyIndex}`).focus();
}
document.querySelectorAll("[role=tab]").forEach((tab, index) => {
  tab.addEventListener("click", () => showStory(index));
  tab.addEventListener("keydown", (event) => {
    let next;
    if (event.key === "ArrowRight") next = storyIndex + 1;
    if (event.key === "ArrowLeft") next = storyIndex - 1;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = stories.length - 1;
    if (next !== undefined) {
      event.preventDefault();
      showStory(next, true);
    }
  });
});
$("#story-prev").addEventListener("click", () => showStory(storyIndex - 1));
$("#story-next").addEventListener("click", () => showStory(storyIndex + 1));

const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
let manualMotion = null;
try {
  const stored = localStorage.getItem("qyx-motion");
  if (stored !== null) manualMotion = stored === "paused";
} catch {
  /* Storage can be unavailable in private contexts. */
}
function setMotion(paused) {
  document.documentElement.classList.toggle("motion-paused", paused);
  $("#motion-toggle").setAttribute("aria-pressed", String(paused));
  $("#motion-toggle").disabled = motionPreference.matches;
  $("#motion-toggle").title = motionPreference.matches
    ? "Motion reduced by your operating system"
    : "Control nonessential motion";
  $("#motion-toggle").innerHTML = motionPreference.matches
    ? "Motion reduced by OS"
    : paused
      ? 'Resume motion <span aria-hidden="true">▷</span>'
      : 'Pause motion <span aria-hidden="true">Ⅱ</span>';
}
setMotion(motionPreference.matches || manualMotion === true);
$("#motion-toggle").addEventListener("click", () => {
  manualMotion = !document.documentElement.classList.contains("motion-paused");
  setMotion(motionPreference.matches || manualMotion);
  try {
    localStorage.setItem("qyx-motion", manualMotion ? "paused" : "playing");
  } catch {
    /* Nonessential preference. */
  }
});
motionPreference.addEventListener("change", (event) => {
  setMotion(event.matches || manualMotion === true);
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.08 },
);
document
  .querySelectorAll(".reveal")
  .forEach((element) => observer.observe(element));
let scrollQueued = false;
window.addEventListener(
  "scroll",
  () => {
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(() => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      $(".reading-progress").style.width =
        `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
      scrollQueued = false;
    });
  },
  { passive: true },
);
$("#menu-toggle").addEventListener("click", () => {
  const open = $("#menu-toggle").getAttribute("aria-expanded") !== "true";
  $("#menu-toggle").setAttribute("aria-expanded", String(open));
  $("#menu-toggle").setAttribute(
    "aria-label",
    open ? "Close navigation" : "Open navigation",
  );
  $("#main-nav").classList.toggle("open", open);
});
function closeMenu() {
  $("#menu-toggle").setAttribute("aria-expanded", "false");
  $("#menu-toggle").setAttribute("aria-label", "Open navigation");
  $("#main-nav").classList.remove("open");
}
$("#main-nav").addEventListener("click", (event) => {
  if (event.target.closest("a")) closeMenu();
});
document.addEventListener("keydown", (event) => {
  if (
    event.key === "Escape" &&
    $("#main-nav").classList.contains("open") &&
    !document.querySelector("dialog[open]")
  ) {
    closeMenu();
    $("#menu-toggle").focus();
  }
});
window.matchMedia("(min-width: 761px)").addEventListener("change", (event) => {
  if (event.matches) closeMenu();
});
function readHash() {
  if (location.hash.startsWith("#product/"))
    openProduct(location.hash.slice(9));
}
window.addEventListener("hashchange", readHash);
renderGrid();
showStory(0);
readHash();
initAppearance();
