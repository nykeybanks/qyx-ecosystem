import test from "node:test";
import assert from "node:assert/strict";
import { products, categories, filterProducts } from "../src/catalog.js";

test("catalog has unique families and unique project membership", () => {
  assert.equal(products.length, 19);
  assert.equal(new Set(products.map((p) => p.id)).size, products.length);
  const names = products.flatMap((p) => p.projects.map((v) => v.name));
  assert.equal(names.length, 63);
  assert.equal(new Set(names).size, names.length);
  products.forEach((p) => {
    assert.ok(categories.includes(p.category));
    assert.ok(p.projects.length > 0);
    p.projects.forEach((v) => {
      if (v.url) assert.equal(new URL(v.url).protocol, "https:");
    });
  });
});
test("all returns complete catalog and finance returns only finance", () => {
  assert.equal(filterProducts(products, "All", "").length, products.length);
  const finance = filterProducts(products, "Finance", "");
  assert.ok(finance.length > 0);
  assert.ok(finance.every((p) => p.category === "Finance"));
});
test("search is case insensitive, trimmed, and finds edition names", () => {
  assert.equal(filterProducts(products, "All", "  QYXOS  ")[0].id, "qyxos");
  assert.equal(
    filterProducts(products, "All", "metamask-extension-qyx-edition")[0].id,
    "wallet",
  );
});
test("category and text search combine and empty results stay empty", () => {
  assert.equal(filterProducts(products, "Community", "QYXOS").length, 0);
  assert.equal(
    filterProducts(products, "All", "not-a-real-product-999").length,
    0,
  );
});
test("unpublished projects are not assigned guessed links", () => {
  const pay = products.find((p) => p.id === "pay");
  assert.equal(
    pay.projects.find((p) => p.name === "qyxpay-onboarding-ui").url,
    null,
  );
});
