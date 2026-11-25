// Local production-build checks only. Start npm run preview first.
import { chromium } from "playwright";
import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";
import { editions } from "../src/design-system/editions.js";
const require = createRequire(import.meta.url);
const output = process.env.QYX_EVIDENCE || "/tmp/qyx-evidence";
const base = process.env.QYX_BASE || "http://127.0.0.1:4173";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const results = [],
  errors = [],
  contrast = [];
async function check(name, fn) {
  try {
    await fn();
    results.push({ name, status: "passed" });
  } catch (e) {
    results.push({ name, status: "failed", reason: e.message });
  }
}
const context = await browser.newContext({
  viewport: { width: 1366, height: 768 },
  reducedMotion: "reduce",
});
const page = await context.newPage();
page.on("pageerror", (e) => errors.push(e.message));
await page.goto(base);
await page.evaluate(() => document.fonts.ready);
const open = async () => {
  await page.locator("[data-open-appearance]").first().click();
};
await check("default 10, complete catalog, no broken images", async () => {
  assert.equal(await page.locator("html").getAttribute("data-edition"), "10");
  assert.equal(await page.locator(".product-card").count(), 19);
  await page.locator(".site-footer").scrollIntoViewIfNeeded();
  await page.waitForTimeout(100);
  assert.deepEqual(
    await page.evaluate(() =>
      [...document.images]
        .filter((i) => i.complete && i.naturalWidth === 0)
        .map((i) => i.src),
    ),
    [],
  );
});
await check(
  "selector native radios, arrows, Escape and focus return",
  async () => {
    await open();
    assert.equal(await page.locator("[name=edition]").count(), 15);
    await page.locator("[name=edition]:checked").focus();
    await page.keyboard.press("ArrowRight");
    assert.equal(await page.locator("html").getAttribute("data-edition"), "11");
    await page.keyboard.press("Escape");
    assert.equal(
      await page.locator("#appearance-dialog").evaluate((e) => e.open),
      false,
    );
    assert.equal(
      await page
        .locator("[data-open-appearance]")
        .first()
        .evaluate((e) => e === document.activeElement),
      true,
    );
  },
);
await check(
  "query, category, story, hash, open product and scroll survive edition switch",
  async () => {
    await page.locator("#tab-1").click();
    await page.locator("[data-category=Finance]").click();
    await page.locator("#search").fill("pay");
    await page.locator("#product-grid [data-product=pay]").click();
    const before = await page.evaluate(() => ({
      hash: location.hash,
      y: scrollY,
      title: document.querySelector("#dialog-title").textContent,
      story: document.querySelector("[role=tab][aria-selected=true]").id,
    }));
    await page.locator("#product-dialog [data-open-appearance]").click();
    await page.locator('[name=edition][value="03"]').check();
    await page.keyboard.press("Escape");
    const after = await page.evaluate(() => ({
      hash: location.hash,
      y: scrollY,
      title: document.querySelector("#dialog-title").textContent,
      story: document.querySelector("[role=tab][aria-selected=true]").id,
    }));
    assert.deepEqual(after, before);
    assert.equal(await page.locator("#search").inputValue(), "pay");
    assert.equal(
      await page
        .locator("[data-category=Finance]")
        .getAttribute("aria-pressed"),
      "true",
    );
    await page.keyboard.press("Escape");
    assert.equal(
      await page
        .locator("#product-grid [data-product=pay]")
        .evaluate((e) => e === document.activeElement),
      true,
    );
  },
);
await check(
  "persistence, malformed and unavailable storage; URL override never saves",
  async () => {
    await page.goto(base);
    assert.equal(await page.locator("html").getAttribute("data-edition"), "03");
    await page.goto(base + "/?edition=07&keep=yes#product/pay");
    assert.equal(await page.locator("html").getAttribute("data-edition"), "07");
    assert.equal(
      await page.evaluate(
        () =>
          JSON.parse(localStorage.getItem("qyx-ecosystem:appearance:v1")).id,
      ),
      "03",
    );
    await page.evaluate(() =>
      localStorage.setItem("qyx-ecosystem:appearance:v1", "malformed"),
    );
    await page.goto(base + "/?edition=99");
    assert.equal(await page.locator("html").getAttribute("data-edition"), "10");
    const c = await browser.newContext();
    await c.addInitScript(() => {
      Object.defineProperty(window, "localStorage", {
        get() {
          throw Error("unavailable");
        },
      });
    });
    const p = await c.newPage();
    await p.goto(base);
    assert.equal(await p.locator("html").getAttribute("data-edition"), "10");
    await c.close();
  },
);
await check(
  "paused before load and OS reduction overrides stored playing, reacts mid-session",
  async () => {
    await page.evaluate(() => localStorage.setItem("qyx-motion", "paused"));
    await page.goto(base);
    assert.equal(
      await page
        .locator(".hero-copy")
        .evaluate((e) => getComputedStyle(e).opacity),
      "1",
    );
    assert.equal(
      await page
        .locator(".product-card")
        .first()
        .evaluate((e) => getComputedStyle(e).opacity),
      "1",
    );
    await page.evaluate(() => localStorage.setItem("qyx-motion", "playing"));
    await page.reload();
    assert.equal(await page.locator("#motion-toggle").isDisabled(), true);
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.waitForFunction(
      () => !document.querySelector("#motion-toggle").disabled,
    );
    assert.equal(await page.locator("#motion-toggle").isDisabled(), false);
    await page.locator("#motion-toggle").click();
    await page.locator("#search").fill("vault");
    assert.equal(
      await page
        .locator(".product-card")
        .first()
        .evaluate((e) => getComputedStyle(e).opacity),
      "1",
    );
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.waitForFunction(
      () => document.querySelector("#motion-toggle").disabled,
    );
  },
);
await check(
  "Outline dark remains edition 09; reset; explicit transparency removes every blur",
  async () => {
    await page.goto(base);
    await open();
    await page.locator('[name=edition][value="09"]').check();
    await page.locator("#outline-dark").check();
    assert.equal(await page.locator("html").getAttribute("data-edition"), "09");
    assert.equal(
      await page.locator("html").getAttribute("data-variant"),
      "dark",
    );
    await page.locator("#reduce-transparency").check();
    const blurred = await page.evaluate(() =>
      [...document.querySelectorAll("*")]
        .filter((e) => getComputedStyle(e).backdropFilter !== "none")
        .map((e) => e.className),
    );
    assert.deepEqual(blurred, []);
    await page.locator("#appearance-reset").click();
    assert.equal(await page.locator("html").getAttribute("data-edition"), "10");
    await page.keyboard.press("Escape");
  },
);
await check(
  "story Arrow/Home/End, combined search and empty reset; native dialog navigation and deep link",
  async () => {
    await page.goto(base);
    await page.locator("#tab-0").focus();
    await page.keyboard.press("End");
    assert.equal(
      await page.locator("#tab-2").getAttribute("aria-selected"),
      "true",
    );
    await page.keyboard.press("Home");
    assert.equal(
      await page.locator("#tab-0").getAttribute("aria-selected"),
      "true",
    );
    await page.locator("[data-category=Finance]").click();
    await page.locator("#search").fill("not-a-product");
    assert.equal(await page.locator("#empty-state").isVisible(), true);
    await page.locator("#reset-filters").click();
    assert.equal(await page.locator(".product-card").count(), 19);
    await page.goto(base + "/#product/vault");
    assert.equal(
      await page.locator("#product-dialog").evaluate((e) => e.open),
      true,
    );
    const title = await page.locator("#dialog-title").textContent();
    await page.locator("#dialog-next").click();
    assert.notEqual(await page.locator("#dialog-title").textContent(), title);
    await page.keyboard.press("Escape");
  },
);
await check(
  "responsive reflow 320, 390, landscape, tablet, desktop; 400% equivalent and 200% text",
  async () => {
    for (const [width, height] of [
      [320, 568],
      [390, 844],
      [844, 390],
      [768, 1024],
      [1366, 768],
      [1920, 1080],
    ]) {
      await page.setViewportSize({ width, height });
      await page.goto(base);
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `overflow at ${width}`,
      );
      assert.equal(
        await page.evaluate(() =>
          [...document.querySelectorAll(".sat-icon img")].every((img) => {
            const image = img.getBoundingClientRect(),
              slot = img.parentElement.getBoundingClientRect();
            return (
              image.width <= slot.width + 1 && image.height <= slot.height + 1
            );
          }),
        ),
        true,
        `logo-slot overflow at ${width}`,
      );
      if (width < 761) {
        await page.locator("#menu-toggle").click();
        await page.locator("#main-nav [data-open-appearance]").click();
      } else await open();
      assert.ok(
        await page.evaluate(
          () =>
            document.querySelector("#appearance-dialog").scrollWidth <=
            document.querySelector("#appearance-dialog").clientWidth,
        ),
        `selector overflow ${width}`,
      );
      await page.keyboard.press("Escape");
    }
    await page.setViewportSize({ width: 320, height: 640 });
    await page.goto(base);
    await page.evaluate(() => {
      const sizes = [...document.querySelectorAll("body *")].map((e) => [
        e,
        parseFloat(getComputedStyle(e).fontSize),
      ]);
      for (const [element, size] of sizes)
        element.style.fontSize = size * 2 + "px";
    });
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      "200% text overflow",
    );
  },
);
await check(
  "design-system review is a built direct URL with 15 live token samples",
  async () => {
    await page.goto(base + "/?review=design-system");
    assert.equal(await page.locator(".review-card").count(), 15);
    await page.locator("[data-review-product]").first().click();
    assert.equal(
      await page.locator("#product-dialog").evaluate((e) => e.open),
      true,
    );
  },
);
await check(
  "all fifteen editions select and persist through actual controls",
  async () => {
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.goto(base);
    await open();
    for (const edition of editions) {
      await page.locator(`[name=edition][value="${edition.id}"]`).check();
      assert.equal(
        await page.locator("html").getAttribute("data-edition"),
        edition.id,
      );
      assert.equal(
        await page.evaluate(
          () =>
            JSON.parse(localStorage.getItem("qyx-ecosystem:appearance:v1")).id,
        ),
        edition.id,
      );
    }
    await page.keyboard.press("Escape");
  },
);
await check(
  "OS transparency and forced-colors remove all blur; mobile selector Escape restores visible focus",
  async () => {
    await page.goto(base);
    await page.evaluate(() =>
      localStorage.removeItem("qyx-ecosystem:transparency:v1"),
    );
    await page.reload();
    const cdp = await context.newCDPSession(page);
    await cdp.send("Emulation.setEmulatedMedia", {
      features: [
        { name: "prefers-reduced-transparency", value: "reduce" },
        { name: "prefers-reduced-motion", value: "reduce" },
      ],
    });
    assert.equal(
      await page.evaluate(
        () => matchMedia("(prefers-reduced-transparency: reduce)").matches,
      ),
      true,
    );
    assert.equal(
      await page
        .locator(".site-header")
        .evaluate((e) => getComputedStyle(e).backdropFilter),
      "none",
    );
    await cdp.send("Emulation.setEmulatedMedia", {
      features: [{ name: "forced-colors", value: "active" }],
    });
    assert.equal(
      await page.evaluate(() => matchMedia("(forced-colors: active)").matches),
      true,
    );
    assert.equal(
      await page
        .locator(".site-header")
        .evaluate((e) => getComputedStyle(e).backdropFilter),
      "none",
    );
    await cdp.detach();
    await page.emulateMedia({ forcedColors: "none", reducedMotion: "reduce" });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(base);
    await page.locator("#menu-toggle").click();
    await page.locator("#main-nav [data-open-appearance]").click();
    await page.keyboard.press("Escape");
    assert.equal(
      await page
        .locator("#main-nav [data-open-appearance]")
        .evaluate((e) => e === document.activeElement),
      true,
    );
    assert.equal(
      await page.locator("#main-nav [data-open-appearance]").isVisible(),
      true,
    );
  },
);
// All-edition semantic text/control contrast with axe on actual rendered components.
await page.setViewportSize({ width: 1366, height: 768 });
for (const e of editions) {
  await page.goto(base + "/?edition=" + e.id);
  await page.addScriptTag({ path: require.resolve("axe-core/axe.min.js") });
  const audit = await page.evaluate(
    async () =>
      await axe.run(document, {
        runOnly: { type: "rule", values: ["color-contrast"] },
      }),
  );
  await page.locator(".sat-os").click();
  const dialogAudit = await page.evaluate(
    async () =>
      await axe.run(document.querySelector("#product-dialog"), {
        runOnly: {
          type: "rule",
          values: ["color-contrast", "label", "aria-valid-attr-value"],
        },
      }),
  );
  await page.keyboard.press("Escape");
  await open();
  const selectorAudit = await page.evaluate(
    async () =>
      await axe.run(document.querySelector("#appearance-dialog"), {
        runOnly: {
          type: "rule",
          values: [
            "color-contrast",
            "label",
            "aria-allowed-attr",
            "aria-valid-attr-value",
          ],
        },
      }),
  );
  await page.keyboard.press("Escape");
  contrast.push({
    edition: e.id,
    violations: [
      ...audit.violations,
      ...selectorAudit.violations,
      ...dialogAudit.violations,
    ].map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => ({
        target: n.target,
        summary: n.failureSummary,
      })),
    })),
    incomplete: audit.incomplete.length,
  });
}
await check("all 15 editions rendered text contrast audit", async () => {
  assert.equal(
    contrast.filter((e) => e.violations.length).length,
    0,
    JSON.stringify(contrast.filter((e) => e.violations.length)),
  );
});
// Consistent, real viewport crops: mobile is independently reflowed, not resized desktop.
for (const mobile of [false, true]) {
  const ctx = await browser.newContext({
    viewport: mobile
      ? { width: 360, height: 640 }
      : { width: 1920, height: 1080 },
    deviceScaleFactor: mobile ? 3 : 1,
    reducedMotion: "reduce",
  });
  const p = await ctx.newPage();
  for (const e of editions) {
    await p.goto(base + "/?edition=" + e.id);
    await p.evaluate(() => document.fonts.ready);
    await p.screenshot({
      path: `${output}/${mobile ? "mobile" : "desktop"}-${e.id}.png`,
    });
  }
  await ctx.close();
}
const flagshipContext = await browser.newContext({
  viewport: { width: 1920, height: 1080 },
  deviceScaleFactor: 2,
  reducedMotion: "reduce",
});
const flagship = await flagshipContext.newPage();
await flagship.goto(base + "/?edition=10");
await flagship.evaluate(() => document.fonts.ready);
await flagship.screenshot({ path: output + "/flagship-10-4k.png" });
await flagshipContext.close();
await page.setViewportSize({ width: 390, height: 844 });
await page.goto(base);
await page.locator("#menu-toggle").click();
await page.locator("#main-nav [data-open-appearance]").click();
await page.screenshot({ path: output + "/mobile-selector.png" });
await page.keyboard.press("Escape");
await page.goto(base + "/#product/pay");
await page.screenshot({ path: output + "/mobile-dialog.png" });
await check("no uncaught browser errors", async () =>
  assert.deepEqual(errors, []),
);
await writeFile(
  output + "/verification.json",
  JSON.stringify(
    {
      source:
        "Local Chromium against Vite production dist; not hosted verification",
      results,
      contrast,
      errors,
    },
    null,
    2,
  ),
);
console.log(JSON.stringify(results, null, 2));
await browser.close();
if (results.some((r) => r.status === "failed")) process.exitCode = 1;
