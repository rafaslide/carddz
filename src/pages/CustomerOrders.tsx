
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { mockDataService } from '@/data/mockData';
import { Order } from '@/types';
import { formatCurrency, formatDate, generateWhatsAppMessage } from '@/lib/utils';
import OrderStatusBadge from '@/components/OrderStatusBadge';

const CustomerOrders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadOrders = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const userOrders = await mockDataService.getOrders(user.id, user.role);
        setOrders(userOrders);
      } catch (err) {
        console.error('Error loading orders:', err);
        setError('Erro ao carregar pedidos');
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [user]);

  const handleShareWhatsApp = (order: Order) => {
    const message = generateWhatsAppMessage(order);
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-pulse">
            <p>Carregando pedidos...</p>
          </div>
        </div>
      </Layout>
    );
  }

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
      <h1 className="text-2xl font-bold mb-6">Meus Pedidos</h1>

      {orders.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-600 mb-4">Você ainda não realizou nenhum pedido</p>
          <Button onClick={() => navigate('/')}>
            Ver Cardápio
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <div className="bg-muted px-4 py-3 flex justify-between items-center">
                <div>
                  <span className="font-medium">Pedido #{order.id}</span>
                  <span className="text-sm text-gray-500 ml-4">
                    {formatDate(order.createdAt)}
                  </span>
                </div>
                <OrderStatusBadge status={order.status} />
              </div>
              <CardContent className="p-4">
                <div className="space-y-2 mb-4">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between">
                      <div>
                        <span className="font-medium">{item.quantity}x </span>
                        {item.product.name}
                        
                        {/* Item customizations */}
                        {item.customizations.length > 0 && (
                          <ul className="text-sm text-gray-600 pl-6">
                            {item.customizations.map((customization, cidx) => {
                              const option = item.product.customizationOptions?.find(
                                opt => opt.id === customization.optionId
                              );
                              
                              if (!option) return null;
                              
                              const selectedItems = option.items.filter(
                                i => customization.selectedItems.includes(i.id)
                              );
                              
                              if (selectedItems.length === 0) return null;
                              
                              return (
                                <li key={cidx}>
                                  {option.name}: {selectedItems.map(i => i.name).join(', ')}
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </div>
                      <span className="text-gray-600">{formatCurrency(item.totalPrice)}</span>
                    </div>
                  ))}
                </div>
                
                {/* Order notes */}
                {order.notes && (
                  <div className="mb-4">
                    <h4 className="font-medium text-sm">Observações:</h4>
                    <p className="text-gray-600">{order.notes}</p>
                  </div>
                )}
                
                {/* Order delivery address */}
                {order.deliveryAddress && (
                  <div className="mb-4">
                    <h4 className="font-medium text-sm">Endereço de entrega:</h4>
                    <p className="text-gray-600">{order.deliveryAddress}</p>
                  </div>
                )}
                
                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="font-bold">
                    Total: {formatCurrency(order.totalPrice)}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleShareWhatsApp(order)}
                  >
                    Compartilhar no WhatsApp
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </Layout>
  );
};

export default CustomerOrders;
