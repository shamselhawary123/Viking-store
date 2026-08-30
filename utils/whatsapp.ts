import { formatStorePrice } from "./localizationFormat";

export const normalizeWhatsappNumber = (value?: string | null) =>
  String(value || "").replace(/\D+/g, "");

export const buildWhatsappLink = (phoneNumber: string | null | undefined, message: string) => {
  const number = normalizeWhatsappNumber(phoneNumber);
  if (!number) return "";

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
};

export const buildProductWhatsAppLink = ({
  phoneNumber,
  productName,
  color,
  size,
  price,
  url,
  locale = "ar",
}: {
  phoneNumber?: string | null;
  productName: string;
  color?: string | null;
  size?: string | null;
  price?: number | string | null;
  url: string;
  locale?: string;
}) => {
  const lines =
    locale === "ar"
      ? [
          "مساء الخير، عندي استفسار عن المنتج ده:",
          "",
          productName,
          color ? `اللون: ${color}` : "",
          size ? `المقاس: ${size}` : "",
          price != null ? `السعر: ${formatStorePrice(price, locale)}` : "",
          "",
          "رابط المنتج:",
          url,
        ]
      : [
          "Hi, I have a question about this product:",
          "",
          productName,
          color ? `Color: ${color}` : "",
          size ? `Size: ${size}` : "",
          price != null ? `Price: ${formatStorePrice(price, locale)}` : "",
          "",
          "Product link:",
          url,
        ];

  return buildWhatsappLink(phoneNumber, lines.filter(Boolean).join("\n"));
};

export const buildOrderWhatsAppLink = ({
  phoneNumber,
  orderNumber,
  status,
  locale = "ar",
}: {
  phoneNumber?: string | null;
  orderNumber: string | number;
  status?: string | null;
  locale?: string;
}) => {
  const message =
    locale === "ar"
      ? `مساء الخير، عندي استفسار بخصوص طلبي #${orderNumber}.${status ? `\nحالة الطلب: ${status}` : ""}`
      : `Hi, I have a question about my order #${orderNumber}.${status ? `\nOrder status: ${status}` : ""}`;

  return buildWhatsappLink(phoneNumber, message);
};

export const buildInstapayWhatsAppLink = ({
  phoneNumber,
  orderNumber,
  total,
  items,
  locale = "ar",
}: {
  phoneNumber?: string | null;
  orderNumber: string | number;
  total: number | string;
  items: Array<{ product_name?: string; quantity?: number; color?: string | null; size?: string | null }>;
  locale?: string;
}) => {
  const itemLines = items.map((item) => {
    const details = [item.color, item.size].filter(Boolean).join(" - ");
    return `- ${item.product_name || "Product"} ×${item.quantity || 1}${details ? `\n  ${details}` : ""}`;
  });
  const message =
    locale === "ar"
      ? [
          `مساء الخير، أنا صاحب الطلب #${orderNumber}.`,
          "",
          "طريقة الدفع: InstaPay",
          `قيمة الطلب: ${formatStorePrice(total, locale)}`,
          "",
          "المنتجات:",
          ...itemLines,
          "",
          "أنا دفعت وهرفق صورة التحويل في الرسالة.",
        ].join("\n")
      : [
          `Hi, I am the customer for order #${orderNumber}.`,
          "",
          "Payment method: InstaPay",
          `Order total: ${formatStorePrice(total, locale)}`,
          "",
          "Products:",
          ...itemLines,
          "",
          "I paid and will attach the transfer screenshot in WhatsApp.",
        ].join("\n");

  return buildWhatsappLink(phoneNumber, message);
};
