import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  ADMIN_ORDER_STATUSES,
  buildProductPayload,
  getOrderCustomer,
  isAdminProfile,
} from "../utils/admin.ts";

describe("admin helpers", () => {
  it("allows only explicit admin profiles", () => {
    assert.equal(isAdminProfile({ role: "admin" }), true);
    assert.equal(isAdminProfile({ role: "owner" }), true);
    assert.equal(isAdminProfile({ is_admin: true }), true);
    assert.equal(isAdminProfile({ admin: true }), true);
    assert.equal(isAdminProfile({ role: "customer" }), false);
    assert.equal(isAdminProfile(null), false);
  });

  it("normalizes guest and account order customer fields", () => {
    assert.deepEqual(
      getOrderCustomer({
        guest_name: "Guest Buyer",
        guest_phone: "555",
        guest_city: "Cairo",
        guest_address: "Guest Street",
        guest_notes: "Ring bell",
      }),
      {
        name: "Guest Buyer",
        phone: "555",
        city: "Cairo",
        address: "Guest Street",
        notes: "Ring bell",
      },
    );

    assert.deepEqual(
      getOrderCustomer({
        full_name: "Account Buyer",
        phone: "777",
        city: "Giza",
        address: "Account Street",
        notes: "Call first",
      }),
      {
        name: "Account Buyer",
        phone: "777",
        city: "Giza",
        address: "Account Street",
        notes: "Call first",
      },
    );
  });

  it("maps product MVP form fields onto existing product columns", () => {
    assert.deepEqual(
      buildProductPayload({
        name: "Heavy Gloves",
        slug: "heavy-gloves",
        description: "Training gloves",
        price: 120,
        sale_price: 90,
        stock: 12,
        category_id: 5,
        image: "https://example.com/gloves.png",
      }),
      {
        title: "Heavy Gloves",
        slug: "heavy-gloves",
        description: "Training gloves",
        price: 120,
        old_price: 90,
        stock: 12,
        category_id: 5,
        cover_image: "https://example.com/gloves.png",
      },
    );
  });

  it("uses only the supported MVP order statuses", () => {
    assert.deepEqual(ADMIN_ORDER_STATUSES, [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ]);
  });
});
