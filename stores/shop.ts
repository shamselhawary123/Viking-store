import { defineStore } from "pinia";
import { SHOP_DEFAULT_MAX_PRICE } from "../utils/shopProducts";

export const useShopStore = defineStore("shop", {
  state: () => ({
    search: "",
    selectedCategory: "all",
    sortBy: "default",
    maxPrice: SHOP_DEFAULT_MAX_PRICE,
    mobileFiltersOpen: false,
  }),

  actions: {
    setCategory(category: string) {
      this.selectedCategory = category;
    },

    setSearch(value: string) {
      this.search = value;
    },

    setSort(value: string) {
      this.sortBy = value;
    },

    setPrice(value: number) {
      this.maxPrice = value;
    },
  },
});
