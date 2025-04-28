
import { useState } from 'react';
import { CartItem as CartItemType } from '@/types';
import { Button } from '@/components/ui/button';
import { Minus, Plus, X } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { formatCurrency } from '@/lib/utils';

interface CartItemProps {
  item: CartItemType;
}

const CartItem = ({ item }: CartItemProps) => {
  const { updateQuantity, removeFromCart } = useCart();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateQuantity = (newQuantity: number) => {
    setIsUpdating(true);
    updateQuantity(item.product.id, newQuantity);
    setIsUpdating(false);
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border-b">
      <div className="flex-1">
        <div className="flex items-center">
          <div 
            className="w-16 h-16 bg-center bg-cover rounded-md mr-4 hidden sm:block" 
            style={{ backgroundImage: `url(${item.product.image})` }}
          />
          <div>
            <h3 className="font-medium">{item.product.name}</h3>
            <p className="text-sm text-gray-500">
              {item.customizations.map((customization) => (
                <span key={customization.optionId} className="block">
                  {item.product.customizationOptions
                    ?.find(opt => opt.id === customization.optionId)
                    ?.items
                    .filter(i => customization.selectedItems.includes(i.id))
                    .map(i => i.name)
                    .join(', ')}
                </span>
              ))}
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center mt-2 sm:mt-0">
        <div className="flex items-center mr-4">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => handleUpdateQuantity(item.quantity - 1)}
            disabled={isUpdating}
          >
            <Minus size={16} />
          </Button>
          <span className="mx-2 min-w-8 text-center">{item.quantity}</span>
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => handleUpdateQuantity(item.quantity + 1)}
            disabled={isUpdating}
          >
            <Plus size={16} />
          </Button>
        </div>
        
        <div className="flex items-center">
          <span className="font-medium mr-2">
            {formatCurrency(item.totalPrice)}
          </span>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-gray-500 hover:text-red-500"
            onClick={() => removeFromCart(item.product.id)}
          >
            <X size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
