
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Restaurant } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { ImagePlus } from 'lucide-react';

interface RestaurantFormDialogProps {
  open: boolean;
  onClose: () => void;
  restaurant: Restaurant | null;
  onSave: (restaurant: Restaurant) => void;
}

const RestaurantFormDialog = ({ open, onClose, restaurant, onSave }: RestaurantFormDialogProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (restaurant) {
      setName(restaurant.name);
      setDescription(restaurant.description || '');
      setAddress(restaurant.address);
      setPhone(restaurant.phone);
      setLogoPreview(restaurant.logo || '');
      setCoverPreview(restaurant.coverImage || '');
    } else {
      resetForm();
    }
  }, [restaurant]);

  const resetForm = () => {
    setName('');
    setDescription('');
    setAddress('');
    setPhone('');
    setLogoFile(null);
    setLogoPreview('');
    setCoverFile(null);
    setCoverPreview('');
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setLogoFile(file);
    
    // Create a preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setCoverFile(file);
    
    // Create a preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setCoverPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadImage = async (file: File, path: string) => {
    try {
      // Create a storage bucket if it doesn't exist yet
      try {
        await supabase.storage.createBucket('restaurant-images', {
          public: true,
          fileSizeLimit: 5242880, // 5MB
        });
      } catch (error) {
        // Bucket may already exist, continue
      }
      
      // Upload the file
      const fileExt = file.name.split('.').pop();
      const fileName = `${path}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('restaurant-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('restaurant-images')
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      let logoUrl = restaurant?.logo || '';
      let coverUrl = restaurant?.coverImage || '';
      
      // Upload images if there are new ones
      if (logoFile || coverFile) {
        setUploading(true);
        const restaurantId = restaurant?.id || 'new-' + Date.now();
        
        if (logoFile) {
          logoUrl = await uploadImage(logoFile, `${restaurantId}/logo`);
        }
        
        if (coverFile) {
          coverUrl = await uploadImage(coverFile, `${restaurantId}/cover`);
        }
        
        setUploading(false);
      }

      // Prepare restaurant data
      const restaurantData: Restaurant = {
        id: restaurant?.id || '',
        name,
        description,
        address,
        phone,
        logo: logoUrl,
        coverImage: coverUrl,
        ownerId: restaurant?.ownerId || '',
        products: restaurant?.products || [],
        categories: restaurant?.categories || [],
      };

      onSave(restaurantData);
      
    } catch (error) {
      console.error('Error saving restaurant:', error);
      alert('Error saving restaurant: ' + (error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {restaurant ? 'Editar Restaurante' : 'Novo Restaurante'}
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

            <div className="space-y-2">
              <Label htmlFor="address">Endereço *</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone *</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo">Logo</Label>
              <div className="flex items-center space-x-4">
                {logoPreview ? (
                  <div 
                    className="w-16 h-16 bg-cover bg-center rounded" 
                    style={{ backgroundImage: `url(${logoPreview})` }}
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-100 flex items-center justify-center rounded">
                    <ImagePlus size={24} className="text-gray-400" />
                  </div>
                )}
                <Input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cover">Imagem de Capa</Label>
              <div className="flex flex-col space-y-2">
                {coverPreview ? (
                  <div 
                    className="w-full h-32 bg-cover bg-center rounded" 
                    style={{ backgroundImage: `url(${coverPreview})` }}
                  />
                ) : (
                  <div className="w-full h-32 bg-gray-100 flex items-center justify-center rounded">
                    <ImagePlus size={32} className="text-gray-400" />
                  </div>
                )}
                <Input
                  id="cover"
                  type="file"
                  accept="image/*"
                  onChange={handleCoverChange}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving || uploading}>
              {saving || uploading ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RestaurantFormDialog;
