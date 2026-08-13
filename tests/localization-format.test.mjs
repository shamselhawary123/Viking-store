import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  EGP_PER_USD,
  formatStorePrice,
  getLocalizedCategoryName,
} from "../utils/localizationFormat.ts";

describe("store localization formatting", () => {
  it("formats stored EGP product prices as USD for English and EGP for Arabic", () => {
    assert.equal(EGP_PER_USD, 50);
    assert.equal(formatStorePrice(1500, "ar"), "1,500 EGP");
    assert.equal(formatStorePrice(1500, "en"), "$30");
    assert.equal(formatStorePrice(2500, "ar"), "2,500 EGP");
    assert.equal(formatStorePrice(2500, "en"), "$50");
  });

  it("handles zero, null, and invalid values without broken price text", () => {
    assert.equal(formatStorePrice(0, "en"), "$0");
    assert.equal(formatStorePrice(0, "ar"), "0 EGP");
    assert.equal(formatStorePrice(null, "en"), "$0");
    assert.equal(formatStorePrice(undefined, "ar"), "0 EGP");
    assert.equal(formatStorePrice("not-a-price", "en"), "$0");
  });

  it("uses known Arabic category labels by slug without changing database content", () => {
    assert.equal(getLocalizedCategoryName({ slug: "boxing", name: "Boxing" }, "ar"), "ملاكمة");
    assert.equal(getLocalizedCategoryName({ slug: "boxing", name: "Boxing" }, "en"), "Boxing");
    assert.equal(getLocalizedCategoryName({ slug: "custom", name: "Custom" }, "ar"), "Custom");
  });
});
