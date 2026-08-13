type CheckoutCartItem = {
  id: string | number;
  title: string;
  image: string;
  price: number | string;
  color: string;
  size: string;
  quantity: number | string;
};

type CheckoutCustomerData = {
  isGuest: boolean;
  user?: { id: string } | null;
  fullName: string;
  phone: string;
  city: string;
  address: string;
  notes?: string;
};

type CheckoutCouponData = {
  code?: string | null;
};

export const buildCheckoutOrderRequest = ({
  orderId,
  cartItems,
  totalPrice,
  customerData,
  coupon,
}: {
  orderId: string;
  cartItems: CheckoutCartItem[];
  totalPrice: number;
  customerData: CheckoutCustomerData;
  coupon?: CheckoutCouponData | null;
}) => {
  const user = customerData.isGuest ? null : customerData.user || null;

  const orderPayload = {
    id: orderId,
    user_id: user?.id || null,
    total_price: totalPrice,
    status: "pending",
    payment_method: "cash",
    shipping_cost: 0,
    discount: 0,
    payment_status: "unpaid",
    ...(user
      ? {
          full_name: customerData.fullName,
          phone: customerData.phone,
          city: customerData.city,
          address: customerData.address,
          notes: customerData.notes,
        }
      : {
          guest_name: customerData.fullName,
          guest_phone: customerData.phone,
          guest_city: customerData.city,
          guest_address: customerData.address,
          guest_notes: customerData.notes,
        }),
  };

  const orderItems = cartItems.map((item) => ({
    order_id: orderId,
    product_id: item.id,
    product_name: item.title,
    product_image: item.image,
    product_price: item.price,
    color: item.color,
    size: item.size,
    quantity: item.quantity,
  }));

  return {
    orderPayload,
    orderItems,
    rpcPayload: {
      p_order_id: orderId,
      p_items: orderItems.map((item) => ({
        id: item.product_id,
        title: item.product_name,
        image: item.product_image,
        price: item.product_price,
        color: item.color,
        size: item.size,
        quantity: item.quantity,
      })),
      p_customer: {
        is_guest: customerData.isGuest,
        full_name: customerData.fullName,
        phone: customerData.phone,
        city: customerData.city,
        address: customerData.address,
        notes: customerData.notes || "",
      },
      p_coupon_code: coupon?.code || null,
    },
  };
};
