// Synchronous, validated attributes before first themed paint. No stored HTML/CSS.
(() => {
  const root = document.documentElement;
  let saved;
  try {
    saved = JSON.parse(localStorage.getItem("qyx-ecosystem:appearance:v1"));
  } catch {}
  const url = new URL(location.href);
  const candidate = /^(0[1-9]|1[0-5])$/.test(url.searchParams.get("edition"))
    ? {
        id: url.searchParams.get("edition"),
        variant: url.searchParams.get("variant"),
      }
    : saved;
  root.dataset.edition = /^(0[1-9]|1[0-5])$/.test(candidate?.id)
    ? candidate.id
    : "10";
  root.dataset.variant =
    root.dataset.edition === "09" && candidate?.variant === "dark"
      ? "dark"
      : "";
  try {
    root.classList.toggle(
      "reduce-transparency",
      localStorage.getItem("qyx-ecosystem:transparency:v1") === "reduce",
    );
  } catch {}
  try {
    root.classList.toggle(
      "motion-paused",
      localStorage.getItem("qyx-motion") === "paused" ||
        matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
  } catch {}
})();
