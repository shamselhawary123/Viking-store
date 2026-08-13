import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  ADMIN_ORDER_STATUSES,
  ADMIN_REVENUE_ORDER_STATUSES,
  buildProductImagePath,
  buildProductPayload,
  calculateAdminDashboardStats,
  filterAdminOrders,
  getAdminOrderLabel,
  getOrderCustomer,
  getOrderCustomerType,
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
        email: "-",
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
        email: "-",
        phone: "777",
        city: "Giza",
        address: "Account Street",
        notes: "Call first",
      },
    );

    assert.deepEqual(
      getOrderCustomer({
        full_name: "Account Buyer",
        guest_name: "Guest Buyer",
        phone: "777",
        guest_phone: "555",
        city: "Giza",
        guest_city: "Cairo",
        address: "Account Street",
        guest_address: "Guest Street",
        notes: "Call first",
        guest_notes: "Ring bell",
        guest_email: "guest@example.com",
      }),
      {
        name: "Account Buyer",
        email: "guest@example.com",
        phone: "777",
        city: "Giza",
        address: "Account Street",
        notes: "Call first",
      },
    );
  });

  it("maps product forms onto existing product columns without invented fields", () => {
    const payload = buildProductPayload({
      name: "Heavy Gloves",
      slug: "heavy-gloves",
      description: "Training gloves",
      price: 120,
      old_price: 90,
      category_id: 5,
      cover_image: "https://example.com/gloves.png",
    });

    assert.deepEqual(payload, {
      title: "Heavy Gloves",
      slug: "heavy-gloves",
      description: "Training gloves",
      price: 120,
      old_price: 90,
      category_id: 5,
      cover_image: "https://example.com/gloves.png",
    });
    assert.equal(Object.hasOwn(payload, "stock"), false);
    assert.equal(Object.hasOwn(payload, "sale_price"), false);
    assert.equal(Object.hasOwn(payload, "name"), false);
  });

  it("builds unique safe product image paths for the products bucket", () => {
    assert.equal(
      buildProductImagePath("Black Glove Final.PNG", 1700000000000),
      "product-images/1700000000000-black-glove-final.png",
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
    assert.deepEqual(ADMIN_REVENUE_ORDER_STATUSES, ["delivered"]);
  });

  it("calculates dashboard order totals from real order rows", () => {
    const stats = calculateAdminDashboardStats([
      { id: "order-1", status: "pending", total_price: 100 },
      { id: "order-2", status: "processing", total_price: 200 },
      { id: "order-3", status: "delivered", total_price: 300 },
      { id: "order-4", status: "cancelled", total_price: 400 },
    ]);

    assert.deepEqual(stats, {
      totalOrders: 4,
      pendingOrders: 1,
      completedOrders: 1,
      totalRevenue: 300,
    });
  });

  it("labels admin orders by order number when available", () => {
    assert.equal(getAdminOrderLabel({ id: "12345678-aaaa", order_number: "VK-1001" }), "VK-1001");
    assert.equal(getAdminOrderLabel({ id: "12345678-aaaa" }), "12345678");
  });

  it("identifies guest versus authenticated order customers", () => {
    assert.equal(getOrderCustomerType({ user_id: "user-1" }), "Authenticated");
    assert.equal(getOrderCustomerType({ user_id: null }), "Guest");
  });

  it("filters admin orders by search, order status, and payment status", () => {
    const orders = [
      {
        id: "order-1",
        order_number: "VK-1001",
        full_name: "Account Buyer",
        phone: "777",
        status: "processing",
        payment_status: "paid",
      },
      {
        id: "order-2",
        order_number: "VK-1002",
        guest_name: "Guest Buyer",
        guest_phone: "555",
        status: "pending",
        payment_status: "unpaid",
      },
    ];

    assert.deepEqual(
      filterAdminOrders(orders, { search: "guest", status: "all", paymentStatus: "all" }).map((order) => order.id),
      ["order-2"],
    );
    assert.deepEqual(
      filterAdminOrders(orders, { search: "", status: "processing", paymentStatus: "paid" }).map((order) => order.id),
      ["order-1"],
    );
  });
});
