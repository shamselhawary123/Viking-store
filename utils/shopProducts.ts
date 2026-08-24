export const SHOP_DEFAULT_MAX_PRICE = 25000;

export const SHOP_PRODUCTS_SELECT = `
  *,
  categories(*),
  product_colors(
    *,
    product_images(*)
  ),
  product_sizes(*)
`;

export const isWithinShopPriceLimit = (
  price: number | string | null | undefined,
  maxPrice: number,
  defaultMaxPrice = SHOP_DEFAULT_MAX_PRICE,
) => {
  if (maxPrice >= defaultMaxPrice) return true;
  return Number(price || 0) <= maxPrice;
};

export const sortShopProducts = <T extends { price?: number | string | null }>(
  products: T[],
  sortBy: string,
) => {
  if (sortBy === "low") {
    return [...products].sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
  }

  if (sortBy === "high") {
    return [...products].sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
  }

  return products;
};
