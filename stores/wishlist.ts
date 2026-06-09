import { defineStore } from "pinia";

export const useWishlistStore = defineStore("wishlist", {
  state: () => ({
    items: [] as any[],
  }),

  actions: {
    loadWishlist() {
      const saved = localStorage.getItem("wishlist");

      if (saved) {
        this.items = JSON.parse(saved);
      }
    },

    toggleWishlist(product: any) {
      const exists = this.items.find((item) => item.id === product.id);

      if (exists) {
        this.items = this.items.filter((item) => item.id !== product.id);
      } else {
        this.items.push(product);
      }

      localStorage.setItem("wishlist", JSON.stringify(this.items));
    },

    isInWishlist(id: string) {
      return this.items.some((item) => item.id === id);
    },
  },
});
