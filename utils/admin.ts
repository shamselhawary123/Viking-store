import { formatStorePrice } from "./localizationFormat.ts";

export const ADMIN_ORDER_STATUSES = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export type AdminOrderStatus = (typeof ADMIN_ORDER_STATUSES)[number];

export const ADMIN_REVENUE_ORDER_STATUSES = ["delivered"] as const;

export const adminOrderStatusLabelKey = (status?: string | null) => {
  const normalized = String(status || "pending").toLowerCase();
  return ADMIN_ORDER_STATUSES.includes(normalized as AdminOrderStatus)
    ? `admin.status.${normalized}`
    : "admin.status.pending";
};

export const adminPaymentStatusLabelKey = (status?: string | null) => {
  const normalized = String(status || "unpaid").toLowerCase();
  return ["paid", "unpaid"].includes(normalized)
    ? `admin.paymentStatusValues.${normalized}`
    : `admin.paymentStatusValues.${normalized}`;
};

type AdminOrderFilterInput = {
  search: string;
  status: string;
  paymentStatus: string;
};

type AdminProfile = {
  role?: string | null;
  is_admin?: boolean | null;
  admin?: boolean | null;
} | null;

export const isAdminProfile = (profile: AdminProfile) => {
  if (!profile) return false;

  const role = String(profile.role || "").toLowerCase();
  return profile.is_admin === true || profile.admin === true || role === "admin" || role === "owner";
};

export const getOrderCustomer = (order: Record<string, any>) => ({
  name: order.full_name || order.guest_name || "Customer",
  email: order.email || order.guest_email || "-",
  phone: order.phone || order.guest_phone || "-",
  city: order.city || order.guest_city || "-",
  address: order.address || order.guest_address || "-",
  notes: order.notes || order.guest_notes || "-",
});

export const getOrderCustomerType = (order: Record<string, any>) =>
  order.user_id ? "Authenticated" : "Guest";

export const getAdminOrderLabel = (order: Record<string, any>) =>
  order.order_number || String(order.id || "").slice(0, 8);

export const filterAdminOrders = <T extends Record<string, any>>(
  orders: T[],
  filters: AdminOrderFilterInput,
) => {
  const term = filters.search.trim().toLowerCase();

  return orders.filter((order) => {
    const customer = getOrderCustomer(order);
    const matchesSearch =
      !term ||
      [order.id, order.order_number, customer.name, customer.phone]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term));
    const matchesStatus = filters.status === "all" || order.status === filters.status;
    const matchesPaymentStatus =
      filters.paymentStatus === "all" || order.payment_status === filters.paymentStatus;

    return matchesSearch && matchesStatus && matchesPaymentStatus;
  });
};

export const calculateAdminDashboardStats = (orders: Record<string, any>[]) => ({
  totalOrders: orders.length,
  pendingOrders: orders.filter((order) => order.status === "pending").length,
  completedOrders: orders.filter((order) =>
    ADMIN_REVENUE_ORDER_STATUSES.includes(order.status),
  ).length,
  totalRevenue: orders
    .filter((order) => ADMIN_REVENUE_ORDER_STATUSES.includes(order.status))
    .reduce((sum, order) => sum + Number(order.total_price || 0), 0),
});

export const formatCurrency = (value: number | string | null | undefined) =>
  formatStorePrice(value);

export const formatDate = (date?: string | null) => {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export const buildProductPayload = (form: {
  name: string;
  slug: string;
  description: string;
  price: number;
  old_price: number | null;
  badge?: string | null;
  category_id: number;
  cover_image: string;
}) => {
  const payload: Record<string, any> = {
    title: form.name,
    slug: form.slug,
    description: form.description,
    price: form.price,
    old_price: form.old_price,
    category_id: form.category_id,
    cover_image: form.cover_image,
  };

  if (Object.hasOwn(form, "badge")) {
    payload.badge = form.badge || null;
  }

  return payload;
};

export type ProductMoveDirection = "up" | "down";

type ProductOrderingInput = {
  id: number;
  shop_position?: number | string | null;
};

export const sortProductsByShopPosition = <T extends ProductOrderingInput>(products: T[]) =>
  [...products].sort((a, b) => {
    const aPosition = Number(a.shop_position ?? Number.MAX_SAFE_INTEGER);
    const bPosition = Number(b.shop_position ?? Number.MAX_SAFE_INTEGER);

    if (aPosition !== bPosition) return aPosition - bPosition;
    return Number(a.id || 0) - Number(b.id || 0);
  });

export const getAdjacentProductForMove = <T extends ProductOrderingInput>(
  products: T[],
  productId: number,
  direction: ProductMoveDirection,
) => {
  const ordered = sortProductsByShopPosition(products);
  const index = ordered.findIndex((product) => product.id === productId);
  if (index === -1) return null;

  return direction === "up" ? ordered[index - 1] || null : ordered[index + 1] || null;
};

export const getProductMoveState = <T extends ProductOrderingInput>(
  products: T[],
  productId: number,
) => ({
  canMoveUp: Boolean(getAdjacentProductForMove(products, productId, "up")),
  canMoveDown: Boolean(getAdjacentProductForMove(products, productId, "down")),
});

export const PRODUCT_DRAG_DISABLED_MESSAGE =
  "Clear filters and load all products to reorder the full shop catalog.";

type ProductDragOrderingState = {
  search: string;
  categoryFilter: number;
  stockFilter: string;
  sortBy: string;
  reorderListLoaded?: boolean;
  reorderListFailed?: boolean;
};

export const isProductReorderMode = (state: Pick<ProductDragOrderingState, "search" | "categoryFilter" | "stockFilter" | "sortBy">) =>
  !state.search.trim() &&
  state.categoryFilter === 0 &&
  state.stockFilter === "all" &&
  state.sortBy === "manual";

export const isProductDragOrderingDisabled = (state: ProductDragOrderingState) =>
  Boolean(state.search.trim()) ||
  state.categoryFilter !== 0 ||
  state.stockFilter !== "all" ||
  state.sortBy !== "manual" ||
  state.reorderListLoaded !== true ||
  state.reorderListFailed === true;

export const getProductDragReorder = <T extends ProductOrderingInput>(
  products: T[],
  productId: number,
  targetIndex: number,
) => {
  const ordered = sortProductsByShopPosition(products);
  const sourceIndex = ordered.findIndex((product) => product.id === productId);
  if (sourceIndex === -1) {
    return {
      reorderedProducts: ordered,
      previousProductId: null as number | null,
      nextProductId: null as number | null,
    };
  }

  const draggedProduct = ordered[sourceIndex];
  const withoutDragged = ordered.filter((product) => product.id !== productId);
  const safeTargetIndex = Math.max(0, Math.min(targetIndex, withoutDragged.length));
  const reorderedProducts = [...withoutDragged];
  reorderedProducts.splice(safeTargetIndex, 0, draggedProduct);
  const finalIndex = reorderedProducts.findIndex((product) => product.id === productId);

  return {
    reorderedProducts,
    previousProductId: reorderedProducts[finalIndex - 1]?.id ?? null,
    nextProductId: reorderedProducts[finalIndex + 1]?.id ?? null,
  };
};

export const getOptimisticShopPositions = <T extends ProductOrderingInput>(products: T[]) =>
  products.map((product, index) => ({
    ...product,
    shop_position: (index + 1) * 1000,
  }));

export const buildProductImagePath = (fileName: string, timestamp = Date.now()) => {
  const safeName = fileName
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return `product-images/${timestamp}-${safeName || "image"}`;
};
