import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  getProductReviewSummary,
  normalizeReviewInput,
  reviewerDisplayName,
} from "../utils/productReviews.ts";

describe("product reviews", () => {
  it("calculates review count, average rating, and star distribution", () => {
    const summary = getProductReviewSummary([
      { rating: 5 },
      { rating: 5 },
      { rating: 4 },
      { rating: 1 },
    ]);

    assert.equal(summary.total, 4);
    assert.equal(summary.average, 3.75);
    assert.equal(summary.displayAverage, "3.8");
    assert.deepEqual(summary.distribution, {
      5: 2,
      4: 1,
      3: 0,
      2: 0,
      1: 1,
    });
  });

  it("ignores invalid persisted ratings when building the summary", () => {
    const summary = getProductReviewSummary([
      { rating: 5 },
      { rating: 6 },
      { rating: 0 },
      { rating: null },
    ]);

    assert.equal(summary.total, 1);
    assert.equal(summary.average, 5);
    assert.equal(summary.displayAverage, "5.0");
    assert.equal(summary.distribution[5], 1);
  });

  it("normalizes review input and rejects invalid values", () => {
    assert.deepEqual(normalizeReviewInput(4, "  Strong gloves.  "), {
      ok: true,
      rating: 4,
      comment: "Strong gloves.",
    });
    assert.deepEqual(normalizeReviewInput(0, "Great"), {
      ok: false,
      error: "rating",
    });
    assert.deepEqual(normalizeReviewInput(5, "   "), {
      ok: false,
      error: "comment",
    });
  });

  it("uses profile names without exposing email fallbacks", () => {
    assert.equal(reviewerDisplayName({ full_name: "  Omar Ali  " }, "Member"), "Omar Ali");
    assert.equal(reviewerDisplayName({ full_name: "" }, "Member"), "Member");
  });
});
