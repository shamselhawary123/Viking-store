export type StorefrontVariantRow = {
  id: number;
  color_id?: number | null;
  size_id?: number | null;
  price?: number | string | null;
  stock_quantity?: number | string | null;
  is_active?: boolean | null;
};

export type StorefrontColorRow = {
  id: number;
  name?: string | null;
  value?: string | null;
  product_images?: Array<{ id?: number | null; image_url?: string | null }> | null;
};

export type StorefrontSizeRow = {
  id: number;
  size?: string | null;
};

export type StorefrontVariantProduct = {
  inventory_model?: string | null;
  cover_image?: string | null;
  image?: string | null;
  product_variants?: StorefrontVariantRow[] | null;
  product_colors?: StorefrontColorRow[] | null;
  product_sizes?: StorefrontSizeRow[] | null;
};

export type VariantMode = "legacy" | "color_size" | "color_only" | "size_only" | "simple" | "mixed";

export type VariantColorOption = {
  id: number;
  name: string;
  value: string;
  images: string[];
  soldOut: boolean;
};

export type VariantSizeOption = {
  id: number;
  label: string;
  soldOut: boolean;
};

export type VariantSelectionState = {
  mode: VariantMode;
  variants: StorefrontVariantRow[];
  colors: VariantColorOption[];
  sizes: VariantSizeOption[];
  hasAvailableStock: boolean;
  sizesForColor: (colorId?: number | null) => VariantSizeOption[];
  isSizeValidForColor: (sizeId?: number | null, colorId?: number | null) => boolean;
  isSizePurchasableForColor: (sizeId?: number | null, colorId?: number | null) => boolean;
  firstAvailableColor: () => VariantColorOption | null;
  firstAvailableSizeForColor: (colorId?: number | null) => VariantSizeOption | null;
};

export const isLegacyInventoryProduct = (product?: { inventory_model?: string | null } | null) =>
  product?.inventory_model !== "variants";

const numberOrNull = (value: unknown) => {
  const nextValue = Number(value);
  return Number.isFinite(nextValue) ? nextValue : null;
};

const uniqueById = <T extends { id: number }>(items: T[]) => {
  const seen = new Set<number>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
};

const variantHasStock = (variant: StorefrontVariantRow) =>
  Number(variant.stock_quantity || 0) > 0;

const byStableId = <T extends { id?: number | null }>(left: T, right: T) =>
  Number(left.id || 0) - Number(right.id || 0);

export const buildVariantSelectionState = (product?: StorefrontVariantProduct | null): VariantSelectionState => {
  if (!product || isLegacyInventoryProduct(product)) {
    return {
      mode: "legacy",
      variants: [],
      colors: [],
      sizes: [],
      hasAvailableStock: true,
      sizesForColor: () => [],
      isSizeValidForColor: () => false,
      isSizePurchasableForColor: () => false,
      firstAvailableColor: () => null,
      firstAvailableSizeForColor: () => null,
    };
  }

  const variants = [...(product.product_variants || [])].filter((variant) => variant.is_active !== false).sort(byStableId);
  const productColors = [...(product.product_colors || [])].sort(byStableId);
  const productSizes = [...(product.product_sizes || [])].sort(byStableId);
  const colorById = new Map(productColors.map((color) => [color.id, color]));
  const sizeById = new Map(productSizes.map((size) => [size.id, size]));
  const hasAvailableStock = variants.some(variantHasStock);
  const shapes = new Set(variants.map((variant) => {
    const hasColor = variant.color_id != null;
    const hasSize = variant.size_id != null;
    if (hasColor && hasSize) return "color_size";
    if (hasColor) return "color_only";
    if (hasSize) return "size_only";
    return "simple";
  }));
  const mode = shapes.size === 1
    ? (Array.from(shapes)[0] as VariantMode || "simple")
    : "mixed";

  const colors = uniqueById(
    variants
      .map((variant) => numberOrNull(variant.color_id))
      .filter((id): id is number => id != null)
      .map((id) => {
        const color = colorById.get(id);
        const colorVariants = variants.filter((variant) => Number(variant.color_id) === id);
        return {
          id,
          name: color?.name || "",
          value: color?.value || "#171717",
          images: [...(color?.product_images || [])].sort(byStableId).map((image) => image.image_url || "").filter(Boolean),
          soldOut: colorVariants.every((variant) => !variantHasStock(variant)),
        };
      })
      .filter((color) => color.name),
  );

  const buildSizes = (filteredVariants: StorefrontVariantRow[]) =>
    uniqueById(
      filteredVariants
        .map((variant) => numberOrNull(variant.size_id))
        .filter((id): id is number => id != null)
        .map((id) => {
          const size = sizeById.get(id);
          const sizeVariants = filteredVariants.filter((variant) => Number(variant.size_id) === id);
          return {
            id,
            label: size?.size || "",
            soldOut: sizeVariants.every((variant) => !variantHasStock(variant)),
          };
        })
        .filter((size) => size.label),
    );

  const sizesForColor = (colorId?: number | null) =>
    buildSizes(colorId == null ? variants : variants.filter((variant) => Number(variant.color_id) === Number(colorId)));

  const selectionState = {
    mode,
    variants,
    colors,
    sizes: buildSizes(variants),
    hasAvailableStock,
    sizesForColor,
    isSizeValidForColor: (sizeId?: number | null, colorId?: number | null) =>
      sizeId != null && sizesForColor(colorId).some((size) => size.id === Number(sizeId)),
    isSizePurchasableForColor: (sizeId?: number | null, colorId?: number | null) =>
      sizeId != null && sizesForColor(colorId).some((size) => size.id === Number(sizeId) && !size.soldOut),
    firstAvailableColor: () => colors.find((color) => !color.soldOut) || colors[0] || null,
    firstAvailableSizeForColor: (colorId?: number | null) => {
      const sizes = sizesForColor(colorId);
      return sizes.find((size) => !size.soldOut) || null;
    },
  };

  return selectionState;
};

