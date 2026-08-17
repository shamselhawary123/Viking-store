import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  formatStorePrice,
  getLocalizedCategoryName,
} from "../utils/localizationFormat.ts";

describe("store localization formatting", () => {
  it("formats stored EGP product prices as the same EGP amount for English and Arabic", () => {
    assert.equal(formatStorePrice(1500, "ar"), "1,500 EGP");
    assert.equal(formatStorePrice(1500, "en"), "1,500 EGP");
    assert.equal(formatStorePrice(2500, "ar"), "2,500 EGP");
    assert.equal(formatStorePrice(2500, "en"), "2,500 EGP");
    assert.equal(formatStorePrice(1250, "ar"), formatStorePrice(1250, "en"));
  });

  it("handles zero, null, and invalid values without broken price text", () => {
    assert.equal(formatStorePrice(0, "en"), "0 EGP");
    assert.equal(formatStorePrice(0, "ar"), "0 EGP");
    assert.equal(formatStorePrice(null, "en"), "0 EGP");
    assert.equal(formatStorePrice(undefined, "ar"), "0 EGP");
    assert.equal(formatStorePrice("not-a-price", "en"), "0 EGP");
  });

  it("uses known Arabic category labels by slug without changing database content", () => {
    assert.equal(getLocalizedCategoryName({ slug: "boxing", name: "Boxing" }, "ar"), "ملاكمة");
    assert.equal(getLocalizedCategoryName({ slug: "boxing", name: "Boxing" }, "en"), "Boxing");
    assert.equal(getLocalizedCategoryName({ slug: "custom", name: "Custom" }, "ar"), "Custom");
  });
});
