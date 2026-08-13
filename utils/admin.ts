export const ADMIN_ORDER_STATUSES = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export type AdminOrderStatus = (typeof ADMIN_ORDER_STATUSES)[number];

export const ADMIN_REVENUE_ORDER_STATUSES = ["delivered"] as const;

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
  `$${Number(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;

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
  category_id: number;
  cover_image: string;
}) => ({
  title: form.name,
  slug: form.slug,
  description: form.description,
  price: form.price,
  old_price: form.old_price,
  category_id: form.category_id,
  cover_image: form.cover_image,
});

export const buildProductImagePath = (fileName: string, timestamp = Date.now()) => {
  const safeName = fileName
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return `product-images/${timestamp}-${safeName || "image"}`;
};
