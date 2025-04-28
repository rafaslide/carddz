
import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product, CustomizationItem } from '@/types';
import { useToast } from '@/components/ui/use-toast';

interface CartContextType {
  items: CartItem[];
  restaurantId: string | null;
  addToCart: (product: Product, quantity: number, customizations: { optionId: string, selectedItems: string[] }[]) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  canAddFromRestaurant: (restaurantId: string) => boolean;
}

const CartContext = createContext<CartContextType>({
  items: [],
  restaurantId: null,
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  totalItems: 0,
  totalPrice: 0,
  canAddFromRestaurant: () => false,
});

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const { toast } = useToast();

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('carddz_cart');
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        setItems(parsed.items || []);
        setRestaurantId(parsed.restaurantId || null);
      } catch (error) {
        console.error('Failed to load cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('carddz_cart', JSON.stringify({ items, restaurantId }));
  }, [items, restaurantId]);

  const calculateItemPrice = (product: Product, quantity: number, customizations: { optionId: string, selectedItems: string[] }[]): number => {
    let basePrice = product.isPromotion && product.promotionPrice !== undefined
      ? product.promotionPrice
      : product.price;
    
    let customizationPrice = 0;
    
    // Add price for customizations
    if (product.customizationOptions && customizations.length > 0) {
      customizations.forEach(customization => {
        const option = product.customizationOptions?.find(opt => opt.id === customization.optionId);
        if (option) {
          customization.selectedItems.forEach(itemId => {
            const item = option.items.find(i => i.id === itemId);
            if (item) {
              customizationPrice += item.price;
            }
          });
        }
      });
    }
    
    return (basePrice + customizationPrice) * quantity;
  };

  const addToCart = (
    product: Product, 
    quantity: number,
    customizations: { optionId: string, selectedItems: string[] }[]
  ) => {
    // Check if we can add from this restaurant
    if (!canAddFromRestaurant(product.restaurantId)) {
      toast({
        title: "Não é possível adicionar",
        description: "Você só pode fazer pedidos de um restaurante por vez. Limpe seu carrinho antes de pedir de outro local.",
        variant: "destructive"
      });
      return;
    }

    // Set restaurant ID if this is the first item
    if (items.length === 0) {
      setRestaurantId(product.restaurantId);
    }

    // Check if product already exists in cart
    const existingItemIndex = items.findIndex(item => 
      item.product.id === product.id && 
      JSON.stringify(item.customizations) === JSON.stringify(customizations)
    );

    const totalPrice = calculateItemPrice(product, quantity, customizations);

    if (existingItemIndex >= 0) {
      // Update existing item
      const updatedItems = [...items];
      updatedItems[existingItemIndex].quantity += quantity;
      updatedItems[existingItemIndex].totalPrice += totalPrice;
      setItems(updatedItems);
    } else {
      // Add new item
      setItems([
        ...items,
        {
          product,
          quantity,
          customizations,
          totalPrice
        }
      ]);
    }

    toast({
      title: "Adicionado ao carrinho",
      description: `${quantity}x ${product.name}`,
    });
  };

  const removeFromCart = (productId: string) => {
    const updatedItems = items.filter(item => item.product.id !== productId);
    setItems(updatedItems);
    
    // If cart is empty, reset restaurantId
    if (updatedItems.length === 0) {
      setRestaurantId(null);
    }
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setItems(items.map(item => {
      if (item.product.id === productId) {
        const totalPrice = calculateItemPrice(
          item.product,
          quantity,
          item.customizations
        );
        return { ...item, quantity, totalPrice };
      }
      return item;
    }));
  };

  const clearCart = () => {
    setItems([]);
    setRestaurantId(null);
  };

  const canAddFromRestaurant = (id: string) => {
    return items.length === 0 || restaurantId === id;
  };

  // Calculate totals
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.totalPrice, 0);

  return (
    <CartContext.Provider value={{
      items,
      restaurantId,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalItems,
      totalPrice,
      canAddFromRestaurant
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
