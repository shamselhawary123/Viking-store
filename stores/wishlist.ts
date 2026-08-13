import { defineStore } from "pinia";

export const useWishlistStore = defineStore("wishlist", {
  state: () => ({
    items: [] as any[],
    loaded: false,
  }),

  actions: {
    loadWishlist() {
      if (this.loaded) return;

      if (typeof window !== "undefined") {
        const data = localStorage.getItem("wishlist");

        if (data) {
          this.items = JSON.parse(data);
        }
      }

      this.loaded = true;
    },

    addToWishlist(product: any) {
      const exists = this.items.find((item) => item.id === product.id);

      if (!exists) {
        this.items.push(product);

        localStorage.setItem("wishlist", JSON.stringify(this.items));
      }
    },

    removeFromWishlist(id: number) {
      this.items = this.items.filter((item) => item.id !== id);

      localStorage.setItem("wishlist", JSON.stringify(this.items));
    },

    toggleWishlist(product: any) {
      const exists = this.items.find((item) => item.id === product.id);

      if (exists) {
        this.removeFromWishlist(product.id);
      } else {
        this.addToWishlist(product);
      }
    },

    isFavorite(id: number) {
      return this.items.some((item) => item.id === id);
    },
  },
});
