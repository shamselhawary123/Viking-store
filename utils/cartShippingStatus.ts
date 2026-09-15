export type CartShippingSettings = {
  shipping_enabled?: boolean | null;
  free_shipping_all_orders?: boolean | null;
  free_shipping_threshold_enabled?: boolean | null;
  free_shipping_threshold?: number | string | null;
  default_shipping_fee?: number | string | null;
};

export type CartShippingStatusKind =
  | "loading"
  | "disabled"
  | "free_all"
  | "threshold_remaining"
  | "threshold_qualified"
  | "calculated_at_checkout";

export type CartShippingStatus = {
  kind: CartShippingStatusKind;
  messageKey: string;
  showProgress: boolean;
  progress: number;
  remaining: number;
  threshold: number;
};

type CartShippingItem = {
  price?: number | string | null;
  quantity?: number | string | null;
};

const toFiniteNumber = (
  value: number | string | null | undefined,
  fallback = 0,
) => {
  if (value === "" || value === null || value === undefined) return fallback;

  const numberValue = Number(value);

  return Number.isFinite(numberValue) ? numberValue : fallback;
};

const roundMoney = (value: number) =>
  Math.round((value + Number.EPSILON) * 100) / 100;

const clampProgress = (value: number) =>
  Math.min(100, Math.max(0, Math.round(value)));

export const getCartMerchandiseSubtotal = (items: CartShippingItem[]) =>
  roundMoney(
    items.reduce(
      (total, item) =>
        total + toFiniteNumber(item.price) * toFiniteNumber(item.quantity),
      0,
    ),
  );

export const calculateCartShippingStatus = ({
  settings,
  subtotal,
  isLoading = false,
}: {
  settings: CartShippingSettings | null | undefined;
  subtotal: number | string | null | undefined;
  isLoading?: boolean;
}): CartShippingStatus => {
  if (isLoading) {
    return {
      kind: "loading",
      messageKey: "common.loading",
      showProgress: false,
      progress: 0,
      remaining: 0,
      threshold: 0,
    };
  }

  const safeSubtotal = Math.max(0, toFiniteNumber(subtotal));

  if (settings?.shipping_enabled === false) {
    return {
      kind: "disabled",
      messageKey: "cart.shippingUnavailable",
      showProgress: false,
      progress: 0,
      remaining: 0,
      threshold: 0,
    };
  }

  if (settings?.free_shipping_all_orders === true) {
    return {
      kind: "free_all",
      messageKey: "cart.freeShippingUnlocked",
      showProgress: false,
      progress: 100,
      remaining: 0,
      threshold: 0,
    };
  }

  const threshold = toFiniteNumber(settings?.free_shipping_threshold);
  const hasThreshold =
    settings?.free_shipping_threshold_enabled === true && threshold > 0;

  if (!hasThreshold) {
    return {
      kind: "calculated_at_checkout",
      messageKey: "cart.shippingCalculatedAtCheckout",
      showProgress: false,
      progress: 0,
      remaining: 0,
      threshold: 0,
    };
  }

  if (safeSubtotal >= threshold) {
    return {
      kind: "threshold_qualified",
      messageKey: "cart.freeShippingUnlocked",
      showProgress: true,
      progress: 100,
      remaining: 0,
      threshold,
    };
  }

  return {
    kind: "threshold_remaining",
    messageKey: "cart.freeShippingRemaining",
    showProgress: true,
    progress: clampProgress((safeSubtotal / threshold) * 100),
    remaining: roundMoney(threshold - safeSubtotal),
    threshold,
  };
};
