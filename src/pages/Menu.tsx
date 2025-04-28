
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Category, Product, Restaurant } from '@/types';
import ProductCard from '@/components/ProductCard';
import CategoryMenu from '@/components/CategoryMenu';
import { mockDataService } from '@/data/mockData';
import Layout from '@/components/Layout';

const Menu = () => {
  const { restaurantId } = useParams<{ restaurantId?: string }>();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // If restaurantId is not available, we'll use a default one for demo
  const effectiveRestaurantId = restaurantId || 'rest1';

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Get restaurant data
        const restaurantData = await mockDataService.getRestaurantById(effectiveRestaurantId);
        if (!restaurantData) {
          setError('Restaurante não encontrado');
          return;
        }
        
        setRestaurant(restaurantData);
        
        // Get categories
        const categoriesData = await mockDataService.getCategories(effectiveRestaurantId);
        setCategories(categoriesData);
        
        // Get all products initially
        const productsData = await mockDataService.getProducts(effectiveRestaurantId);
        setProducts(productsData);
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading menu data:', err);
        setError('Erro ao carregar dados do menu');
        setLoading(false);
      }
    };
    
    loadData();
  }, [effectiveRestaurantId]);

  // Handle category selection
  const handleCategorySelect = async (categoryId: string | null) => {
    setSelectedCategoryId(categoryId);
    
    try {
      setLoading(true);
      const productsData = await mockDataService.getProducts(
        effectiveRestaurantId, 
        categoryId || undefined
      );
      setProducts(productsData);
      setLoading(false);
    } catch (err) {
      console.error('Error loading products:', err);
      setError('Erro ao carregar produtos');
      setLoading(false);
    }
  };

  if (error) {
    return (
      <Layout>
        <div className="text-center py-10">
          <h2 className="text-xl font-semibold text-red-500">{error}</h2>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-pulse">
            <p>Carregando cardápio...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Restaurant header */}
          <div 
            className="h-40 bg-center bg-cover rounded-lg mb-6"
            style={{ backgroundImage: `url(${restaurant?.coverImage})` }}
          >
            <div className="h-full w-full bg-black bg-opacity-40 rounded-lg flex items-center justify-center">
              <div className="text-center text-white p-4">
                <h1 className="text-3xl font-bold">{restaurant?.name}</h1>
                <p className="mt-2">{restaurant?.description}</p>
              </div>
            </div>
          </div>
          
          {/* Categories */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Categorias</h2>
            <CategoryMenu 
              categories={categories} 
              selectedCategoryId={selectedCategoryId}
              onSelectCategory={handleCategorySelect}
            />
          </div>
          
          {/* Products */}
          <div>
            <h2 className="text-xl font-semibold mb-4">
              {selectedCategoryId 
                ? `${categories.find(c => c.id === selectedCategoryId)?.name || 'Produtos'}`
                : 'Todos os Produtos'}
            </h2>
            
            {products.length === 0 ? (
              <p className="text-center py-8 text-gray-500">
                Nenhum produto encontrado nesta categoria
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </Layout>
  );
};

export default Menu;
