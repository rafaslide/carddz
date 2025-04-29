import { supabase } from '@/integrations/supabase/client';
import { 
  Product, 
  Category, 
  Restaurant, 
  CustomizationOption, 
  CustomizationItem,
  Order,
  OrderStatus,
  CartItem
} from '@/types';
import { Database } from '@/integrations/supabase/types';

// Restaurant functions
export const getRestaurantById = async (restaurantId: string) => {
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .eq('id', restaurantId)
    .single();

  if (error) throw error;
  return data as unknown as Restaurant;
};

export const updateRestaurant = async (restaurantId: string, restaurantData: Partial<Restaurant>) => {
  const { data, error } = await supabase
    .from('restaurants')
    .update({
      name: restaurantData.name,
      description: restaurantData.description,
      logo: restaurantData.logo,
      cover_image: restaurantData.coverImage,
      address: restaurantData.address,
      phone: restaurantData.phone,
    })
    .eq('id', restaurantId)
    .select();

  if (error) throw error;
  return data[0] as unknown as Restaurant;
};

export const getAllRestaurants = async () => {
  const { data, error } = await supabase
    .from('restaurants')
    .select('*');

  if (error) throw error;
  return data as unknown as Restaurant[];
};

// Category functions
export const getCategoriesByRestaurantId = async (restaurantId: string) => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .order('name');

  if (error) throw error;
  return data.map(category => ({
    id: category.id,
    name: category.name,
    description: category.description || '',
    restaurantId: category.restaurant_id,
  })) as Category[];
};

export const createCategory = async (categoryData: { name: string; description?: string; restaurantId: string }) => {
  const { data, error } = await supabase
    .from('categories')
    .insert([
      {
        name: categoryData.name,
        description: categoryData.description,
        restaurant_id: categoryData.restaurantId,
      }
    ])
    .select();

  if (error) throw error;
  
  return {
    id: data[0].id,
    name: data[0].name,
    description: data[0].description || '',
    restaurantId: data[0].restaurant_id,
  } as Category;
};

export const updateCategory = async (categoryId: string, categoryData: { name?: string; description?: string }) => {
  const { data, error } = await supabase
    .from('categories')
    .update({
      name: categoryData.name,
      description: categoryData.description,
    })
    .eq('id', categoryId)
    .select();

  if (error) throw error;
  
  return {
    id: data[0].id,
    name: data[0].name,
    description: data[0].description || '',
    restaurantId: data[0].restaurant_id,
  } as Category;
};

export const deleteCategory = async (categoryId: string) => {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', categoryId);

  if (error) throw error;
};

// Product functions
export const getProductsByRestaurantId = async (restaurantId: string) => {
  const { data: productsData, error: productsError } = await supabase
    .from('products')
    .select('*')
    .eq('restaurant_id', restaurantId);

  if (productsError) throw productsError;

  // Get customization options for all products
  const productIds = productsData.map(product => product.id);
  
  const { data: optionsData, error: optionsError } = await supabase
    .from('customization_options')
    .select('*')
    .in('product_id', productIds);

  if (optionsError) throw optionsError;

  // Get customization items for all options
  const optionIds = optionsData.map(option => option.id);
  
  const { data: itemsData, error: itemsError } = await supabase
    .from('customization_items')
    .select('*')
    .in('option_id', optionIds);

  if (itemsError) throw itemsError;

  // Map items to options
  const optionsWithItems = optionsData.map(option => ({
    id: option.id,
    name: option.name,
    required: option.required,
    multiSelect: option.multi_select,
    items: itemsData
      .filter(item => item.option_id === option.id)
      .map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
      })),
  }));

  // Map options to products
  return productsData.map(product => ({
    id: product.id,
    name: product.name,
    description: product.description || '',
    price: product.price,
    image: product.image || '',
    categoryId: product.category_id,
    restaurantId: product.restaurant_id,
    isPromotion: product.is_promotion,
    promotionPrice: product.promotion_price,
    isAvailable: product.is_available,
    customizationOptions: optionsWithItems.filter(option => 
      option.id && optionsData.some(o => o.id === option.id && o.product_id === product.id)
    ),
  })) as Product[];
};

