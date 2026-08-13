import { defineStore } from "pinia";
import { SHOP_PRODUCTS_SELECT } from "../utils/shopProducts";

export const useProductsStore = defineStore("products", {
  state: () => ({
    products: [] as any[],
    loading: false,
    loaded: false,
  }),

  actions: {
    // GET ALL PRODUCTS
    async getProducts(force = false) {
      if (!force && (this.loaded || this.loading)) return;

      const supabase = useSupabase();

      this.loading = true;

      try {
        const { data, error } = await supabase
          .from("products")
          .select(SHOP_PRODUCTS_SELECT)
          .order("id", { ascending: false });

        if (error) throw error;

        this.products = data || [];
        this.loaded = true;
      } catch (error) {
        console.error(error);
        this.products = [];
        this.loaded = false;
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
