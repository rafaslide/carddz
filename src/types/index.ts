
export type UserRole = 'admin' | 'restaurant' | 'customer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  restaurantId?: string; // Only for restaurant owners
}

export interface Restaurant {
  id: string;
  name: string;
  description: string;
  logo: string;
  coverImage: string;
  address: string;
  phone: string;
  categories: Category[];
  products: Product[];
  ownerId: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  restaurantId: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  categoryId: string;
  restaurantId: string;
  customizationOptions?: CustomizationOption[];
  isPromotion?: boolean;
  promotionPrice?: number;
  isAvailable: boolean;
}

export interface CustomizationOption {
  id: string;
  name: string;
  required: boolean;
  multiSelect: boolean;
  items: CustomizationItem[];
}

export interface CustomizationItem {
  id: string;
  name: string;
  price: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  customizations: {
    optionId: string;
    selectedItems: string[];
  }[];
  totalPrice: number;
}

export interface Order {
  id: string;
  restaurantId: string;
  customerId: string;
  items: CartItem[];
  totalPrice: number;
  status: OrderStatus;
  createdAt: string;
  notes?: string;
  deliveryAddress?: string;
  contactPhone: string;
}

export type OrderStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'preparing' 
  | 'out_for_delivery' 
  | 'delivered' 
  | 'cancelled';
