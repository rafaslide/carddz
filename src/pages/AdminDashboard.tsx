
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { mockDataService } from '@/data/mockData';
import { Restaurant } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';

const AdminDashboard = () => {
  const { user, hasRole } = useAuth();
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is admin
    if (user && !hasRole('admin')) {
      navigate('/');
      return;
    }

    const loadRestaurants = async () => {
      try {
        const data = await mockDataService.getRestaurants();
        setRestaurants(data);
      } catch (error) {
        console.error('Failed to load restaurants:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRestaurants();
  }, [user, hasRole, navigate]);

  const handleAddRestaurant = () => {
    // In a real app, this would open a form to add a new restaurant
    alert('Em uma aplicação real, aqui abriria um formulário para adicionar novo restaurante');
  };

  const handleViewRestaurant = (restaurantId: string) => {
    // In a real app, this would navigate to a restaurant management page
    navigate(`/admin/restaurants/${restaurantId}`);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-pulse">
            <p>Carregando dados...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gerenciamento de Restaurantes</h1>
        <Button onClick={handleAddRestaurant}>
          <Plus size={16} className="mr-1" />
          Novo Restaurante
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {restaurants.map((restaurant) => (
          <Card key={restaurant.id} className="overflow-hidden">
            <div 
              className="h-40 bg-center bg-cover" 
              style={{ backgroundImage: `url(${restaurant.coverImage})` }}
            />
            <CardHeader className="pb-2">
              <CardTitle>{restaurant.name}</CardTitle>
            </CardHeader>
            <CardContent className="pb-2">
              <p className="text-sm text-gray-600 mb-2">{restaurant.description}</p>
              <div className="text-sm">
                <div className="mb-1">
                  <span className="font-medium">Endereço:</span> {restaurant.address}
                </div>
                <div>
                  <span className="font-medium">Telefone:</span> {restaurant.phone}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                onClick={() => handleViewRestaurant(restaurant.id)}
                className="w-full"
              >
                Gerenciar
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </Layout>
  );
};

export default AdminDashboard;
