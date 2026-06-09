export const useProducts = () => {
  const supabase = useSupabase();

  const getProducts = async () => {
    const { data, error } = await supabase.from("products").select(`
      *,
      categories (
        name,
        slug
      ),
      product_colors (
        id,
        name,
        value
      ),
      product_sizes (
        size,
        in_stock
      )
    `);

    if (error) throw error;

    return data;
  };

  const getProductBySlug = async (slug: string) => {
    const { data, error } = await supabase
      .from("products")
      .select(
        `
        *,
        categories (
          name,
          slug
        ),
        product_colors (
          id,
          name,
          value
        ),
        product_sizes (
          size,
          in_stock
        )
      `,
      )
      .eq("slug", slug)
      .single();

    if (error) throw error;

    return data;
  };

  return {
    getProducts,
    getProductBySlug,
  };
};
