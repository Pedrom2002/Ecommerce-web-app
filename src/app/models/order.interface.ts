export interface OrderItem {
  product_id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface ShippingInfo {
  first_name: string;
  last_name: string;
  address: string;
  city: string;
  postal_code: string;
  country: string;
  phone: string;
  email: string;
}

export interface OrderTotals {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

export interface Order {
  id?: number;
  user_id?: number;
  order_date?: string;
  status: string;
  shipping_info: ShippingInfo;
  items: OrderItem[];
  totals: OrderTotals;
}

export interface CreateOrderRequest {
  shipping_info: ShippingInfo;
  items: OrderItem[];
  totals: OrderTotals;
}

export interface CreateOrderResponse {
  success: boolean;
  message: string;
  order_id?: number;
  order?: Order;
}

export interface OrdersResponse {
  success: boolean;
  orders: Order[];
  message?: string;
}