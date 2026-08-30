import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { describe, it } from "node:test";

const ordersPage = readFileSync("pages/profile/orders/index.vue", "utf8");
const en = JSON.parse(readFileSync("locales/en.json", "utf8"));
const ar = JSON.parse(readFileSync("locales/ar.json", "utf8"));
const cardPath = "components/shared/CustomerOrderCard.vue";
const trackerPath = "components/shared/CustomerOrderStatusTracker.vue";
const card = existsSync(cardPath) ? readFileSync(cardPath, "utf8") : "";
const tracker = existsSync(trackerPath) ? readFileSync(trackerPath, "utf8") : "";

describe("profile orders UI", () => {
  it("keeps existing order fetching and details routing while showing five orders initially", () => {
    assert.match(ordersPage, /authStore\.getOrders\(\)/);
    assert.match(ordersPage, /visibleCount\s*=\s*ref\(5\)/);
    assert.match(ordersPage, /visibleOrders\s*=\s*computed\(\(\)\s*=>\s*orders\.value\.slice\(0,\s*visibleCount\.value\)\)/);
    assert.match(ordersPage, /visibleCount\.value \+= 5/);
    assert.match(ordersPage, /v-if="hasMoreOrders"/);
    assert.match(ordersPage, /profile\.showMore/);
    assert.match(card, /:to="`\/profile\/orders\/\$\{order\.id\}`"/);
    assert.match(card, /profile\.viewDetails/);
  });

  it("centralizes status to timeline mapping and keeps cancelled terminal", () => {
    assert.ok(existsSync(trackerPath), "expected order status tracker component");
    assert.match(tracker, /pending:\s*0/);
    assert.match(tracker, /processing:\s*1/);
    assert.match(tracker, /shipped:\s*2/);
    assert.match(tracker, /delivered:\s*3/);
    assert.match(tracker, /isCancelled\s*=\s*computed\(\(\)\s*=>\s*status\.value === "cancelled"\)/);
    const stagesBlock = tracker.match(/const normalStages = \[([^\]]+)\]/)?.[1] || "";
    assert.doesNotMatch(stagesBlock, /cancelled/);
    assert.match(tracker, /profile\.statusCopy\.\$\{status\.value\}/);
  });

  it("defines polished tracker animation with reduced-motion support", () => {
    assert.match(tracker, /progressPercent/);
    assert.match(tracker, /markerIcon/);
    assert.match(tracker, /transition:\s*width 760ms|transition-\[width/);
    assert.match(tracker, /prefers-reduced-motion:\s*reduce/);
  });

  it("styles the show more action as a visible secondary button", () => {
    assert.match(ordersPage, /profile\.showMore/);
    assert.match(ordersPage, /border-\[#CF1D1D\]\/40/);
    assert.match(ordersPage, /bg-neutral-950/);
    assert.match(ordersPage, /focus-visible:ring-\[#CF1D1D\]/);
  });

  it("uses semantic current-stage colors while completed and future stages stay distinct", () => {
    assert.match(tracker, /currentStageTheme/);
    assert.match(tracker, /pending:\s*{\s*circle:\s*"border-amber-400\/50 bg-amber-400\/15 text-amber-200"/);
    assert.match(tracker, /processing:\s*{\s*circle:\s*"border-orange-400\/50 bg-orange-400\/15 text-orange-200"/);
    assert.match(tracker, /shipped:\s*{\s*circle:\s*"border-blue-400\/50 bg-blue-400\/15 text-blue-200"/);
    assert.match(tracker, /delivered:\s*{\s*circle:\s*"border-emerald-400\/50 bg-emerald-400\/15 text-emerald-200"/);
    assert.match(tracker, /completedStageTheme/);
    assert.match(tracker, /border-\[#CF1D1D\] bg-\[#CF1D1D\] text-white/);
    assert.match(tracker, /futureStageTheme/);
    assert.match(tracker, /border-white\/10 bg-black text-neutral-500/);
    assert.match(tracker, /isCancelled/);
    assert.match(tracker, /border-red-500\/20 bg-red-500\/\[0\.07\]/);
  });

  it("defines exact customer status labels and new order copy in both locales", () => {
    assert.equal(en.orders.pending, "Pending");
    assert.equal(en.orders.processing, "Processing");
    assert.equal(en.orders.shipped, "Shipped");
    assert.equal(en.orders.delivered, "Delivered");
    assert.equal(en.orders.cancelled, "Cancelled");

    assert.equal(ar.orders.pending, "قيد الانتظار");
    assert.equal(ar.orders.processing, "قيد التجهيز");
    assert.equal(ar.orders.shipped, "تم الشحن");
    assert.equal(ar.orders.delivered, "تم التسليم");
    assert.equal(ar.orders.cancelled, "ملغي");

    assert.equal(en.profile.showMore, "Show more");
    assert.equal(ar.profile.showMore, "عرض المزيد");
    assert.equal(en.profile.viewDetails, "View details");
    assert.equal(ar.profile.viewDetails, "عرض التفاصيل");
    assert.ok(en.profile.statusCopy.pending);
    assert.ok(ar.profile.statusCopy.pending);
  });
});
