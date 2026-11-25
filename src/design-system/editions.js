import editions from "./editions.json" with { type: "json" };
export { editions };
export const STORAGE_KEY = "qyx-ecosystem:appearance:v1";
export function resolveAppearance(value) {
  const edition = editions.find((e) => e.id === value?.id) || editions[9];
  const variant =
    edition.id === "09" && value?.variant === "dark" ? "dark" : null;
  return { ...edition, ...(variant ? edition.variants.dark : {}), variant };
}
