import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { editions, resolveAppearance } from "../src/design-system/editions.js";
test("exactly 15 canonical edition identities; dark Outline is only a variant", () => {
  assert.equal(editions.length, 15);
  assert.deepEqual(
    editions.map((e) => e.id),
    Array.from({ length: 15 }, (_, i) => String(i + 1).padStart(2, "0")),
  );
  assert.equal(resolveAppearance({ id: "09" }).colorScheme, "light");
  assert.equal(
    resolveAppearance({ id: "09", variant: "dark" }).colorScheme,
    "dark",
  );
  assert.equal(resolveAppearance({ id: "10", variant: "dark" }).variant, null);
});
test("invalid appearance falls back to Obsidian; palettes and material metadata are complete", () => {
  for (const value of [
    null,
    undefined,
    {},
    "10",
    { id: "16" },
    { id: "<script>" },
  ])
    assert.equal(resolveAppearance(value).id, "10");
  for (const e of editions) {
    for (const value of Object.values(e.palette))
      assert.match(value, /^#[0-9a-f]{6}$/i);
    assert.ok(e.material);
    assert.equal(e.version, "2.0.0");
  }
});
test("all 51 supplied PNGs retain recorded bytes, dimensions and alpha bounds", () => {
  const manifest = JSON.parse(
    readFileSync(
      new URL("../public/brand/asset-manifest.json", import.meta.url),
    ),
  );
  assert.equal(manifest.files.length, 51);
  for (const file of manifest.files) {
    const path = new URL("../public/brand/" + file.path, import.meta.url);
    assert.ok(existsSync(path));
    const bytes = readFileSync(path);
    assert.equal(createHash("sha256").update(bytes).digest("hex"), file.sha256);
    assert.equal(bytes.readUInt32BE(16), file.width);
    assert.equal(bytes.readUInt32BE(20), file.height);
    assert.ok(file.hasAlpha);
    assert.ok(file.alphaBounds[2] <= file.width);
    assert.ok(file.alphaBounds[3] <= file.height);
  }
});
