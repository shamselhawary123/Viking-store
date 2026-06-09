import { defineStore } from "pinia";

export const useShopStore = defineStore("shop", {
  state: () => ({
    search: "",
    selectedCategory: "All",
    sortBy: "default",
    maxPrice: 500,
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
