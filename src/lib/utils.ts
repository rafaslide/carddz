
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Order } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

export function generateWhatsAppMessage(order: Order): string {
  const restaurantName = "Restaurante"; // This should be dynamic in a real app
  
  let message = `*Novo pedido via Carddz*\n\n`;
  message += `*Número do pedido:* ${order.id}\n`;
  message += `*Cliente:* Cliente\n`; // This should be dynamic in a real app
  message += `*Telefone:* ${order.contactPhone}\n`;
  
  if (order.deliveryAddress) {
    message += `*Endereço de entrega:* ${order.deliveryAddress}\n`;
  }
  
  message += `\n*Itens do pedido:*\n`;
  
  order.items.forEach((item, index) => {
    message += `${index + 1}. ${item.quantity}x ${item.product.name} - ${formatCurrency(item.totalPrice)}\n`;
    
    // Add customizations if any
    item.customizations.forEach(customization => {
      const option = item.product.customizationOptions?.find(opt => opt.id === customization.optionId);
      if (option) {
        const selectedItems = option.items.filter(i => 
          customization.selectedItems.includes(i.id)
        );
        
        if (selectedItems.length > 0) {
          const itemsText = selectedItems.map(i => i.name).join(', ');
          message += `   - ${option.name}: ${itemsText}\n`;
        }
      }
    });
  });
  
  message += `\n*Total do pedido:* ${formatCurrency(order.totalPrice)}\n`;
  
  if (order.notes) {
    message += `\n*Observações:* ${order.notes}\n`;
  }
  
  message += `\n*Data do pedido:* ${formatDate(order.createdAt)}`;
  
  return encodeURIComponent(message);
}
