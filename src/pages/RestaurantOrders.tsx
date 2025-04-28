
import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { mockDataService } from '@/data/mockData';
import { Order, OrderStatus } from '@/types';
import { formatCurrency, formatDate, generateWhatsAppMessage } from '@/lib/utils';
import OrderStatusBadge from '@/components/OrderStatusBadge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from '@/components/ui/use-toast';

const statusOptions: { label: string; value: OrderStatus }[] = [
  { label: 'Pendente', value: 'pending' },
  { label: 'Confirmado', value: 'confirmed' },
  { label: 'Em preparo', value: 'preparing' },
  { label: 'Saiu para entrega', value: 'out_for_delivery' },
  { label: 'Entregue', value: 'delivered' },
  { label: 'Cancelado', value: 'cancelled' },
];

const RestaurantOrders = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, [user]);

  const loadOrders = async () => {
    if (!user || !user.restaurantId) return;

    try {
      setLoading(true);
      const restaurantOrders = await mockDataService.getOrders(
        user.id, 
        user.role, 
        user.restaurantId
      );
      setOrders(restaurantOrders);
    } catch (err) {
      console.error('Error loading orders:', err);
      setError('Erro ao carregar pedidos');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    try {
      setUpdatingOrderId(orderId);
      await mockDataService.updateOrderStatus(orderId, newStatus);
      
      // Update local orders array
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      
      toast({
        title: 'Status atualizado',
        description: `O pedido #${orderId} foi atualizado para ${
          statusOptions.find(s => s.value === newStatus)?.label || newStatus
        }`,
      });
    } catch (err) {
      console.error('Error updating order status:', err);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o status do pedido',
        variant: 'destructive',
      });
    } finally {
      setUpdatingOrderId(null);
    }
  };

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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gerenciar Pedidos</h1>
        <Button onClick={loadOrders}>Atualizar</Button>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-lg shadow-sm p-8">
          <p className="text-gray-600">Nenhum pedido recebido ainda</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <div className="bg-muted px-4 py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <span className="font-medium">Pedido #{order.id}</span>
                  <span className="text-sm text-gray-500 ml-4">
                    {formatDate(order.createdAt)}
                  </span>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <OrderStatusBadge status={order.status} />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        disabled={updatingOrderId === order.id}
                      >
                        {updatingOrderId === order.id 
                          ? 'Atualizando...' 
                          : 'Atualizar Status'}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Atualizar para</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {statusOptions.map((option) => (
                        <DropdownMenuItem
                          key={option.value}
                          disabled={order.status === option.value}
                          onClick={() => handleStatusUpdate(order.id, option.value)}
                        >
                          {option.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
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
                
                {/* Customer info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="font-medium text-sm">Telefone de contato:</h4>
                    <p className="text-gray-600">{order.contactPhone}</p>
                  </div>
                  
                  {/* Order notes */}
                  {order.notes && (
                    <div>
                      <h4 className="font-medium text-sm">Observações:</h4>
                      <p className="text-gray-600">{order.notes}</p>
                    </div>
                  )}
                  
                  {/* Order delivery address */}
                  {order.deliveryAddress && (
                    <div className="col-span-1 md:col-span-2">
                      <h4 className="font-medium text-sm">Endereço de entrega:</h4>
                      <p className="text-gray-600">{order.deliveryAddress}</p>
                    </div>
                  )}
                </div>
                
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

export default RestaurantOrders;
