import { defineStore } from "pinia";

export const useCategoriesStore = defineStore("categories", {
  state: () => ({
    categories: [] as any[],
  }),

  actions: {
    async getCategories() {
      const supabase = useSupabase();

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
    },
  },
});