export const createProduct = async (productData: {
  name: string;
  description?: string;
  price: number;
  image?: string;
  categoryId: string;
  restaurantId: string;
  isPromotion?: boolean;
  promotionPrice?: number;
  isAvailable?: boolean;
}) => {
  const { data, error } = await supabase
    .from('products')
    .insert([
      {
        name: productData.name,
        description: productData.description,
        price: productData.price,
        image: productData.image,
        category_id: productData.categoryId,
        restaurant_id: productData.restaurantId,
        is_promotion: productData.isPromotion,
        promotion_price: productData.promotionPrice,
        is_available: productData.isAvailable !== undefined ? productData.isAvailable : true,
      }
    ])
    .select();

  if (error) throw error;
  
  return {
    id: data[0].id,
    name: data[0].name,
    description: data[0].description || '',
    price: data[0].price,
    image: data[0].image || '',
    categoryId: data[0].category_id,
    restaurantId: data[0].restaurant_id,
    isPromotion: data[0].is_promotion,
    promotionPrice: data[0].promotion_price,
    isAvailable: data[0].is_available,
    customizationOptions: [],
  } as Product;
};

export const updateProduct = async (productId: string, productData: Partial<Product>) => {
  const { data, error } = await supabase
    .from('products')
    .update({
      name: productData.name,
      description: productData.description,
      price: productData.price,
      image: productData.image,
      category_id: productData.categoryId,
      is_promotion: productData.isPromotion,
      promotion_price: productData.promotionPrice,
      is_available: productData.isAvailable,
    })
    .eq('id', productId)
    .select();

  if (error) throw error;
  
  return {
    id: data[0].id,
    name: data[0].name,
    description: data[0].description || '',
    price: data[0].price,
    image: data[0].image || '',
    categoryId: data[0].category_id,
    restaurantId: data[0].restaurant_id,
    isPromotion: data[0].is_promotion,
    promotionPrice: data[0].promotion_price,
    isAvailable: data[0].is_available,
    // Note: this doesn't include customizationOptions - you'd need to fetch them separately
  } as Product;
};

export const deleteProduct = async (productId: string) => {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId);

  if (error) throw error;
};

// Customization options functions
export const createCustomizationOption = async (optionData: {
  name: string;
  required: boolean;
  multiSelect: boolean;
  productId: string;
  restaurantId: string;
}) => {
  const { data, error } = await supabase
    .from('customization_options')
    .insert([
      {
        name: optionData.name,
        required: optionData.required,
        multi_select: optionData.multiSelect,
        product_id: optionData.productId,
        restaurant_id: optionData.restaurantId,
      }
    ])
    .select();

  if (error) throw error;
  
  return {
    id: data[0].id,
    name: data[0].name,
    required: data[0].required,
    multiSelect: data[0].multi_select,
    items: [],
  } as CustomizationOption;
};

export const updateCustomizationOption = async (optionId: string, optionData: {
  name?: string;
  required?: boolean;
  multiSelect?: boolean;
}) => {
  const { data, error } = await supabase
    .from('customization_options')
    .update({
      name: optionData.name,
      required: optionData.required,
      multi_select: optionData.multiSelect,
    })
    .eq('id', optionId)
    .select();

  if (error) throw error;
  
  return {
    id: data[0].id,
    name: data[0].name,
    required: data[0].required,
    multiSelect: data[0].multi_select,
  };
};

export const deleteCustomizationOption = async (optionId: string) => {
  const { error } = await supabase
    .from('customization_options')
    .delete()
    .eq('id', optionId);

  if (error) throw error;
};

