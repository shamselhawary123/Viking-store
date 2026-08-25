export type AdminVariantImageInput = {
  preview?: string;
  image_url?: string;
};

export type AdminVariantColorInput = {
  key: string;
  id?: number | null;
  name: string;
  value: string;
  images?: AdminVariantImageInput[];
};

export type AdminVariantRowInput = {
  key: string;
  id?: number | null;
  colorKey?: string | null;
  colorId?: number | null;
  size?: string | null;
  sizeId?: number | null;
  price: number | string;
  stock_quantity: number | string;
  is_active?: boolean;
};

export type AdminVariantProductFormInput = {
  id?: number | null;
  name: string;
  slug: string;
  description?: string;
  badge?: string | null;
  old_price?: number | string | null;
  category_id: number;
  cover_image?: string | null;
};

export const normalizeVariantSize = (size?: string | null) => {
  const value = String(size || "").trim();
  return value || null;
};

const activeVariants = (variants: AdminVariantRowInput[]) =>
  variants.filter((variant) => variant.is_active !== false);

export const validateVariantProduct = ({
  colors,
  variants,
}: {
  colors: AdminVariantColorInput[];
  variants: AdminVariantRowInput[];
}) => {
  const enabledVariants = activeVariants(variants);
  if (!enabledVariants.length) return "admin.variantRequired";

  const colorKeys = new Set<string>();
  const colorByKey = new Map<string, AdminVariantColorInput>();

  for (const color of colors) {
    const key = color.key.trim();
    if (!key) return "admin.variantColorRequired";
    if (colorKeys.has(key)) return "admin.duplicateColorKeys";
    colorKeys.add(key);
    colorByKey.set(key, color);
    if (color.name.trim() && !color.value.trim()) return "admin.colorValueRequired";
  }

  const combinations = new Set<string>();
  for (const variant of variants) {
    const price = Number(variant.price);
    const stock = Number(variant.stock_quantity);
    if (!Number.isFinite(price) || price < 0) return "admin.variantPriceInvalid";
    if (!Number.isInteger(stock) || stock < 0) return "admin.variantStockInvalid";
    if (variant.colorKey && !colorByKey.has(variant.colorKey)) return "admin.variantColorRequired";

    const colorPart = variant.colorKey || variant.colorId || "";
    const sizePart = normalizeVariantSize(variant.size)?.toLowerCase() || "";
    const key = `${colorPart}::${sizePart}`;
    if (combinations.has(key)) return "admin.duplicateVariants";
    combinations.add(key);
  }

  return "";
};

export const buildVariantProductRpcPayload = ({
  form,
  colors,
  variants,
}: {
  form: AdminVariantProductFormInput;
  colors: AdminVariantColorInput[];
  variants: AdminVariantRowInput[];
}) => {
  const enabledVariants = activeVariants(variants);
  const firstColorImage = colors.find((color) => color.name.trim())?.images
    ?.map((image) => image.image_url || image.preview || "")
    .find((image) => image && !image.startsWith("blob:"));
  const minPrice = enabledVariants.reduce((minimum, variant) => {
    const price = Number(variant.price || 0);
    return minimum === null ? price : Math.min(minimum, price);
  }, null as number | null);

  return {
    p_product: {
      id: form.id || null,
      title: form.name.trim(),
      slug: form.slug.trim(),
      description: form.description || "",
      badge: form.badge || null,
      old_price: form.old_price === "" ? null : form.old_price ?? null,
      category_id: form.category_id,
      cover_image: firstColorImage || form.cover_image || "",
      inventory_model: "variants",
      price: minPrice ?? 0,
    },
    p_colors: colors
      .filter((color) => color.name.trim())
      .map((color) => ({
        key: color.key,
        id: color.id || null,
        name: color.name.trim(),
        value: color.value || "#000000",
        images: (color.images || [])
          .map((image) => image.image_url || image.preview || "")
          .filter((image) => image && !image.startsWith("blob:")),
      })),
    p_variants: variants.map((variant) => ({
      key: variant.key,
      id: variant.id || null,
      color_key: variant.colorKey || null,
      color_id: variant.colorId || null,
      size: normalizeVariantSize(variant.size),
      size_id: variant.sizeId || null,
      price: Number(variant.price || 0),
      stock_quantity: Number(variant.stock_quantity || 0),
      is_active: variant.is_active !== false,
    })),
  };
};

export const getVariantInventorySummary = (product: {
  inventory_model?: string | null;
  product_variants?: Array<{ is_active?: boolean | null; stock_quantity?: number | string | null }> | null;
}) => {
  const variants = product.inventory_model === "variants"
    ? (product.product_variants || []).filter((variant) => variant.is_active !== false)
    : [];

  return {
    variantCount: variants.length,
    totalStock: variants.reduce((sum, variant) => sum + Number(variant.stock_quantity || 0), 0),
  };
};
