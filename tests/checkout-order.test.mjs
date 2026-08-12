import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildCheckoutOrderRequest } from "../utils/checkoutOrder.ts";

const cartItems = [
  {
    id: "product-1",
    title: "Training Shirt",
    image: "/shirt.png",
    price: 120,
    color: "Black",
    size: "L",
    quantity: 2,
  },
];

const customerData = {
  fullName: "Guest Customer",
  phone: "555-0100",
  city: "Cairo",
  address: "1 Training Street",
  notes: "Leave at door",
};

describe("buildCheckoutOrderRequest", () => {
  it("builds guest orders with a client-generated order id and null user_id", () => {
    const request = buildCheckoutOrderRequest({
      orderId: "11111111-1111-4111-8111-111111111111",
      cartItems,
      totalPrice: 240,
      customerData: {
        ...customerData,
        isGuest: true,
        user: null,
      },
    });

    assert.equal(request.orderPayload.id, "11111111-1111-4111-8111-111111111111");
    assert.equal(request.orderPayload.user_id, null);
    assert.equal(request.orderPayload.guest_name, "Guest Customer");
    assert.equal(request.orderItems[0].order_id, "11111111-1111-4111-8111-111111111111");
  });

  it("builds authenticated orders with the real authenticated user id", () => {
    const request = buildCheckoutOrderRequest({
      orderId: "22222222-2222-4222-8222-222222222222",
      cartItems,
      totalPrice: 240,
      customerData: {
        ...customerData,
        isGuest: false,
        user: { id: "user-123" },
      },
    });

    assert.equal(request.orderPayload.id, "22222222-2222-4222-8222-222222222222");
    assert.equal(request.orderPayload.user_id, "user-123");
    assert.equal(request.orderPayload.full_name, "Guest Customer");
    assert.equal(request.orderItems[0].order_id, "22222222-2222-4222-8222-222222222222");
  });
});
