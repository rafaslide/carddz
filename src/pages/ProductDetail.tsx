
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Product, CustomizationOption, CustomizationItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { mockDataService } from '@/data/mockData';
import { formatCurrency } from '@/lib/utils';
import { useCart } from '@/contexts/CartContext';
import Layout from '@/components/Layout';

const ProductDetail = () => {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedCustomizations, setSelectedCustomizations] = useState<{
    [optionId: string]: string[];
  }>({});
  const navigate = useNavigate();
  const { addToCart } = useCart();

  useEffect(() => {
    const loadProduct = async () => {
      if (!productId) {
        setError('ID do produto não especificado');
        setLoading(false);
        return;
      }

      try {
        // In a real app, we would directly fetch the product by ID
        // For our mock, we'll search through all restaurants
        const allRestaurants = await mockDataService.getRestaurants();
        let foundProduct: Product | null = null;
        
        for (const restaurant of allRestaurants) {
          const products = await mockDataService.getProducts(restaurant.id);
          foundProduct = products.find(p => p.id === productId) || null;
          if (foundProduct) break;
        }

        if (!foundProduct) {
          setError('Produto não encontrado');
        } else {
          setProduct(foundProduct);
          
          // Initialize selected customizations
          const initialCustomizations: { [optionId: string]: string[] } = {};
          foundProduct.customizationOptions?.forEach(option => {
            if (option.required && !option.multiSelect && option.items.length > 0) {
              initialCustomizations[option.id] = [option.items[0].id];
            } else {
              initialCustomizations[option.id] = [];
            }
          });
          
          setSelectedCustomizations(initialCustomizations);
        }
      } catch (err) {
        console.error('Error loading product:', err);
        setError('Erro ao carregar dados do produto');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [productId]);

  const handleRadioChange = (optionId: string, itemId: string) => {
    setSelectedCustomizations(prev => ({
      ...prev,
      [optionId]: [itemId]
    }));
  };

  const handleCheckboxChange = (optionId: string, itemId: string, checked: boolean) => {
    setSelectedCustomizations(prev => {
      const currentSelected = prev[optionId] || [];
      
      if (checked) {
        return {
          ...prev,
          [optionId]: [...currentSelected, itemId]
        };
      } else {
        return {
          ...prev,
          [optionId]: currentSelected.filter(id => id !== itemId)
        };
      }
    });
  };

  const calculateTotalPrice = (): number => {
    if (!product) return 0;
    
    const basePrice = product.isPromotion && product.promotionPrice !== undefined
      ? product.promotionPrice
      : product.price;
    
    let customizationPrice = 0;
    
    if (product.customizationOptions) {
      for (const option of product.customizationOptions) {
        const selectedItems = selectedCustomizations[option.id] || [];
        
        for (const itemId of selectedItems) {
          const item = option.items.find(i => i.id === itemId);
          if (item) {
            customizationPrice += item.price;
          }
        }
      }
    }
    
    return (basePrice + customizationPrice) * quantity;
  };

  const handleQuantityChange = (value: number) => {
    if (value >= 1) {
      setQuantity(value);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    // Validate required options
    const missingRequired = product.customizationOptions?.some(option => {
      if (option.required) {
        const selected = selectedCustomizations[option.id] || [];
        return selected.length === 0;
      }
      return false;
    });
    
    if (missingRequired) {
      setError('Por favor, selecione todas as opções obrigatórias');
      return;
    }
    
    // Format customizations for cart
    const customizations = Object.entries(selectedCustomizations)
      .map(([optionId, selectedItems]) => ({
        optionId,
        selectedItems
      }))
      .filter(c => c.selectedItems.length > 0);
    
    // Add to cart
    addToCart(product, quantity, customizations);
    
    // Navigate back
    navigate(-1);
  };

  const renderCustomizationOptions = () => {
    if (!product?.customizationOptions) return null;

    return product.customizationOptions.map((option) => (
      <div key={option.id} className="mb-6">
        <div className="flex items-baseline mb-2">
          <h3 className="text-lg font-medium">{option.name}</h3>
          {option.required && (
            <span className="ml-2 text-sm text-red-500">*Obrigatório</span>
          )}
        </div>

        {option.multiSelect ? (
          // Checkboxes for multi-select options
          <div className="space-y-2">
            {option.items.map((item) => (
              <div key={item.id} className="flex items-center space-x-2">
                <Checkbox 
                  id={item.id} 
                  checked={(selectedCustomizations[option.id] || []).includes(item.id)}
                  onCheckedChange={(checked) => 
                    handleCheckboxChange(option.id, item.id, checked === true)
                  }
                />
                <Label htmlFor={item.id} className="flex-1">
                  {item.name}
                </Label>
                {item.price > 0 && (
                  <span className="text-gray-600">+ {formatCurrency(item.price)}</span>
                )}
              </div>
            ))}
          </div>
        ) : (
          // Radio buttons for single-select options
          <RadioGroup 
            value={(selectedCustomizations[option.id] || [])[0] || ''}
            onValueChange={(value) => handleRadioChange(option.id, value)}
          >
            {option.items.map((item) => (
              <div key={item.id} className="flex items-center space-x-2">
                <RadioGroupItem value={item.id} id={`${option.id}-${item.id}`} />
                <Label htmlFor={`${option.id}-${item.id}`} className="flex-1">
                  {item.name}
                </Label>
                {item.price > 0 && (
                  <span className="text-gray-600">+ {formatCurrency(item.price)}</span>
                )}
              </div>
            ))}
          </RadioGroup>
        )}
      </div>
    ));
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-pulse">
            <p>Carregando produto...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !product) {
    return (
      <Layout>
        <div className="text-center py-10">
          <h2 className="text-xl font-semibold text-red-500">{error || 'Produto não encontrado'}</h2>
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
            className="mt-4"
          >
            Voltar
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Button 
        variant="outline" 
        onClick={() => navigate(-1)}
        className="mb-4"
      >
        &larr; Voltar ao cardápio
      </Button>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div 
          className="aspect-square bg-center bg-cover rounded-lg"
          style={{ backgroundImage: `url(${product.image})` }}
        />
        
        {/* Product Details */}
        <div>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <p className="text-gray-600 mb-4">{product.description}</p>
          
          {/* Price Display */}
          <div className="mb-6">
            {product.isPromotion && product.promotionPrice !== undefined ? (
              <div className="flex items-center">
                <span className="text-gray-500 line-through text-lg mr-2">
                  {formatCurrency(product.price)}
                </span>
                <span className="text-red-500 font-bold text-2xl">
                  {formatCurrency(product.promotionPrice)}
                </span>
              </div>
            ) : (
              <span className="font-bold text-2xl">{formatCurrency(product.price)}</span>
            )}
          </div>
          
          {/* Customization Options */}
          {renderCustomizationOptions()}
          
          {/* Quantity Selector */}
          <div className="mb-6">
            <Label htmlFor="quantity">Quantidade</Label>
            <div className="flex items-center mt-2">
              <Button 
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1}
              >
                -
              </Button>
              <Input 
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                className="w-16 mx-2 text-center"
              />
              <Button 
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleQuantityChange(quantity + 1)}
              >
                +
              </Button>
            </div>
          </div>
          
          {/* Add to Cart Button */}
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">Total:</span>
              <span className="text-2xl font-bold">{formatCurrency(calculateTotalPrice())}</span>
            </div>
            
            <Button 
              onClick={handleAddToCart}
              size="lg"
              className="w-full"
            >
              Adicionar ao Carrinho
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetail;
