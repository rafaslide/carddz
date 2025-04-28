
import { Restaurant, Category, Product, Order } from '@/types';

export const mockRestaurants: Restaurant[] = [
  {
    id: 'rest1',
    name: 'Pizzaria Bella',
    description: 'As melhores pizzas da cidade',
    logo: '/placeholder.svg',
    coverImage: '/placeholder.svg',
    address: 'Av. das Pizzas, 123',
    phone: '(11) 99999-9999',
    categories: [],  // Will be populated from mockCategories
    products: [],    // Will be populated from mockProducts
    ownerId: '2'
  },
  {
    id: 'rest2',
    name: 'Burger King',
    description: 'Hamburgueres artesanais deliciosos',
    logo: '/placeholder.svg',
    coverImage: '/placeholder.svg',
    address: 'Rua do Hambúrguer, 456',
    phone: '(11) 88888-8888',
    categories: [],  // Will be populated from mockCategories
    products: [],    // Will be populated from mockProducts
    ownerId: '4'
  },
];

export const mockCategories: Category[] = [
  {
    id: 'cat1',
    name: 'Pizzas',
    description: 'Nossas deliciosas pizzas',
    restaurantId: 'rest1'
  },
  {
    id: 'cat2',
    name: 'Bebidas',
    description: 'Refrigerantes e sucos',
    restaurantId: 'rest1'
  },
  {
    id: 'cat3',
    name: 'Sobremesas',
    description: 'Doces para depois da refeição',
    restaurantId: 'rest1'
  },
  {
    id: 'cat4',
    name: 'Hamburgueres',
    description: 'Nossos melhores hamburgueres',
    restaurantId: 'rest2'
  },
  {
    id: 'cat5',
    name: 'Acompanhamentos',
    description: 'Batatas e outras opções',
    restaurantId: 'rest2'
  },
];

export const mockProducts: Product[] = [
  {
    id: 'prod1',
    name: 'Pizza Margherita',
    description: 'Molho de tomate, mussarela e manjericão',
    price: 45.90,
    image: '/placeholder.svg',
    categoryId: 'cat1',
    restaurantId: 'rest1',
    isAvailable: true,
    customizationOptions: [
      {
        id: 'opt1',
        name: 'Tamanho',
        required: true,
        multiSelect: false,
        items: [
          { id: 'item1', name: 'Média (30cm)', price: 0 },
          { id: 'item2', name: 'Grande (35cm)', price: 10 },
          { id: 'item3', name: 'Família (40cm)', price: 15 },
        ]
      },
      {
        id: 'opt2',
        name: 'Borda',
        required: false,
        multiSelect: false,
        items: [
          { id: 'item4', name: 'Sem borda', price: 0 },
          { id: 'item5', name: 'Catupiry', price: 5 },
          { id: 'item6', name: 'Cheddar', price: 5 },
        ]
      },
    ]
  },
  {
    id: 'prod2',
    name: 'Pizza Pepperoni',
    description: 'Molho de tomate, mussarela e pepperoni',
    price: 49.90,
    image: '/placeholder.svg',
    categoryId: 'cat1',
    restaurantId: 'rest1',
    isAvailable: true,
    isPromotion: true,
    promotionPrice: 39.90,
    customizationOptions: [
      {
        id: 'opt1',
        name: 'Tamanho',
        required: true,
        multiSelect: false,
        items: [
          { id: 'item1', name: 'Média (30cm)', price: 0 },
          { id: 'item2', name: 'Grande (35cm)', price: 10 },
          { id: 'item3', name: 'Família (40cm)', price: 15 },
        ]
      }
    ]
  },
  {
    id: 'prod3',
    name: 'Refrigerante Cola',
    description: 'Lata 350ml',
    price: 5.90,
    image: '/placeholder.svg',
    categoryId: 'cat2',
    restaurantId: 'rest1',
    isAvailable: true,
  },
  {
    id: 'prod4',
    name: 'Cheesecake',
    description: 'Torta de cream cheese com calda de frutas vermelhas',
    price: 15.90,
    image: '/placeholder.svg',
    categoryId: 'cat3',
    restaurantId: 'rest1',
    isAvailable: true,
  },
  {
    id: 'prod5',
    name: 'Hamburguer Clássico',
    description: 'Pão, hambúrguer, queijo, alface, tomate e molho especial',
    price: 25.90,
    image: '/placeholder.svg',
    categoryId: 'cat4',
    restaurantId: 'rest2',
    isAvailable: true,
    customizationOptions: [
      {
        id: 'opt3',
        name: 'Ponto da carne',
        required: true,
        multiSelect: false,
        items: [
          { id: 'item7', name: 'Ao ponto', price: 0 },
          { id: 'item8', name: 'Bem passado', price: 0 },
        ]
      },
      {
        id: 'opt4',
        name: 'Adicionais',
        required: false,
        multiSelect: true,
        items: [
          { id: 'item9', name: 'Bacon', price: 3 },
          { id: 'item10', name: 'Ovo', price: 2 },
          { id: 'item11', name: 'Queijo extra', price: 3 },
        ]
      }
    ]
  },
  {
    id: 'prod6',
    name: 'Batata Frita',
    description: 'Porção de batata frita crocante',
    price: 12.90,
    image: '/placeholder.svg',
    categoryId: 'cat5',
    restaurantId: 'rest2',
    isAvailable: true,
    customizationOptions: [
      {
        id: 'opt5',
        name: 'Tamanho',
        required: true,
        multiSelect: false,
        items: [
          { id: 'item12', name: 'Pequena', price: 0 },
          { id: 'item13', name: 'Média', price: 5 },
          { id: 'item14', name: 'Grande', price: 8 },
        ]
      }
    ]
  },
];

