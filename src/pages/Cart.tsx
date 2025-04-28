
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency, generateWhatsAppMessage } from '@/lib/utils';
import CartItemComponent from '@/components/CartItem';
import { mockDataService } from '@/data/mockData';
import { useToast } from '@/components/ui/use-toast';
import { OrderStatus, Order } from '@/types';

const Cart = () => {
  const { items, totalPrice, clearCart, restaurantId } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [notes, setNotes] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCheckout = async () => {
    if (!restaurantId || items.length === 0) {
      toast({
        title: "Erro",
        description: "Seu carrinho está vazio",
        variant: "destructive"
      });
      return;
    }

    if (!contactPhone) {
      toast({
        title: "Erro",
        description: "Por favor, informe um telefone para contato",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Create order object
      const orderData: Omit<Order, 'id' | 'createdAt'> = {
        restaurantId,
        customerId: user?.id || 'guest',
        items,
        totalPrice,
        status: 'pending' as OrderStatus,
        notes,
        deliveryAddress,
        contactPhone,
      };
      
      // Save order
      const createdOrder = await mockDataService.createOrder(orderData);
      
      // Clear cart
      clearCart();
      
      // Show success message
      toast({
        title: "Pedido realizado com sucesso",
        description: `Seu pedido #${createdOrder.id} foi enviado ao restaurante.`
      });
      
      // Navigate to order detail or confirmation page
      navigate(`/orders/${createdOrder.id}`);
    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao processar seu pedido. Por favor, tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppShare = async () => {
    if (!restaurantId || items.length === 0) {
      toast({
        title: "Erro",
        description: "Seu carrinho está vazio",
        variant: "destructive"
      });
      return;
    }

    if (!contactPhone) {
      toast({
        title: "Erro",
        description: "Por favor, informe um telefone para contato",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Create temporary order object for generating the message
      const orderData: Order = {
        id: 'preview',
        restaurantId,
        customerId: user?.id || 'guest',
        items,
        totalPrice,
        status: 'pending',
        notes,
        deliveryAddress,
        contactPhone,
        createdAt: new Date().toISOString()
      };
      
      // Generate WhatsApp message
      const message = generateWhatsAppMessage(orderData);
      
      // Open WhatsApp with pre-filled message
      window.open(`https://wa.me/?text=${message}`, '_blank');
    } catch (error) {
      console.error('Error generating WhatsApp message:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao gerar a mensagem para WhatsApp.",
        variant: "destructive"
      });
    }
  };

  if (items.length === 0) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Seu Carrinho</h1>
          <p className="text-gray-600 mb-6">Seu carrinho está vazio</p>
          <Button onClick={() => navigate('/')}>
            Voltar ao Cardápio
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">Seu Carrinho</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
            <h2 className="text-xl font-semibold mb-4">Itens do Pedido</h2>
            <div className="divide-y">
              {items.map((item, index) => (
                <CartItemComponent key={index} item={item} />
              ))}
            </div>
          </div>
        </div>
        
        {/* Order Summary and Checkout */}
        <div>
          <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
            <h2 className="text-xl font-semibold mb-4">Resumo do Pedido</h2>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatCurrency(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Taxa de entrega</span>
                <span>Grátis</span>
              </div>
              <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                <span>Total</span>
                <span>{formatCurrency(totalPrice)}</span>
              </div>
            </div>
          </div>
          
          {/* Customer Information */}
          <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
            <h2 className="text-xl font-semibold mb-4">Informações para Entrega</h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="phone">Telefone para contato *</Label>
                <Input
                  id="phone"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="(00) 00000-0000"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="address">Endereço de entrega</Label>
                <Textarea
                  id="address"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Rua, número, complemento, bairro"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Alguma instrução especial para o restaurante?"
                  rows={2}
                />
              </div>
            </div>
          </div>
          
          {/* Checkout Buttons */}
          <div className="flex flex-col space-y-3">
            <Button
              onClick={handleCheckout}
              disabled={isSubmitting || items.length === 0}
              className="w-full"
            >
              {isSubmitting ? 'Processando...' : 'Finalizar Pedido'}
            </Button>
            
            <Button
              variant="outline"
              onClick={handleWhatsAppShare}
              disabled={isSubmitting || items.length === 0}
              className="w-full"
            >
              Compartilhar no WhatsApp
            </Button>
            
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="w-full"
            >
              Continuar Comprando
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Cart;
