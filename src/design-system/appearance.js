import { editions, resolveAppearance, STORAGE_KEY } from "./editions.js";
import { updateBrands } from "./brand.js";
const root = document.documentElement;
export const appearanceStrings = {
  en: {
    title: "Visual editions",
    reset: "Reset appearance",
    transparency: "Reduce transparency",
    close: "Close visual editions",
    choose: "Choose a visual edition",
    intro: "One ecosystem. Fifteen perspectives. A proposal for review.",
    dark: "Outline Minimal · Dark (Edition 09 variant)",
    current: "Current",
    darkSuffix: "Dark",
    osTransparency: "Your OS also requires reduced transparency.",
    independentTransparency:
      "Solid surfaces are available independently of motion.",
  },
  fr: {
    title: "Éditions visuelles",
    reset: "Réinitialiser l’apparence",
    transparency: "Réduire la transparence",
    close: "Fermer les éditions visuelles",
    choose: "Choisir une édition visuelle",
    intro: "Un écosystème. Quinze perspectives. Une proposition à examiner.",
    dark: "Outline Minimal · Sombre (variante de l’édition 09)",
    current: "Édition actuelle",
    darkSuffix: "Sombre",
    osTransparency: "Votre système exige également une transparence réduite.",
    independentTransparency:
      "Les surfaces opaques sont indépendantes du mouvement.",
  },
};
export function initAppearance() {
  const dialog = document.querySelector("#appearance-dialog");
  const choices = document.querySelector("#edition-choices");
  const dark = document.querySelector("#outline-dark");
  const transparency = document.querySelector("#reduce-transparency");
  let source = null;
  const strings = appearanceStrings[root.lang.startsWith("fr") ? "fr" : "en"];
  document.querySelector("#appearance-title").textContent = strings.title;
  document.querySelector(".appearance-intro").textContent = strings.intro;
  document
    .querySelector("#appearance-close")
    .setAttribute("aria-label", strings.close);
  document.querySelector("#appearance-reset").textContent = strings.reset;
  dark.parentElement.lastChild.textContent = " " + strings.dark;
  transparency.parentElement.lastChild.textContent = " " + strings.transparency;
  document
    .querySelectorAll("[data-open-appearance]")
    .forEach((button) => (button.textContent = strings.title));
  function current() {
    return resolveAppearance({
      id: root.dataset.edition,
      variant: root.dataset.variant,
    });
  }
  function sync() {
    const edition = current();
    choices
      .querySelectorAll("input")
      .forEach((input) => (input.checked = input.value === edition.id));
    dark.checked = edition.variant === "dark";
    dark.disabled = edition.id !== "09";
    updateBrands();
    document.querySelector('meta[name="theme-color"]').content =
      edition.palette.canvas;
  }
  function apply(value, persist = true) {
    const edition = resolveAppearance(value);
    // Attributes only: no explorer node, focus, hash, or scroll mutation.
    root.dataset.edition = edition.id;
    root.dataset.variant = edition.variant || "";
    if (persist) {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ id: edition.id, variant: edition.variant }),
        );
      } catch {}
      // Explicit selection supersedes only appearance URL parameters.
      const url = new URL(location.href);
      url.searchParams.delete("edition");
      url.searchParams.delete("variant");
      history.replaceState(history.state, "", url);
    }
    sync();
    document.querySelector("#appearance-status").textContent =
      `${strings.current}: ${edition.id} — ${edition.name}${edition.variant === "dark" ? " · " + strings.darkSuffix : ""}`;
  }
  choices.innerHTML =
    `<legend class="sr-only">${strings.choose}</legend>` +
    editions
      .map(
        (e) =>
          `<label class="edition-choice" style="--preview-canvas:${e.palette.canvas};--preview-surface:${e.palette.surface};--preview-text:${e.palette.text}"><input type="radio" name="edition" value="${e.id}" /><span class="swatch" aria-hidden="true"><i></i><i></i><b>${e.id}</b></span><span class="edition-name"><span class="edition-number">${e.id} — </span>${e.name}</span></label>`,
      )
      .join("");
  choices.addEventListener("change", (e) => {
    if (e.target.name === "edition") apply({ id: e.target.value });
  });
  dark.addEventListener("change", () =>
    apply({ id: "09", variant: dark.checked ? "dark" : null }),
  );
  document.querySelectorAll("[data-open-appearance]").forEach((button) =>
    button.addEventListener("click", () => {
      source = button;
      sync();
      dialog.showModal();
      choices.querySelector("input:checked").focus({ preventScroll: true });
    }),
  );
  document
    .querySelector("#appearance-close")
    .addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) {
      const r = dialog.getBoundingClientRect();
      if (
        e.clientX < r.left ||
        e.clientX > r.right ||
        e.clientY < r.top ||
        e.clientY > r.bottom
      )
        dialog.close();
    }
  });
  dialog.addEventListener("close", () =>
    source?.focus({ preventScroll: true }),
  );
  const osTransparency = matchMedia("(prefers-reduced-transparency: reduce)");
  function syncTransparency() {
    transparency.checked = root.classList.contains("reduce-transparency");
    document.querySelector("#transparency-status").textContent =
      osTransparency.matches
        ? strings.osTransparency
        : strings.independentTransparency;
  }
  transparency.addEventListener("change", () => {
    root.classList.toggle("reduce-transparency", transparency.checked);
    try {
      localStorage.setItem(
        "qyx-ecosystem:transparency:v1",
        transparency.checked ? "reduce" : "normal",
      );
    } catch {}
    syncTransparency();
  });
  osTransparency.addEventListener("change", syncTransparency);
  document
    .querySelector("#appearance-reset")
    .addEventListener("click", () => apply({ id: "10" }));
  // One observer updates exact artwork variants when story/dialog nodes are created.
  new MutationObserver((records) => {
    for (const record of records)
      for (const node of record.addedNodes)
        if (node.nodeType === 1) updateBrands(node);
  }).observe(document.body, { childList: true, subtree: true });
  let heroVisible = true;
  const updateAmbient = () =>
    root.classList.toggle("ambient-inactive", document.hidden || !heroVisible);
  document.addEventListener("visibilitychange", updateAmbient);
  const hero = document.querySelector(".hero");
  new IntersectionObserver((entries) => {
    heroVisible = entries[0].isIntersecting;
    updateAmbient();
  }).observe(hero);
  sync();
  syncTransparency();
  if (new URL(location.href).searchParams.get("review") === "design-system")
    renderReview();
}
function renderReview() {
  const review = document.createElement("section");
  review.className = "review-view";
  review.innerHTML = `<h1>QYX design-system review</h1><p>Proposed ecosystem appearance, not an approved brand standard. Source presets v2.0.0. Fifteen canonical editions; Outline Minimal also has a Dark adaptation. Component samples below use the same semantic tokens as the explorer. <a href="/">Return to explorer</a>.</p><div class="review-grid">${editions.map((e) => `<article class="review-card" data-edition="${e.id}"><header class="sample-header"><img src="/brand/qyx/quantumyield-${e.assets}.png" alt="QuantumYield" /></header><h2>${e.id} — ${e.name}</h2><p>${e.material} · ${e.colorScheme}<br/>Canvas ${e.palette.canvas}<br/>Surface ${e.palette.surface}<br/>Text ${e.palette.text}<br/>Accent ${e.palette.accent}</p><label>Search<input placeholder="Search the ecosystem" /></label><div><button class="sample-selected" aria-pressed="true">Selected</button><button>Filter</button><button disabled>Disabled</button><button class="sample-focus">Focus sample</button></div><div class="sample-panel"><h3>Product card</h3><p>No production URL in snapshot</p><button data-review-product>Open actual dialog</button></div><div class="sample-panel"><h3>Empty state</h3><p>No discoveries here. Yet.</p></div><footer class="sample-footer"><a href="?edition=${e.id}">Explore in ${e.id} →</a></footer></article>`).join("")}</div>`;
  document.querySelector("main").prepend(review);
  review.addEventListener("click", (event) => {
    if (event.target.closest("[data-review-product]"))
      document.querySelector(".sat-os").click();
  });
}
