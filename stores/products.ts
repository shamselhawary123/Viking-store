import { defineStore } from "pinia";
import { getPublicSupabaseClient } from "../utils/publicSupabase";
import { SHOP_PRODUCT_DETAIL_SELECT, SHOP_PRODUCTS_SELECT } from "../utils/shopProducts";

const usePublicCatalogSupabase = () => {
  const config = useRuntimeConfig();

  return getPublicSupabaseClient(
    String(config.public.supabaseUrl || ""),
    String(config.public.supabaseKey || ""),
  );
};

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

      const supabase = usePublicCatalogSupabase();

      this.loading = true;

      try {
        const { data, error } = await supabase
          .from("products")
          .select(SHOP_PRODUCTS_SELECT)
          .order("shop_position", { ascending: true, nullsFirst: false })
          .order("id", { ascending: true });

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
      const supabase = usePublicCatalogSupabase();

      const { data, error } = await supabase
        .from("products")
        .select(SHOP_PRODUCT_DETAIL_SELECT)
        .eq("slug", slug)
        .eq("product_variants.is_active", true)
        .single();

      if (error) {
        console.error(error);
        return null;
      }

      return data;
    },

    // RELATED PRODUCTS
    async getRelatedProducts(categoryId: number, currentProductId: number) {
      const supabase = usePublicCatalogSupabase();

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
