
import React from 'react';
import { Product } from '@/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const navigate = useNavigate();

  const handleProductClick = () => {
    navigate(`/product/${product.id}`);
  };

  return (
    <Card className="h-full overflow-hidden hover:shadow-md transition-shadow duration-200">
      <div 
        className="h-40 bg-center bg-cover" 
        style={{ backgroundImage: `url(${product.image})` }}
      />
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-medium">{product.name}</h3>
          <div className="text-right">
            {product.isPromotion && product.promotionPrice !== undefined && (
              <>
                <span className="text-gray-500 line-through text-sm">
                  {formatCurrency(product.price)}
                </span>
                <br />
                <span className="text-red-500 font-semibold">
                  {formatCurrency(product.promotionPrice)}
                </span>
              </>
            )}
            {(!product.isPromotion || product.promotionPrice === undefined) && (
              <span className="font-semibold">{formatCurrency(product.price)}</span>
            )}
          </div>
        </div>
        <p className="text-gray-600 text-sm mt-2 line-clamp-2">{product.description}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button 
          onClick={handleProductClick}
          variant="default"
          className="w-full"
        >
          Ver detalhes
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
