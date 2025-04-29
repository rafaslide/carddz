
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Product, CustomizationOption, CustomizationItem } from '@/types';
import { Plus, Trash, Edit } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import * as supabaseService from '@/services/supabaseService';
import { useToast } from '@/components/ui/use-toast';

interface CustomizationDialogProps {
  open: boolean;
  onClose: () => void;
  product: Product;
  onSave: (product: Product) => void;
}

const CustomizationDialog = ({ open, onClose, product, onSave }: CustomizationDialogProps) => {
  const [options, setOptions] = useState<CustomizationOption[]>([]);
  const [editingOption, setEditingOption] = useState<CustomizationOption | null>(null);
  const [editingOptionIndex, setEditingOptionIndex] = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<CustomizationItem | null>(null);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);

  const [optionName, setOptionName] = useState('');
  const [isRequired, setIsRequired] = useState(false);
  const [isMultiSelect, setIsMultiSelect] = useState(false);

  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');

  const [saving, setSaving] = useState(false);
  const { profile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (product && product.customizationOptions) {
      setOptions([...product.customizationOptions]);
    } else {
      setOptions([]);
    }
  }, [product]);

  // Reset option form
  const resetOptionForm = () => {
    setOptionName('');
    setIsRequired(false);
    setIsMultiSelect(false);
    setEditingOption(null);
    setEditingOptionIndex(null);
  };

  // Reset item form
  const resetItemForm = () => {
    setItemName('');
    setItemPrice('');
    setEditingItem(null);
    setEditingItemIndex(null);
  };

  // Add or update option
  const handleSaveOption = async () => {
    if (!optionName.trim()) return;

    try {
      const newOption: CustomizationOption = {
        id: editingOption?.id || '',
        name: optionName,
        required: isRequired,
        multiSelect: isMultiSelect,
        items: editingOption?.items || [],
      };

      if (editingOption?.id) {
        // Update existing option
        await supabaseService.updateCustomizationOption(editingOption.id, {
          name: optionName,
          required: isRequired,
          multiSelect: isMultiSelect,
        });

        const updated = [...options];
        if (editingOptionIndex !== null) {
          updated[editingOptionIndex] = newOption;
        }
        setOptions(updated);
      } else {
        // Create new option
        if (!profile?.restaurantId) {
          throw new Error('ID do restaurante não encontrado');
        }
        
        const created = await supabaseService.createCustomizationOption({
          name: optionName,
          required: isRequired,
          multiSelect: isMultiSelect,
          productId: product.id,
          restaurantId: profile.restaurantId,
        });
        
        setOptions([...options, { ...created, items: [] }]);
      }

      resetOptionForm();
      toast({
        title: 'Sucesso',
        description: 'Opção de personalização salva com sucesso.',
      });
    } catch (error) {
      console.error('Error saving customization option:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao salvar a opção de personalização.',
        variant: 'destructive',
      });
    }
  };

  // Delete option
  const handleDeleteOption = async (index: number, optionId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta opção de personalização?')) {
      return;
    }
    
    try {
      await supabaseService.deleteCustomizationOption(optionId);
      const updated = [...options];
      updated.splice(index, 1);
      setOptions(updated);
      toast({
        title: 'Sucesso',
        description: 'Opção de personalização excluída com sucesso.',
      });
    } catch (error) {
      console.error('Error deleting customization option:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao excluir a opção de personalização.',
        variant: 'destructive',
      });
    }
  };

  // Edit option
  const handleEditOption = (index: number) => {
    const option = options[index];
    setOptionName(option.name);
    setIsRequired(option.required);
    setIsMultiSelect(option.multiSelect);
    setEditingOption(option);
    setEditingOptionIndex(index);
  };

  // Add or update item
  const handleSaveItem = async () => {
    if (!itemName.trim() || selectedOptionIndex === null) return;

    try {
      const selectedOption = options[selectedOptionIndex];
      
      if (!profile?.restaurantId) {
        throw new Error('ID do restaurante não encontrado');
      }

      const newItem: CustomizationItem = {
        id: editingItem?.id || '',
        name: itemName,
        price: parseFloat(itemPrice) || 0,
      };

      if (editingItem?.id) {
        // Update existing item
        await supabaseService.updateCustomizationItem(editingItem.id, {
          name: itemName,
          price: parseFloat(itemPrice) || 0,
        });

        const updatedOptions = [...options];
        const updatedItems = [...selectedOption.items];
        if (editingItemIndex !== null) {
          updatedItems[editingItemIndex] = newItem;
        }
        updatedOptions[selectedOptionIndex] = {
          ...selectedOption,
          items: updatedItems,
        };
        setOptions(updatedOptions);
      } else {
        // Create new item
        const created = await supabaseService.createCustomizationItem({
          name: itemName,
          price: parseFloat(itemPrice) || 0,
          optionId: selectedOption.id,
          restaurantId: profile.restaurantId,
        });
        
        const updatedOptions = [...options];
        const updatedItems = [...selectedOption.items, created];
        updatedOptions[selectedOptionIndex] = {
          ...selectedOption,
          items: updatedItems,
        };
        setOptions(updatedOptions);
      }

      resetItemForm();
      toast({
        title: 'Sucesso',
        description: 'Item de personalização salvo com sucesso.',
      });
    } catch (error) {
      console.error('Error saving customization item:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao salvar o item de personalização.',
        variant: 'destructive',
      });
    }
  };

  // Delete item
  const handleDeleteItem = async (optionIndex: number, itemIndex: number, itemId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este item de personalização?')) {
      return;
    }
    
    try {
      await supabaseService.deleteCustomizationItem(itemId);
      const updatedOptions = [...options];
      const updatedItems = [...updatedOptions[optionIndex].items];
      updatedItems.splice(itemIndex, 1);
      updatedOptions[optionIndex] = {
        ...updatedOptions[optionIndex],
        items: updatedItems,
      };
      setOptions(updatedOptions);
      toast({
        title: 'Sucesso',
        description: 'Item de personalização excluído com sucesso.',
      });
    } catch (error) {
      console.error('Error deleting customization item:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao excluir o item de personalização.',
        variant: 'destructive',
      });
    }
  };

  // Edit item
  const handleEditItem = (optionIndex: number, itemIndex: number) => {
    const item = options[optionIndex].items[itemIndex];
    setItemName(item.name);
    setItemPrice(item.price.toString());
    setEditingItem(item);
    setEditingItemIndex(itemIndex);
  };

  // Save all customizations
  const handleSave = () => {
    setSaving(true);
    try {
      const updatedProduct: Product = {
        ...product,
        customizationOptions: options,
      };
      onSave(updatedProduct);
    } catch (error) {
      console.error('Error saving customizations:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao salvar as personalizações.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Personalizações para {product.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Option Form */}
          <Card>
            <CardHeader className="pb-3">
              <h3 className="text-lg font-medium">
                {editingOption ? 'Editar Opção' : 'Nova Opção de Personalização'}
              </h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="optionName">Nome da Opção</Label>
                  <Input
                    id="optionName"
                    value={optionName}
                    onChange={(e) => setOptionName(e.target.value)}
                    placeholder="Ex: Molhos, Tamanho, Extras"
                  />
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isRequired"
                      checked={isRequired}
                      onCheckedChange={setIsRequired}
                    />
                    <Label htmlFor="isRequired">Obrigatório</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isMultiSelect"
                      checked={isMultiSelect}
                      onCheckedChange={setIsMultiSelect}
                    />
                    <Label htmlFor="isMultiSelect">Seleção Múltipla</Label>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  {editingOption && (
                    <Button type="button" variant="outline" onClick={resetOptionForm}>
                      Cancelar
                    </Button>
                  )}
                  <Button type="button" onClick={handleSaveOption}>
                    {editingOption ? 'Atualizar Opção' : 'Adicionar Opção'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Options List */}
          <div className="space-y-4">
            <h3 className="font-medium">Opções de Personalização</h3>
            
            {options.length === 0 ? (
              <p className="text-sm text-gray-500">Nenhuma opção adicionada ainda.</p>
            ) : (
              options.map((option, optionIndex) => (
                <Card key={option.id || optionIndex}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">
                        {option.name}
                        <span className="ml-2 text-sm font-normal text-gray-500">
                          {option.required ? 'Obrigatório' : 'Opcional'}
                          {option.multiSelect ? ', Múltipla escolha' : ''}
                        </span>
                      </h4>
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleEditOption(optionIndex)}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDeleteOption(optionIndex, option.id)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash size={16} />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    {/* Item Form */}
                    {selectedOptionIndex === optionIndex ? (
                      <div className="space-y-4 mb-4 bg-gray-50 p-3 rounded-md">
                        <h5 className="font-medium">
                          {editingItem ? 'Editar Item' : 'Novo Item'}
                        </h5>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="itemName">Nome do Item</Label>
                            <Input
                              id="itemName"
                              value={itemName}
                              onChange={(e) => setItemName(e.target.value)}
                              placeholder="Ex: Ketchup, Grande, Queijo Extra"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="itemPrice">Preço Adicional</Label>
                            <Input
                              id="itemPrice"
                              type="number"
                              step="0.01"
                              min="0"
                              value={itemPrice}
                              onChange={(e) => setItemPrice(e.target.value)}
                              placeholder="0.00"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end space-x-2">
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => {
                              resetItemForm();
                              setSelectedOptionIndex(null);
                            }}
                          >
                            Cancelar
                          </Button>
                          <Button type="button" onClick={handleSaveItem}>
                            {editingItem ? 'Atualizar Item' : 'Adicionar Item'}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mb-4"
                        onClick={() => {
                          resetItemForm();
                          setSelectedOptionIndex(optionIndex);
                        }}
                      >
                        <Plus size={14} className="mr-1" />
                        Adicionar Item
                      </Button>
                    )}

                    {/* Items List */}
                    {option.items.length === 0 ? (
                      <p className="text-sm text-gray-500">Nenhum item adicionado ainda.</p>
                    ) : (
                      <div className="space-y-2">
                        {option.items.map((item, itemIndex) => (
                          <div 
                            key={item.id || itemIndex} 
                            className="flex justify-between items-center p-2 bg-gray-50 rounded"
                          >
                            <div>
                              <span className="font-medium">{item.name}</span>
                              {item.price > 0 && (
                                <span className="ml-2 text-sm text-gray-600">
                                  + R$ {item.price.toFixed(2)}
                                </span>
                              )}
                            </div>
                            <div className="flex space-x-1">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => {
                                  handleEditItem(optionIndex, itemIndex);
                                  setSelectedOptionIndex(optionIndex);
                                }}
                              >
                                <Edit size={14} />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleDeleteItem(optionIndex, itemIndex, item.id)}
                                className="text-red-500 hover:text-red-600"
                              >
                                <Trash size={14} />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar Personalizações'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CustomizationDialog;