// Customization items functions
export const createCustomizationItem = async (itemData: {
  name: string;
  price: number;
  optionId: string;
  restaurantId: string;
}) => {
  const { data, error } = await supabase
    .from('customization_items')
    .insert([
      {
        name: itemData.name,
        price: itemData.price,
        option_id: itemData.optionId,
        restaurant_id: itemData.restaurantId,
      }
    ])
    .select();

  if (error) throw error;
  
  return {
    id: data[0].id,
    name: data[0].name,
    price: data[0].price,
  } as CustomizationItem;
};

export const updateCustomizationItem = async (itemId: string, itemData: {
  name?: string;
  price?: number;
}) => {
  const { data, error } = await supabase
    .from('customization_items')
    .update({
      name: itemData.name,
      price: itemData.price,
    })
    .eq('id', itemId)
    .select();

  if (error) throw error;
  
  return {
    id: data[0].id,
    name: data[0].name,
    price: data[0].price,
  } as CustomizationItem;
};

export const deleteCustomizationItem = async (itemId: string) => {
  const { error } = await supabase
    .from('customization_items')
    .delete()
    .eq('id', itemId);

  if (error) throw error;
};

// Order functions
export const getOrdersByRestaurantId = async (restaurantId: string): Promise<Order[]> => {
  const { data: ordersData, error: ordersError } = await supabase
    .from('orders')
    .select(`
      *,
      customers (*)
    `)
    .eq('restaurant_id', restaurantId)
    .order('created_at', { ascending: false });

  if (ordersError) throw ordersError;

  // Get order items for all orders
  const orderIds = ordersData.map(order => order.id);
  
  const { data: orderItemsData, error: orderItemsError } = await supabase
    .from('order_items')
    .select(`
      *,
      products (*)
    `)
    .in('order_id', orderIds);

  if (orderItemsError) throw orderItemsError;

  return ordersData.map(order => {
    const items = orderItemsData
      .filter(item => item.order_id === order.id)
      .map(item => {
        const product = item.products || { 
          id: item.product_id || '', 
          name: item.product_name,
          price: item.unit_price,
          description: '',
          image: '',
          categoryId: '',
          restaurantId: '',
          isAvailable: true,
        };
        
        // Convert customizations from JSON to the expected format
        let formattedCustomizations: { optionId: string; selectedItems: string[] }[] = [];
        
        if (item.customizations) {
          // Check if it's already in the correct format
          if (Array.isArray(item.customizations)) {
            formattedCustomizations = item.customizations.map((cust: any) => ({
              optionId: cust.optionId || '',
              selectedItems: Array.isArray(cust.selectedItems) ? cust.selectedItems : []
            }));
          }
        }
        
        return {
          product: {
            id: product.id,
            name: product.name,
            description: typeof product.description === 'string' ? product.description : '',
            price: typeof product.price === 'number' ? product.price : 0,
            image: typeof product.image === 'string' ? product.image : '',
            categoryId: product.category_id || '',
            restaurantId: product.restaurant_id || '',
            isPromotion: Boolean(product.is_promotion),
            promotionPrice: product.promotion_price || 0,
            isAvailable: product.is_available !== false,
            customizationOptions: [],
          },
          quantity: item.quantity,
          customizations: formattedCustomizations,
          totalPrice: item.total_price,
        } as CartItem;
      });

    return {
      id: order.id,
      restaurantId: order.restaurant_id,
      customerId: order.customer_id,
      items: items,
      totalPrice: order.total_price,
      status: order.status as OrderStatus,
      createdAt: order.created_at,
      notes: order.notes || undefined,
      deliveryAddress: order.delivery_address || undefined,
      contactPhone: order.contact_phone,
    } as Order;
  });
};

export const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId)
    .select();

  if (error) throw error;
  return data[0];
};

// Storage functions
export const uploadProductImage = async (file: File, restaurantId: string, productId: string) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${restaurantId}/${productId}-${Date.now()}.${fileExt}`;
  const filePath = `product-images/${fileName}`;

  const { data, error } = await supabase.storage
    .from('product-images')
    .upload(filePath, file);

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from('product-images')
    .getPublicUrl(filePath);

  return urlData.publicUrl;
};
