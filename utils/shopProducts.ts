export const SHOP_DEFAULT_MAX_PRICE = 10000;

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
