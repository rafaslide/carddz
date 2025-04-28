
import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { mockDataService } from '@/data/mockData';
import { Category, Product } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { Plus, Edit, Trash } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const RestaurantProducts = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!user?.restaurantId) return;

      try {
        setLoading(true);
        // Load categories
        const categoriesData = await mockDataService.getCategories(user.restaurantId);
        setCategories(categoriesData);
        
        // Load products
        const productsData = await mockDataService.getProducts(user.restaurantId);
        setProducts(productsData);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const handleAddProduct = () => {
    // In a real app, this would open a form to add a new product
    alert('Em uma aplicação real, aqui abriria um formulário para adicionar novo produto');
  };

  const handleEditProduct = (productId: string) => {
    // In a real app, this would open a form to edit the product
    alert(`Em uma aplicação real, aqui abriria um formulário para editar o produto ${productId}`);
  };

  const handleDeleteProduct = (productId: string) => {
    // In a real app, this would show a confirmation dialog and then delete the product
    alert(`Em uma aplicação real, aqui mostraria uma confirmação para deletar o produto ${productId}`);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-pulse">
            <p>Carregando produtos...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gerenciar Produtos</h1>
        <Button onClick={handleAddProduct}>
          <Plus size={16} className="mr-1" />
          Novo Produto
        </Button>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="mb-6">
          <TabsTrigger value="all">Todos os Produtos</TabsTrigger>
          {categories.map(category => (
            <TabsTrigger key={category.id} value={category.id}>
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>
        
        <TabsContent value="all">
          <div className="grid grid-cols-1 gap-4">
            {products.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-lg shadow-sm">
                <p className="text-gray-600">Nenhum produto cadastrado</p>
              </div>
            ) : (
              products.map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  category={categories.find(c => c.id === product.categoryId)?.name || ''}
                  onEdit={handleEditProduct}
                  onDelete={handleDeleteProduct}
                />
              ))
            )}
          </div>
        </TabsContent>
        
        {categories.map(category => (
          <TabsContent key={category.id} value={category.id}>
            <div className="grid grid-cols-1 gap-4">
              {products.filter(p => p.categoryId === category.id).length === 0 ? (
                <div className="text-center py-10 bg-white rounded-lg shadow-sm">
                  <p className="text-gray-600">Nenhum produto nesta categoria</p>
                </div>
              ) : (
                products
                  .filter(p => p.categoryId === category.id)
                  .map(product => (
                    <ProductCard 
                      key={product.id} 
                      product={product} 
                      category={category.name}
                      onEdit={handleEditProduct}
                      onDelete={handleDeleteProduct}
                    />
                  ))
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </Layout>
  );
};

interface ProductCardProps {
  product: Product;
  category: string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const ProductCard = ({ product, category, onEdit, onDelete }: ProductCardProps) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start">
          <div 
            className="w-20 h-20 bg-center bg-cover rounded-md mr-4 flex-shrink-0" 
            style={{ backgroundImage: `url(${product.image})` }}
          />
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-lg">{product.name}</h3>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm text-gray-600">{category}</span>
                  {product.isPromotion && (
                    <Badge variant="outline" className="bg-red-500/20 text-red-700 hover:bg-red-500/20">
                      Promoção
                    </Badge>
                  )}
                  {!product.isAvailable && (
                    <Badge variant="outline" className="bg-gray-500/20 text-gray-700 hover:bg-gray-500/20">
                      Indisponível
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-2">{product.description}</p>
              </div>
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
            
            <div className="flex justify-end mt-2 gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onEdit(product.id)}
              >
                <Edit size={14} className="mr-1" />
                Editar
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onDelete(product.id)}
                className="text-red-500 hover:text-red-600"
              >
                <Trash size={14} className="mr-1" />
                Excluir
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RestaurantProducts;
