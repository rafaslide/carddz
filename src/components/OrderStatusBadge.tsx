
import { OrderStatus } from '@/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return {
          label: 'Pendente',
          className: 'bg-yellow-500/20 text-yellow-700 hover:bg-yellow-500/20'
        };
      case 'confirmed':
        return {
          label: 'Confirmado',
          className: 'bg-blue-500/20 text-blue-700 hover:bg-blue-500/20'
        };
      case 'preparing':
        return {
          label: 'Em preparo',
          className: 'bg-indigo-500/20 text-indigo-700 hover:bg-indigo-500/20'
        };
      case 'out_for_delivery':
        return {
          label: 'Saiu para entrega',
          className: 'bg-purple-500/20 text-purple-700 hover:bg-purple-500/20'
        };
      case 'delivered':
        return {
          label: 'Entregue',
          className: 'bg-green-500/20 text-green-700 hover:bg-green-500/20'
        };
      case 'cancelled':
        return {
          label: 'Cancelado',
          className: 'bg-red-500/20 text-red-700 hover:bg-red-500/20'
        };
      default:
        return {
          label: 'Desconhecido',
          className: 'bg-gray-500/20 text-gray-700 hover:bg-gray-500/20'
        };
    }
  };

  const { label, className } = getStatusConfig();

  return (
    <Badge variant="outline" className={cn('font-medium', className)}>
      {label}
    </Badge>
  );
};

export default OrderStatusBadge;
