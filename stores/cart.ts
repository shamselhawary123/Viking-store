import { defineStore } from "pinia";

export const useCartStore = defineStore("cart", {
  state: () => ({
    items: [] as any[],
    isOpen: false,
  }),

  actions: {
    addToCart(
      product: any,
      selectedColor: any,
      selectedSize: string,
      quantity: number,
      selectedImage: string,
    ) {
      if (!selectedSize) return;

      const existingItem = this.items.find(
        (item) =>
          item.id === product.id &&
          item.color === selectedColor.name &&
          item.size === selectedSize,
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        this.items.push({
          id: product.id,

          title: product.title,

          slug: product.slug,

          category: product.category,

          price: product.price,

          oldPrice: product.oldPrice,

          image: selectedImage || product.cover_image,

          color: selectedColor.name,

          colorValue: selectedColor.value,

          size: selectedSize,

          quantity,

          badge: product.badge,
        });
      }

      localStorage.setItem("cart", JSON.stringify(this.items));
    },

    removeFromCart(index: number) {
      this.items.splice(index, 1);

      localStorage.setItem("cart", JSON.stringify(this.items));
    },

    clearCart() {
      this.items = [];

      localStorage.removeItem("cart");
    },

    loadCart() {
      if (typeof window !== "undefined") {
        const savedCart = localStorage.getItem("cart");

        if (savedCart) {
          this.items = JSON.parse(savedCart);
        }
      }
    },

    increaseQuantity(index: number) {
      this.items[index].quantity++;

      localStorage.setItem("cart", JSON.stringify(this.items));
    },

    decreaseQuantity(index: number) {
      if (this.items[index].quantity > 1) {
        this.items[index].quantity--;

        localStorage.setItem("cart", JSON.stringify(this.items));
      }
    },
    openCart() {
      this.isOpen = true;
    },

    closeCart() {
      this.isOpen = false;
    },
  },

  getters: {
    totalItems: (state) =>
      state.items.reduce((total, item) => total + item.quantity, 0),

    totalPrice: (state) =>
      state.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0,
      ),
  },
});
