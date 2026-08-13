import { defineStore } from "pinia";

export const useCategoriesStore = defineStore("categories", {
  state: () => ({
    categories: [] as any[],
    loaded: false,
    loading: false,
  }),

  actions: {
    async getCategories(force = false) {
      if (!force && (this.loaded || this.loading)) return;

      const supabase = useSupabase();

      this.loading = true;

      try {
        const { data, error } = await supabase
          .from("categories")
          .select("*")
          .order("id");

        if (error) throw error;

        this.categories = [
          {
            id: 0,
            name: "All",
            slug: "all",
            image: "",
          },
          ...(data || []),
        ];
        this.loaded = true;
      } finally {
        this.loading = false;
      }
    },
  },
});
