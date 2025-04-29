
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Product, Category } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface ProductFormDialogProps {
  open: boolean;
  onClose: () => void;
  product: Product | null;
  categories: Category[];
  onSave: (product: Product) => void;
}

const ProductFormDialog = ({ open, onClose, product, categories, onSave }: ProductFormDialogProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isPromotion, setIsPromotion] = useState(false);
  const [promotionPrice, setPromotionPrice] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { profile } = useAuth();

  useEffect(() => {
    if (product) {
      setName(product.name);
      setDescription(product.description || '');
      setPrice(product.price.toString());
      setCategoryId(product.categoryId);
      setIsPromotion(product.isPromotion || false);
      setPromotionPrice(product.promotionPrice?.toString() || '');
      setIsAvailable(product.isAvailable !== undefined ? product.isAvailable : true);
      setImagePreview(product.image || '');
    } else {
      resetForm();
    }
  }, [product]);

  const resetForm = () => {
    setName('');
    setDescription('');
    setPrice('');
    setCategoryId(categories.length > 0 ? categories[0].id : '');
    setIsPromotion(false);
    setPromotionPrice('');
    setIsAvailable(true);
    setImageFile(null);
    setImagePreview('');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setImageFile(file);
    
    // Create a preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      let imageUrl = product?.image || '';
      
      // Upload image if there's a new one
      if (imageFile && profile?.restaurantId) {
        setUploading(true);
        const productId = product?.id || 'new-' + Date.now();
        
        // Create a storage bucket if it doesn't exist yet
        try {
          await supabase.storage.createBucket('product-images', {
            public: true,
            fileSizeLimit: 5242880, // 5MB
          });
        } catch (error) {
          // Bucket may already exist, continue
        }
        
        // Upload the file
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${profile.restaurantId}/${productId}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        // Get the public URL
        const { data: urlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        imageUrl = urlData.publicUrl;
        setUploading(false);
      }

      // Prepare product data
      const productData: Product = {
        id: product?.id || '',
        name,
        description,
        price: parseFloat(price),
        image: imageUrl,
        categoryId,
        restaurantId: profile?.restaurantId || '',
        isPromotion,
        promotionPrice: isPromotion && promotionPrice ? parseFloat(promotionPrice) : undefined,
        isAvailable,
        customizationOptions: product?.customizationOptions || [],
      };

      onSave(productData);
      
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error saving product: ' + (error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {product ? 'Editar Produto' : 'Novo Produto'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Preço *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Categoria *</Label>
                <Select value={categoryId} onValueChange={setCategoryId} required>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Imagem</Label>
              <div className="flex items-center space-x-4">
                {imagePreview && (
                  <div 
                    className="w-16 h-16 bg-cover bg-center rounded" 
                    style={{ backgroundImage: `url(${imagePreview})` }}
                  />
                )}
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="flex-1"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isPromotion"
                checked={isPromotion}
                onCheckedChange={setIsPromotion}
              />
              <Label htmlFor="isPromotion">É uma promoção</Label>
            </div>
            
            {isPromotion && (
              <div className="space-y-2">
                <Label htmlFor="promotionPrice">Preço promocional</Label>
                <Input
                  id="promotionPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={promotionPrice}
                  onChange={(e) => setPromotionPrice(e.target.value)}
                  required={isPromotion}
                />
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Switch
                id="isAvailable"
                checked={isAvailable}
                onCheckedChange={setIsAvailable}
              />
              <Label htmlFor="isAvailable">Disponível para venda</Label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving || uploading}>
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductFormDialog;
