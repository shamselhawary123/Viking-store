export const ADMIN_COUPON_DISCOUNT_TYPES = ["percentage", "fixed_amount"] as const;

export type AdminCouponDiscountType = (typeof ADMIN_COUPON_DISCOUNT_TYPES)[number];
export type AdminCouponLifecycle = "active" | "scheduled" | "expired" | "inactive";
export type AdminCouponRestrictionMode = "all" | "products" | "categories";

export type AdminCouponForm = {
  code: string;
  name: string;
  description?: string | null;
  discount_type: AdminCouponDiscountType | string;
  discount_value: number | string | null;
  minimum_order_amount?: number | string | null;
  maximum_discount_amount?: number | string | null;
  starts_at?: string | null;
  expires_at?: string | null;
  active?: boolean;
  max_total_uses?: number | string | null;
  max_uses_per_user?: number | string | null;
};

type CouponLike = {
  id?: string;
  code?: string | null;
  name?: string | null;
  active?: boolean | null;
  discount_type?: string | null;
  discount_value?: number | string | null;
  starts_at?: string | null;
  expires_at?: string | null;
  created_at?: string | null;
  coupon_products?: any[] | null;
  coupon_categories?: any[] | null;
  coupon_redemptions?: any[] | null;
};

type CouponFilters = {
  search: string;
  active: "all" | "active" | "inactive";
  type: "all" | AdminCouponDiscountType;
  lifecycle: "all" | AdminCouponLifecycle;
  sort: "newest" | "oldest" | "code" | "usage";
};

const toNumber = (value: number | string | null | undefined, fallback = 0) => {
  if (value === "" || value === null || value === undefined) return fallback;
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
};

const optionalNumber = (value: number | string | null | undefined) => {
  if (value === "" || value === null || value === undefined) return null;
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
};

export const normalizeCouponCode = (code: string) =>
  code.trim().toUpperCase().replace(/\s+/g, "");

export const validateCouponForm = (form: AdminCouponForm) => {
  const code = normalizeCouponCode(String(form.code || ""));
  const discountValue = toNumber(form.discount_value, Number.NaN);
  const minimumOrderAmount = toNumber(form.minimum_order_amount, 0);
  const maximumDiscountAmount = optionalNumber(form.maximum_discount_amount);
  const maxTotalUses = optionalNumber(form.max_total_uses);
  const maxUsesPerUser = optionalNumber(form.max_uses_per_user);

  if (!code) return "Code is required.";
  if (!String(form.name || "").trim()) return "Name is required.";
  if (!ADMIN_COUPON_DISCOUNT_TYPES.includes(form.discount_type as AdminCouponDiscountType)) {
    return "Discount type is invalid.";
  }
  if (!Number.isFinite(discountValue) || discountValue <= 0) {
    return "Discount value must be greater than 0.";
  }
  if (form.discount_type === "percentage" && discountValue > 100) {
    return "Percentage discount cannot exceed 100.";
  }
  if (minimumOrderAmount < 0) return "Minimum order amount must be zero or more.";
  if (maximumDiscountAmount !== null && maximumDiscountAmount < 0) {
    return "Maximum discount amount must be zero or more.";
  }
  if (maxTotalUses !== null && maxTotalUses < 0) return "Maximum total uses must be zero or more.";
  if (maxUsesPerUser !== null && maxUsesPerUser < 0) {
    return "Maximum uses per user must be zero or more.";
  }
  if (form.starts_at && form.expires_at && new Date(form.expires_at) < new Date(form.starts_at)) {
    return "Expiration date must be after the start date.";
  }

  return "";
};

export const buildCouponPayload = (form: AdminCouponForm) => ({
  code: normalizeCouponCode(form.code),
  name: String(form.name || "").trim(),
  description: String(form.description || "").trim() || null,
  discount_type: form.discount_type as AdminCouponDiscountType,
  discount_value: toNumber(form.discount_value),
  minimum_order_amount: toNumber(form.minimum_order_amount),
  maximum_discount_amount:
    form.discount_type === "percentage" ? optionalNumber(form.maximum_discount_amount) : null,
  starts_at: form.starts_at || null,
  expires_at: form.expires_at || null,
  active: form.active !== false,
  max_total_uses: optionalNumber(form.max_total_uses),
  max_uses_per_user: optionalNumber(form.max_uses_per_user),
});

export const formatCouponDiscount = (coupon: Pick<CouponLike, "discount_type" | "discount_value">) => {
  const value = Number(coupon.discount_value || 0);

  if (coupon.discount_type === "percentage") {
    return `${value.toLocaleString("en-US", { maximumFractionDigits: 2 })}%`;
  }

  return `$${value.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
};

export const getCouponUsageCount = (coupon: CouponLike) =>
  Array.isArray(coupon.coupon_redemptions) ? coupon.coupon_redemptions.length : 0;

export const canDeleteCoupon = (coupon: CouponLike) => getCouponUsageCount(coupon) === 0;

export const getCouponRestrictionMode = (coupon: CouponLike): AdminCouponRestrictionMode => {
  if (coupon.coupon_products?.length) return "products";
  if (coupon.coupon_categories?.length) return "categories";
  return "all";
};

export const getCouponRestrictionSummary = (coupon: CouponLike) => {
  const productCount = coupon.coupon_products?.length || 0;
  const categoryCount = coupon.coupon_categories?.length || 0;

  if (productCount) return `${productCount} ${productCount === 1 ? "product" : "products"}`;
  if (categoryCount) return `${categoryCount} ${categoryCount === 1 ? "category" : "categories"}`;
  return "All products";
};

export const getCouponLifecycleStatus = (
  coupon: CouponLike,
  now = new Date(),
): AdminCouponLifecycle => {
  if (coupon.active === false) return "inactive";

  const startsAt = coupon.starts_at ? new Date(coupon.starts_at) : null;
  const expiresAt = coupon.expires_at ? new Date(coupon.expires_at) : null;

  if (startsAt && startsAt > now) return "scheduled";
  if (expiresAt && expiresAt < now) return "expired";
  return "active";
};

export const filterAdminCoupons = <T extends CouponLike>(
  coupons: T[],
  filters: CouponFilters,
  now = new Date(),
) => {
  const term = filters.search.trim().toLowerCase();

  return coupons
    .filter((coupon) => {
      const matchesSearch =
        !term ||
        [coupon.code, coupon.name]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(term));
      const matchesActive =
        filters.active === "all" ||
        (filters.active === "active" ? coupon.active !== false : coupon.active === false);
      const matchesType = filters.type === "all" || coupon.discount_type === filters.type;
      const matchesLifecycle =
        filters.lifecycle === "all" || getCouponLifecycleStatus(coupon, now) === filters.lifecycle;

      return matchesSearch && matchesActive && matchesType && matchesLifecycle;
    })
    .sort((a, b) => {
      if (filters.sort === "oldest") {
        return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
      }
      if (filters.sort === "code") {
        return String(a.code || "").localeCompare(String(b.code || ""));
      }
      if (filters.sort === "usage") {
        return getCouponUsageCount(b) - getCouponUsageCount(a);
      }

      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    });
};
