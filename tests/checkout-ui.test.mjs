import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

const checkoutPage = readFileSync("pages/checkout.vue", "utf8");
const governorateSelect = readFileSync(
  "components/checkout/GovernorateSelect.vue",
  "utf8",
);
const en = JSON.parse(readFileSync("locales/en.json", "utf8"));
const ar = JSON.parse(readFileSync("locales/ar.json", "utf8"));

describe("checkout UI refinement", () => {
  it("uses the custom governorate selector with the existing checkout code binding", () => {
    assert.match(checkoutPage, /<GovernorateSelect/);
    assert.match(checkoutPage, /v-model="selectedGovernorateCode"/);
    assert.match(checkoutPage, /:governorates="shippingGovernorates"/);
    assert.doesNotMatch(checkoutPage, /<select[\s\S]*selectedGovernorateCode/);
    assert.match(checkoutPage, /watch\(selectedGovernorateCode/);
    assert.match(checkoutPage, /p_governorate_code: selectedGovernorateCode\.value \|\| null/);
  });

  it("keeps checkout validation, preview, and coupon wiring intact", () => {
    assert.match(checkoutPage, /if \(!selectedGovernorateCode\.value\)[\s\S]*checkout\.governorateRequired/);
    assert.match(checkoutPage, /preview_checkout_totals/);
    assert.match(checkoutPage, /applyCoupon/);
    assert.match(checkoutPage, /normalizeCheckoutCouponCode/);
    assert.match(checkoutPage, /authStore\.createOrder/);
    assert.match(checkoutPage, /governorateCode: selectedGovernorateCode\.value/);
  });

  it("defines a searchable keyboard-friendly custom dropdown", () => {
    assert.match(governorateSelect, /defineModel<string>/);
    assert.match(governorateSelect, /role="combobox"/);
    assert.match(governorateSelect, /role="listbox"/);
    assert.match(governorateSelect, /ArrowDown/);
    assert.match(governorateSelect, /ArrowUp/);
    assert.match(governorateSelect, /Escape/);
    assert.match(governorateSelect, /filteredGovernorates/);
    assert.match(governorateSelect, /checkout\.searchGovernorates/);
    assert.match(governorateSelect, /checkout\.noGovernorateFound/);
  });

  it("keeps dropdown scrolling and option clicks inside an opaque panel", () => {
    assert.match(governorateSelect, /@click\.stop/);
    assert.match(governorateSelect, /@wheel\.stop/);
    assert.match(governorateSelect, /@touchmove\.stop/);
    assert.match(governorateSelect, /max-height: 20rem/);
    assert.match(governorateSelect, /overflow-y: auto/);
    assert.match(governorateSelect, /overscroll-behavior: contain/);
    assert.match(governorateSelect, /background: #080808/);
    assert.match(governorateSelect, /z-index: 80/);
    assert.match(governorateSelect, /position: sticky/);
  });

  it("does not nest the interactive governorate dropdown inside a label", () => {
    assert.doesNotMatch(
      checkoutPage,
      /<label class="field-block checkout-field"[\s\S]*<GovernorateSelect[\s\S]*<\/label>/,
    );
    assert.match(checkoutPage, /<div class="field-block checkout-field">[\s\S]*<GovernorateSelect/);
  });

  it("keeps the open dropdown in the same hit-test layer as later checkout fields", () => {
    assert.doesNotMatch(
      checkoutPage,
      /\.checkout-field\s*{[\s\S]*isolation:\s*isolate/i,
    );
    assert.match(governorateSelect, /class="governorate-select"/);
    assert.match(governorateSelect, /:class="\{ 'is-open': isOpen \}"/);
    assert.match(governorateSelect, /\.governorate-select\.is-open[\s\S]*z-index: 90/i);
  });

  it("keeps all enabled governorates selectable without mutating checkout data", () => {
    assert.match(governorateSelect, /props\.governorates\.filter/);
    assert.match(governorateSelect, /item\.code === selectedCode\.value/);
    assert.match(governorateSelect, /selectedCode\.value = governorate\.code/);
    assert.doesNotMatch(governorateSelect, /\.sort\(/);
  });

  it("defines localized dropdown search strings", () => {
    assert.equal(en.checkout.searchGovernorates, "Search governorates");
    assert.equal(ar.checkout.searchGovernorates, "ابحث عن المحافظة");
    assert.equal(en.checkout.noGovernorateFound, "No governorate found");
    assert.equal(ar.checkout.noGovernorateFound, "لا توجد محافظة مطابقة");
  });
});
