export type CartItemInput = {
  id?: number | string;
  variant_id?: number | string | null;
  title?: string;
  slug?: string;
  category?: string;
  price?: number | string;
  oldPrice?: number | string | null;
  image?: string;
  color?: string;
  colorValue?: string;
  size?: string;
  quantity?: number | string;
  badge?: string | null;
  maxStock?: number | string | null;
};

export type AddCartItemInput = {
  product: any;
  selectedColor?: any;
  selectedSize: string;
  quantity: number;
  selectedImage: string;
  variant?: any | null;
};

const toPositiveInteger = (value: unknown, fallback = 1) => {
  const nextValue = Number(value);
  return Number.isInteger(nextValue) && nextValue > 0 ? nextValue : fallback;
};

const toNullableNumber = (value: unknown) => {
  if (value === null || value === undefined || value === "") return null;
  const nextValue = Number(value);
  return Number.isFinite(nextValue) ? nextValue : null;
};

export const normalizeCartItem = (item: CartItemInput) => ({
  ...item,
  id: item.id,
  variant_id: toNullableNumber(item.variant_id),
  quantity: toPositiveInteger(item.quantity),
  maxStock: item.maxStock === undefined || item.maxStock === null || item.maxStock === "" ? null : toNullableNumber(item.maxStock),
});

export const normalizeCartItems = (items: CartItemInput[]) =>
  items.map(normalizeCartItem);

export const getCartItemIdentity = (item: CartItemInput) =>
  item.variant_id
    ? `variant:${item.id}:${item.variant_id}`
    : `legacy:${item.id}:${item.color || ""}:${item.size || ""}`;

export const addCartItem = (items: CartItemInput[], input: AddCartItemInput) => {
  const variantId = input.variant?.id ?? null;
  const maxStock = variantId ? toNullableNumber(input.variant?.stock_quantity) : null;
  const requestedQuantity = toPositiveInteger(input.quantity);
  const item = normalizeCartItem({
    id: input.product.id,
    variant_id: variantId,
    title: input.product.title,
    slug: input.product.slug,
    category: input.product.category,
    price: variantId ? Number(input.variant.price || 0) : input.product.price,
    oldPrice: input.product.oldPrice,
    image: input.selectedImage || input.product.cover_image,
    color: input.selectedColor?.name || "",
    colorValue: input.selectedColor?.value || "",
    size: input.selectedSize,
    quantity: maxStock ? Math.min(requestedQuantity, maxStock) : requestedQuantity,
    badge: input.product.badge,
    maxStock,
  });
  const identity = getCartItemIdentity(item);
  const nextItems = normalizeCartItems(items);
  const existingItem = nextItems.find((nextItem) => getCartItemIdentity(nextItem) === identity);

  if (existingItem) {
    const nextQuantity = Number(existingItem.quantity) + requestedQuantity;
    existingItem.quantity = existingItem.maxStock ? Math.min(nextQuantity, Number(existingItem.maxStock)) : nextQuantity;
    return nextItems;
  }

  return [...nextItems, item];
};

export const increaseCartItemQuantity = (item: CartItemInput) => {
  const nextItem = normalizeCartItem(item);
  const currentQuantity = Number(nextItem.quantity || 1);

  if (nextItem.variant_id && nextItem.maxStock !== null && currentQuantity >= Number(nextItem.maxStock)) {
    return { item: nextItem, errorKey: "cart.quantityExceedsStock" };
  }

  return {
    item: {
      ...nextItem,
      quantity: currentQuantity + 1,
    },
    errorKey: "",
  };
};
