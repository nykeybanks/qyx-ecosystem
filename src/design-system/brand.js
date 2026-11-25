import { resolveAppearance } from "./editions.js";
// Only inspected identities are mapped. Never substitute an unrelated family logo.
export const brandFamilies = {
  qyxos: "qyxos",
  ai: "qyxai",
  pay: "QYXpay",
  tv: "qyxtv",
  qyx20: "qyx20",
};
export function assetVariant() {
  const root = document.documentElement;
  return resolveAppearance({
    id: root.dataset.edition,
    variant: root.dataset.variant,
  }).assets;
}
export function updateBrands(scope = document) {
  scope.querySelectorAll("[data-brand]").forEach((img) => {
    img.src = `/brand/qyx/${img.dataset.brand}-${assetVariant()}.png`;
  });
}
export function brandArt(product) {
  const identity = brandFamilies[product.id];
  return identity
    ? `<img data-brand="${identity}" src="/brand/qyx/${identity}-${assetVariant()}.png" alt="" width="180" height="80" loading="lazy" />`
    : `<span class="unresolved-brand">${product.title.replaceAll("&", "&amp;").replaceAll("<", "&lt;")}</span>`;
}