export const mockOrders: Order[] = [
  {
    id: 'order1',
    restaurantId: 'rest1',
    customerId: '3',
    items: [
      {
        product: mockProducts[0],
        quantity: 1,
        customizations: [
          { optionId: 'opt1', selectedItems: ['item2'] },
          { optionId: 'opt2', selectedItems: ['item5'] }
        ],
        totalPrice: 64.90 // 49.90 (base) + 10 (large) + 5 (catupiry)
      },
      {
        product: mockProducts[2],
        quantity: 2,
        customizations: [],
        totalPrice: 11.80 // 5.90 * 2
      }
    ],
    totalPrice: 76.70,
    status: 'pending',
    createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    contactPhone: '(11) 99999-9999',
    deliveryAddress: 'Rua das Flores, 123, Apto 101'
  },
];

// Initialize restaurants with categories and products
mockRestaurants.forEach(restaurant => {
  restaurant.categories = mockCategories.filter(
    category => category.restaurantId === restaurant.id
  );
  restaurant.products = mockProducts.filter(
    product => product.restaurantId === restaurant.id
  );
});

// Service to simulate API calls
export const mockDataService = {
  getRestaurants: () => Promise.resolve([...mockRestaurants]),
  getRestaurantById: (id: string) => Promise.resolve(
    mockRestaurants.find(r => r.id === id) || null
  ),
  getCategories: (restaurantId: string) => Promise.resolve(
    mockCategories.filter(c => c.restaurantId === restaurantId)
  ),
  getProducts: (restaurantId: string, categoryId?: string) => {
    let products = mockProducts.filter(p => p.restaurantId === restaurantId);
    if (categoryId) {
      products = products.filter(p => p.categoryId === categoryId);
    }
    return Promise.resolve(products);
  },
  getOrders: (userId: string, role: string, restaurantId?: string) => {
    let orders = [...mockOrders];
    
    if (role === 'customer') {
      orders = orders.filter(o => o.customerId === userId);
    } else if (role === 'restaurant' && restaurantId) {
      orders = orders.filter(o => o.restaurantId === restaurantId);
    }
    
    return Promise.resolve(orders);
  },
  createOrder: (order: Omit<Order, 'id' | 'createdAt'>) => {
    const newOrder: Order = {
      ...order,
      id: `order${mockOrders.length + 1}`,
      createdAt: new Date().toISOString()
    };
    mockOrders.push(newOrder);
    return Promise.resolve(newOrder);
  },
  updateOrderStatus: (orderId: string, status: Order['status']) => {
    const orderIndex = mockOrders.findIndex(o => o.id === orderId);
    if (orderIndex >= 0) {
      mockOrders[orderIndex].status = status;
      return Promise.resolve(mockOrders[orderIndex]);
    }
    return Promise.reject(new Error('Order not found'));
  }
};
