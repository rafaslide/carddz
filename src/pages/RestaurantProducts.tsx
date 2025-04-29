
import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Category, Product } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { Plus, Edit, Trash, ImagePlus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import ProductFormDialog from '@/components/ProductFormDialog';
import CategoryFormDialog from '@/components/CategoryFormDialog';
import CustomizationDialog from '@/components/CustomizationDialog';
import * as supabaseService from '@/services/supabaseService';

const RestaurantProducts = () => {
  const { profile } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false);
  const [isCustomizationOpen, setIsCustomizationOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      if (!profile?.restaurantId) return;

      try {
        setLoading(true);
        // Load categories
        const categoriesData = await supabaseService.getCategoriesByRestaurantId(profile.restaurantId);
        setCategories(categoriesData);
        
        // Load products
        const productsData = await supabaseService.getProductsByRestaurantId(profile.restaurantId);
        setProducts(productsData);
      } catch (error) {
        console.error('Failed to load data:', error);
        toast({
          title: 'Erro ao carregar dados',
          description: 'Não foi possível carregar os produtos e categorias.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [profile]);

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setIsProductFormOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsProductFormOpen(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este produto?')) return;
    
    try {
      await supabaseService.deleteProduct(productId);
      setProducts(products.filter(p => p.id !== productId));
      toast({
        title: 'Produto excluído',
        description: 'O produto foi excluído com sucesso.',
      });
    } catch (error) {
      console.error('Failed to delete product:', error);
      toast({
        title: 'Erro ao excluir produto',
        description: 'Não foi possível excluir o produto.',
        variant: 'destructive',
      });
    }
  };

  const handleAddCategory = () => {
    setSelectedCategory(null);
    setIsCategoryFormOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setIsCategoryFormOpen(true);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    // Check if category has products
    const hasProducts = products.some(p => p.categoryId === categoryId);
    
    if (hasProducts) {
      toast({
        title: 'Não é possível excluir categoria',
        description: 'Esta categoria possui produtos associados. Remova ou mova os produtos primeiro.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!window.confirm('Tem certeza que deseja excluir esta categoria?')) return;
    
    try {
      await supabaseService.deleteCategory(categoryId);
      setCategories(categories.filter(c => c.id !== categoryId));
      toast({
        title: 'Categoria excluída',
        description: 'A categoria foi excluída com sucesso.',
      });
    } catch (error) {
      console.error('Failed to delete category:', error);
      toast({
        title: 'Erro ao excluir categoria',
        description: 'Não foi possível excluir a categoria.',
        variant: 'destructive',
      });
    }
  };

  const handleManageCustomizations = (product: Product) => {
    setSelectedProduct(product);
    setIsCustomizationOpen(true);
  };

  const handleProductSave = async (product: Product) => {
    try {
      if (product.id) {
        // Update existing product
        const updatedProduct = await supabaseService.updateProduct(product.id, product);
        setProducts(products.map(p => (p.id === product.id ? { ...p, ...updatedProduct } : p)));
        toast({
          title: 'Produto atualizado',
          description: 'O produto foi atualizado com sucesso.',
        });
      } else {
        // Create new product
        if (!profile?.restaurantId) {
          throw new Error('ID do restaurante não encontrado');
        }
        
        const newProduct = await supabaseService.createProduct({
          ...product,
          restaurantId: profile.restaurantId,
        });
        
        setProducts([...products, newProduct]);
        toast({
          title: 'Produto criado',
          description: 'O produto foi criado com sucesso.',
        });
      }
      
      setIsProductFormOpen(false);
    } catch (error) {
      console.error('Failed to save product:', error);
      toast({
        title: 'Erro ao salvar produto',
        description: 'Não foi possível salvar o produto.',
        variant: 'destructive',
      });
    }
  };

  const handleCategorySave = async (category: Category) => {
    try {
      if (category.id) {
        // Update existing category
        const updatedCategory = await supabaseService.updateCategory(category.id, category);
        setCategories(categories.map(c => (c.id === category.id ? { ...c, ...updatedCategory } : c)));
        toast({
          title: 'Categoria atualizada',
          description: 'A categoria foi atualizada com sucesso.',
        });
      } else {
        // Create new category
        if (!profile?.restaurantId) {
          throw new Error('ID do restaurante não encontrado');
        }
        
        const newCategory = await supabaseService.createCategory({
          ...category,
          restaurantId: profile.restaurantId,
        });
        
        setCategories([...categories, newCategory]);
        toast({
          title: 'Categoria criada',
          description: 'A categoria foi criada com sucesso.',
        });
      }
      
      setIsCategoryFormOpen(false);
    } catch (error) {
      console.error('Failed to save category:', error);
      toast({
        title: 'Erro ao salvar categoria',
        description: 'Não foi possível salvar a categoria.',
        variant: 'destructive',
      });
    }
  };

  const handleCustomizationsSave = (product: Product) => {
    // Update product in the state with updated customizations
    setProducts(products.map(p => (p.id === product.id ? product : p)));
    setIsCustomizationOpen(false);
    toast({
      title: 'Personalizações atualizadas',
      description: 'As opções de personalização foram atualizadas com sucesso.',
    });
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
        <div className="space-x-2">
          <Button onClick={handleAddCategory} variant="outline">
            <Plus size={16} className="mr-1" />
            Nova Categoria
          </Button>
          <Button onClick={handleAddProduct}>
            <Plus size={16} className="mr-1" />
            Novo Produto
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="mb-6 flex flex-wrap">
          <TabsTrigger value="all">Todos os Produtos</TabsTrigger>
          {categories.map(category => (
            <TabsTrigger key={category.id} value={category.id} className="flex items-center">
              {category.name}
              <Button
                size="sm"
                variant="ghost"
                className="ml-2 h-5 w-5 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditCategory(category);
                }}
              >
                <Edit size={12} />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-5 w-5 p-0 text-red-500"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteCategory(category.id);
                }}
              >
                <Trash size={12} />
              </Button>
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
                  onEdit={() => handleEditProduct(product)}
                  onDelete={() => handleDeleteProduct(product.id)}
                  onManageCustomizations={() => handleManageCustomizations(product)}
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
                      onEdit={() => handleEditProduct(product)}
                      onDelete={() => handleDeleteProduct(product.id)}
                      onManageCustomizations={() => handleManageCustomizations(product)}
                    />
                  ))
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Forms dialogs */}
      {isProductFormOpen && (
        <ProductFormDialog
          open={isProductFormOpen}
          onClose={() => setIsProductFormOpen(false)}
          product={selectedProduct}
          categories={categories}
          onSave={handleProductSave}
        />
      )}

      {isCategoryFormOpen && (
        <CategoryFormDialog
          open={isCategoryFormOpen}
          onClose={() => setIsCategoryFormOpen(false)}
          category={selectedCategory}
          onSave={handleCategorySave}
        />
      )}

      {isCustomizationOpen && selectedProduct && (
        <CustomizationDialog
          open={isCustomizationOpen}
          onClose={() => setIsCustomizationOpen(false)}
          product={selectedProduct}
          onSave={handleCustomizationsSave}
        />
      )}
    </Layout>
  );
};

interface ProductCardProps {
  product: Product;
  category: string;
  onEdit: () => void;
  onDelete: () => void;
  onManageCustomizations: () => void;
}

const ProductCard = ({ product, category, onEdit, onDelete, onManageCustomizations }: ProductCardProps) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start">
          <div 
            className="w-20 h-20 bg-center bg-cover rounded-md mr-4 flex-shrink-0 relative"
            style={{ 
              backgroundImage: product.image ? `url(${product.image})` : 'none',
              backgroundColor: !product.image ? '#f1f1f1' : 'transparent'
            }}
          >
            {!product.image && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                <ImagePlus size={24} />
              </div>
            )}
          </div>
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
                
                {product.customizationOptions && product.customizationOptions.length > 0 && (
                  <div className="text-xs text-gray-500 mt-1">
                    {product.customizationOptions.length} opções de personalização disponíveis
                  </div>
                )}
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
                onClick={onManageCustomizations}
              >
                Personalizações
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={onEdit}
              >
                <Edit size={14} className="mr-1" />
                Editar
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={onDelete}
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
