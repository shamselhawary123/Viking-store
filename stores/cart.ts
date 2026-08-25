import { defineStore } from "pinia";
import {
  addCartItem,
  increaseCartItemQuantity,
  normalizeCartItems,
} from "../utils/cartItems";

export const useCartStore = defineStore("cart", {
  state: () => ({
    items: [] as any[],
    isOpen: false,
    quantityErrorKey: "",
  }),

  actions: {
    addToCart(
      product: any,
      selectedColor: any,
      selectedSize: string,
      quantity: number,
      selectedImage: string,
      variant: any = null,
    ) {
      if (!selectedSize) return;

      this.quantityErrorKey = "";
      this.items = addCartItem(this.items, {
        product,
        selectedColor,
        selectedSize,
        quantity,
        selectedImage,
        variant,
      });

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
          this.items = normalizeCartItems(JSON.parse(savedCart));
        }
      }
    },

    increaseQuantity(index: number) {
      const result = increaseCartItemQuantity(this.items[index]);
      this.items[index] = result.item;
      this.quantityErrorKey = result.errorKey;

      localStorage.setItem("cart", JSON.stringify(this.items));
    },

    decreaseQuantity(index: number) {
      if (this.items[index].quantity > 1) {
        this.items[index].quantity--;
        this.quantityErrorKey = "";

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
