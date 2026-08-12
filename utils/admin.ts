export const ADMIN_ORDER_STATUSES = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export type AdminOrderStatus = (typeof ADMIN_ORDER_STATUSES)[number];

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
  name: order.guest_name || order.full_name || "Customer",
  phone: order.guest_phone || order.phone || "-",
  city: order.guest_city || order.city || "-",
  address: order.guest_address || order.address || "-",
  notes: order.guest_notes || order.notes || "-",
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
  sale_price: number | null;
  stock: number;
  category_id: number;
  image: string;
}) => ({
  title: form.name,
  slug: form.slug,
  description: form.description,
  price: form.price,
  old_price: form.sale_price,
  stock: form.stock,
  category_id: form.category_id,
  cover_image: form.image,
});
