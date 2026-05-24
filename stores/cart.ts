import { defineStore } from "pinia";

export const useCartStore = defineStore("cart", {
  state: () => ({
    items: [] as any[],
  }),

  getters: {
    totalItems: (state) =>
      state.items.reduce((acc, item) => acc + item.quantity, 0),

    totalPrice: (state) =>
      state.items.reduce((acc, item) => acc + item.price * item.quantity, 0),
  },

  actions: {
    addToCart(product: any) {
      const existingItem = this.items.find((item) => item.id === product.id);

      if (existingItem) {
        existingItem.quantity++;
      } else {
        this.items.push({
          ...product,
          quantity: 1,
        });
      }
    },

    removeFromCart(id: number) {
      this.items = this.items.filter((item) => item.id !== id);
    },

    increaseQuantity(id: number) {
      const item = this.items.find((item) => item.id === id);

      if (item) {
        item.quantity++;
      }
    },

    decreaseQuantity(id: number) {
      const item = this.items.find((item) => item.id === id);

      if (item && item.quantity > 1) {
        item.quantity--;
      }
    },
  },
});
