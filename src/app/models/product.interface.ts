// models/product.interface.ts
export interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  hoverImage?: string;
  rating: number;
  category: string;
  inStock: boolean;
  onSale?: boolean;
  description?: string;
}

export interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export interface CartSummary {
  totalItems: number;
  totalPrice: number;
  items: CartItem[];
}