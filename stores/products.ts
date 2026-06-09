import { defineStore } from "pinia";

export const useProductsStore = defineStore("products", {
  state: () => ({
    products: [] as any[],
    loading: false,
  }),

  actions: {
    // GET ALL PRODUCTS
    async getProducts() {
      const supabase = useSupabase();

      this.loading = true;

      try {
        const { data, error } = await supabase.from("products").select(`
            *,
            categories(*)
          `);

        if (error) throw error;

        console.log("PRODUCTS =>", data);

        this.products = data || [];
      } catch (error) {
        console.error(error);
      } finally {
        this.loading = false;
      }
    },

    // GET PRODUCT BY SLUG
    async getProductBySlug(slug: string) {
      const supabase = useSupabase();

      const { data, error } = await supabase
        .from("products")
        .select(
          `
          *,
          categories(*),
          product_colors(
            *,
            product_images(*)
          ),
          product_sizes(*)
        `,
        )
        .eq("slug", slug)
        .single();

      if (error) {
        console.error(error);
        return null;
      }

      console.log("PRODUCT =>", data);
      console.log("CATEGORY =>", data.categories);
      console.log("COLORS =>", data.product_colors);
      console.log("SIZES =>", data.product_sizes);

      return data;
    },

    // RELATED PRODUCTS
    async getRelatedProducts(categoryId: number, currentProductId: number) {
      const supabase = useSupabase();

      const { data, error } = await supabase
        .from("products")
        .select(
          `
          *,
          categories(*)
        `,
        )
        .eq("category_id", categoryId)
        .neq("id", currentProductId)
        .limit(4);

      if (error) throw error;

      return data || [];
    },
  },
});
