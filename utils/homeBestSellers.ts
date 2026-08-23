export type HomeBestSellerSlot = "gloves" | "shorts" | "overall";

export type HomeBestSellerResult = {
  slot?: HomeBestSellerSlot | null;
  product_id?: number | string | null;
  is_real_best_seller?: boolean | null;
};

export type BestSellerProduct = {
  id?: number | string | null;
  slug?: string | null;
  created_at?: string | null;
  categories?: { slug?: string | null; name?: string | null } | null;
  category?: string | null;
  isRealBestSeller?: boolean;
  [key: string]: any;
};

export const categorySlugForProduct = (product: BestSellerProduct) =>
  String(product.categories?.slug || product.category || "")
    .trim()
    .toLowerCase();

const OVERALL_EXCLUDED_CATEGORY_SLUGS = new Set(["gloves", "shorts"]);

const newestFirst = (products: BestSellerProduct[]) =>
  [...products].sort((a, b) => {
    const dateDiff =
      new Date(b.created_at || 0).getTime() -
      new Date(a.created_at || 0).getTime();

    if (dateDiff !== 0) return dateDiff;

    return String(b.id || "").localeCompare(String(a.id || ""));
  });

const newestProduct = (
  products: BestSellerProduct[],
  categorySlug?: string,
  excludedCategorySlugs = new Set<string>(),
) =>
  newestFirst(products).find((product) =>
    categorySlug
      ? categorySlugForProduct(product) === categorySlug
      : !excludedCategorySlugs.has(categorySlugForProduct(product)),
  ) || null;

const isHomeBestSellerSlot = (
  slot: HomeBestSellerResult["slot"],
): slot is HomeBestSellerSlot =>
  slot === "gloves" || slot === "shorts" || slot === "overall";

const productWithBestSellerFlag = (
  product: BestSellerProduct | null,
  isRealBestSeller: boolean,
) => (product ? { ...product, isRealBestSeller } : null);

export const selectHomepageBestSellerProducts = ({
  bestSellerResults,
  bestSellerProducts,
  fallbackProducts,
}: {
  bestSellerResults: HomeBestSellerResult[];
  bestSellerProducts: BestSellerProduct[];
  fallbackProducts: BestSellerProduct[];
}) => {
  const resultsBySlot = new Map(
    bestSellerResults
      .filter((result) => isHomeBestSellerSlot(result.slot))
      .map((result) => [result.slot, result]),
  );
  const productById = new Map(
    bestSellerProducts.map((product) => [String(product.id), product]),
  );

  const productForSlot = (
    slot: HomeBestSellerSlot,
    fallbackCategorySlug?: string,
    excludedCategorySlugs = new Set<string>(),
  ) => {
    const result = resultsBySlot.get(slot);
    const rpcProduct = result?.product_id
      ? productById.get(String(result.product_id)) || null
      : null;

    if (
      rpcProduct &&
      !excludedCategorySlugs.has(categorySlugForProduct(rpcProduct))
    ) {
      return productWithBestSellerFlag(
        rpcProduct,
        Boolean(result?.is_real_best_seller),
      );
    }

    return productWithBestSellerFlag(
      newestProduct(fallbackProducts, fallbackCategorySlug, excludedCategorySlugs),
      false,
    );
  };

  return [
    productForSlot("gloves", "gloves"),
    productForSlot("shorts", "shorts"),
    productForSlot("overall", undefined, OVERALL_EXCLUDED_CATEGORY_SLUGS),
  ].filter(Boolean) as BestSellerProduct[];
};
