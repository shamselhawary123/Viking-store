export type CheckoutCouponDiscountType = "percentage" | "fixed_amount";

export type CheckoutCouponItem = {
  id: number | string;
  price: number | string;
  quantity: number | string;
  category_id?: number | string | null;
};

export type CheckoutCoupon = {
  id: string;
  code: string;
  active: boolean;
  discount_type: CheckoutCouponDiscountType | string;
  discount_value: number | string;
  minimum_order_amount?: number | string | null;
  maximum_discount_amount?: number | string | null;
  starts_at?: string | null;
  expires_at?: string | null;
  max_total_uses?: number | string | null;
  max_uses_per_user?: number | string | null;
  productIds?: Array<number | string>;
  categoryIds?: Array<number | string>;
  totalRedemptions?: number;
  userRedemptions?: number;
};

export type CheckoutCouponResult = {
  ok: boolean;
  error: string;
  couponId?: string;
  code?: string;
  discountAmount: number;
  subtotal: number;
  eligibleSubtotal: number;
  total: number;
  requiresAuthentication?: boolean;
};

const toNumber = (value: number | string | null | undefined, fallback = 0) => {
  if (value === "" || value === null || value === undefined) return fallback;
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
};

export const roundCheckoutMoney = (value: number) =>
  Math.round((value + Number.EPSILON) * 100) / 100;

export const normalizeCheckoutCouponCode = (code: string) =>
  code.trim().toUpperCase().replace(/\s+/g, "");

export const calculateCartSubtotal = (items: CheckoutCouponItem[]) =>
  roundCheckoutMoney(
    items.reduce(
      (total, item) => total + toNumber(item.price) * toNumber(item.quantity),
      0,
    ),
  );

const toIdSet = (ids: Array<number | string> | null | undefined) =>
  new Set((ids || []).map((id) => Number(id)).filter((id) => Number.isFinite(id)));

export const calculateEligibleSubtotal = (
  coupon: CheckoutCoupon,
  items: CheckoutCouponItem[],
) => {
  const productIds = toIdSet(coupon.productIds);
  const categoryIds = toIdSet(coupon.categoryIds);
  const hasRestrictions = productIds.size > 0 || categoryIds.size > 0;

  return roundCheckoutMoney(
    items.reduce((total, item) => {
      const productId = Number(item.id);
      const categoryId = Number(item.category_id);
      const matchesProduct = productIds.has(productId);
      const matchesCategory = categoryIds.has(categoryId);

      if (hasRestrictions && !matchesProduct && !matchesCategory) {
        return total;
      }

      return total + toNumber(item.price) * toNumber(item.quantity);
    }, 0),
  );
};

const emptyResult = (
  error: string,
  subtotal: number,
  extra: Partial<CheckoutCouponResult> = {},
): CheckoutCouponResult => ({
  ok: false,
  error,
  discountAmount: 0,
  subtotal,
  eligibleSubtotal: 0,
  total: subtotal,
  ...extra,
});

export const validateCheckoutCoupon = ({
  coupon,
  items,
  userId = null,
  now = new Date(),
}: {
  coupon: CheckoutCoupon | null | undefined;
  items: CheckoutCouponItem[];
  userId?: string | null;
  now?: Date;
}): CheckoutCouponResult => {
  const subtotal = calculateCartSubtotal(items);

  if (!coupon) return emptyResult("Coupon not found.", subtotal);
  if (!coupon.active) return emptyResult("Coupon is inactive.", subtotal);

  const startsAt = coupon.starts_at ? new Date(coupon.starts_at) : null;
  const expiresAt = coupon.expires_at ? new Date(coupon.expires_at) : null;

  if (startsAt && startsAt > now) return emptyResult("Coupon is not active yet.", subtotal);
  if (expiresAt && expiresAt < now) return emptyResult("Coupon has expired.", subtotal);

  if (subtotal < toNumber(coupon.minimum_order_amount)) {
    return emptyResult("Minimum order amount not met.", subtotal);
  }

  const maxTotalUses = coupon.max_total_uses ?? null;
  if (maxTotalUses !== null && Number(coupon.totalRedemptions || 0) >= toNumber(maxTotalUses)) {
    return emptyResult("Coupon usage limit has been reached.", subtotal);
  }

  const maxUsesPerUser = coupon.max_uses_per_user ?? null;
  if (maxUsesPerUser !== null) {
    if (!userId) {
      return emptyResult("Sign in to use this coupon.", subtotal, {
        requiresAuthentication: true,
      });
    }

    if (Number(coupon.userRedemptions || 0) >= toNumber(maxUsesPerUser)) {
      return emptyResult("You have already used this coupon.", subtotal);
    }
  }

  const eligibleSubtotal = calculateEligibleSubtotal(coupon, items);
  if (eligibleSubtotal <= 0) {
    return emptyResult("Coupon does not apply to the items in your cart.", subtotal);
  }

  const discountValue = toNumber(coupon.discount_value);
  let discountAmount = 0;

  if (coupon.discount_type === "percentage") {
    discountAmount = eligibleSubtotal * (discountValue / 100);
    const maximumDiscount = coupon.maximum_discount_amount ?? null;
    if (maximumDiscount !== null) {
      discountAmount = Math.min(discountAmount, toNumber(maximumDiscount));
    }
  } else if (coupon.discount_type === "fixed_amount") {
    discountAmount = Math.min(discountValue, eligibleSubtotal);
  } else {
    return emptyResult("Coupon discount type is invalid.", subtotal);
  }

  discountAmount = roundCheckoutMoney(Math.min(discountAmount, subtotal));

  return {
    ok: true,
    error: "",
    couponId: coupon.id,
    code: normalizeCheckoutCouponCode(coupon.code),
    discountAmount,
    subtotal,
    eligibleSubtotal,
    total: roundCheckoutMoney(Math.max(0, subtotal - discountAmount)),
  };
};