export const getInitialVariantSelection = (state: VariantSelectionState) => {
  const color = state.mode === "color_size" || state.mode === "color_only"
    ? state.firstAvailableColor()
    : null;
  const size = state.mode === "color_size" || state.mode === "size_only"
    ? state.firstAvailableSizeForColor(color?.id ?? null)
    : null;

  return {
    color,
    size,
  };
};

export const resolveSelectedVariant = (
  state: VariantSelectionState,
  selection: { colorId?: number | null; sizeId?: number | null },
) => {
  if (state.mode === "simple") return state.variants[0] || null;

  return state.variants.find((variant) => {
    if (state.mode === "color_size") {
      return Number(variant.color_id) === Number(selection.colorId)
        && Number(variant.size_id) === Number(selection.sizeId);
    }

    if (state.mode === "color_only") return Number(variant.color_id) === Number(selection.colorId);
    if (state.mode === "size_only") return Number(variant.size_id) === Number(selection.sizeId);
    return false;
  }) || null;
};

export const getVariantPriceState = (
  state: VariantSelectionState,
  selection: { colorId?: number | null; sizeId?: number | null },
) => {
  const selectedVariant = resolveSelectedVariant(state, selection);
  if (selectedVariant) {
    return { type: "selected" as const, price: Number(selectedVariant.price || 0) };
  }

  const relevantVariants = state.mode === "color_size" && selection.colorId != null
    ? state.variants.filter((variant) => Number(variant.color_id) === Number(selection.colorId))
    : state.variants;
  const prices = relevantVariants.map((variant) => Number(variant.price || 0)).filter((price) => Number.isFinite(price));
  const minPrice = Math.min(...prices);

  if (!prices.length || !Number.isFinite(minPrice)) return { type: "single" as const, price: 0 };
  if (prices.every((price) => price === prices[0])) return { type: "single" as const, price: prices[0] };

  return { type: "from" as const, price: minPrice };
};

export const getVariantGalleryImages = (
  product: StorefrontVariantProduct,
  state: VariantSelectionState,
  colorId?: number | null,
) => {
  const fallback = [product.cover_image || product.image || ""].filter(Boolean);
  const color = state.colors.find((item) => item.id === Number(colorId));
  return color?.images.length ? color.images : fallback;
};

export const getVariantSelectionErrorKey = (
  state: VariantSelectionState,
  selection: { colorId?: number | null; sizeId?: number | null },
) => {
  if (!state.hasAvailableStock) return "shop.outOfStock";
  if (state.mode === "color_size" && selection.colorId == null) return "shop.selectColorRequired";
  if (state.mode === "color_size" && selection.sizeId == null) return "shop.selectSizeRequired";
  if (state.mode === "color_only" && selection.colorId == null) return "shop.selectColorRequired";
  if (state.mode === "size_only" && selection.sizeId == null) return "shop.selectSizeRequired";

  const variant = resolveSelectedVariant(state, selection);
  if (!variant) return "shop.unavailableCombination";
  if (!variantHasStock(variant)) return "shop.outOfStock";

  return "";
};
