type CheckoutCartItem = {
  id: string;
  title: string;
  image: string;
  price: number;
  color: string;
  size: string;
  quantity: number;
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

export const buildCheckoutOrderRequest = ({
  orderId,
  cartItems,
  totalPrice,
  customerData,
}: {
  orderId: string;
  cartItems: CheckoutCartItem[];
  totalPrice: number;
  customerData: CheckoutCustomerData;
}) => {
  const user = customerData.isGuest ? null : customerData.user || null;

  const orderPayload = {
    id: orderId,
    user_id: user?.id || null,
    total_price: totalPrice,
    status: "pending",
    payment_method: "cash",
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
  };
};
