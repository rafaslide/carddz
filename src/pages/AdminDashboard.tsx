
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Restaurant } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import * as supabaseService from '@/services/supabaseService';
import RestaurantFormDialog from '@/components/RestaurantFormDialog';

const AdminDashboard = () => {
  const { profile, hasRole } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);

  useEffect(() => {
    // Check if user is admin
    if (profile && !hasRole('admin')) {
      navigate('/');
      return;
    }

    loadRestaurants();
  }, [profile, hasRole, navigate]);

  const loadRestaurants = async () => {
    try {
      setLoading(true);
      const data = await supabaseService.getAllRestaurants();
      setRestaurants(data);
    } catch (error) {
      console.error('Failed to load restaurants:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os restaurantes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddRestaurant = () => {
    setSelectedRestaurant(null);
    setIsFormOpen(true);
  };

  const handleEditRestaurant = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setIsFormOpen(true);
  };

  const handleSaveRestaurant = async (restaurant: Restaurant) => {
    try {
      if (restaurant.id) {
        // Update existing restaurant
        const updatedRestaurant = await supabaseService.updateRestaurant(restaurant.id, restaurant);
        setRestaurants(restaurants.map(r => (r.id === restaurant.id ? updatedRestaurant : r)));
        
        toast({
          title: 'Restaurante atualizado',
          description: 'O restaurante foi atualizado com sucesso',
        });
      } else {
        // TODO: implement create restaurant functionality
        toast({
          title: 'Funcionalidade em desenvolvimento',
          description: 'A criação de novos restaurantes será implementada em breve',
        });
      }
      
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error saving restaurant:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o restaurante',
        variant: 'destructive',
      });
    }
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
              style={{ 
                backgroundImage: restaurant.coverImage ? `url(${restaurant.coverImage})` : 'none',
                backgroundColor: !restaurant.coverImage ? '#f1f1f1' : 'transparent'
              }}
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
                onClick={() => handleEditRestaurant(restaurant)}
                className="w-full"
              >
                Gerenciar
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {isFormOpen && (
        <RestaurantFormDialog
          open={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          restaurant={selectedRestaurant}
          onSave={handleSaveRestaurant}
        />
      )}
    </Layout>
  );
};

export default AdminDashboard;
