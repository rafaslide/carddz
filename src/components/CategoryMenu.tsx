
import React from 'react';
import { Category } from '@/types';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface CategoryMenuProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

const CategoryMenu: React.FC<CategoryMenuProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
}) => {
  return (
    <ScrollArea className="w-full">
      <div className="flex space-x-2 pb-4">
        <Button
          variant={selectedCategoryId === null ? "default" : "outline"}
          size="sm"
          onClick={() => onSelectCategory(null)}
          className={cn(
            "whitespace-nowrap",
            selectedCategoryId === null ? "bg-brand hover:bg-brand/90" : ""
          )}
        >
          Todos
        </Button>
        
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategoryId === category.id ? "default" : "outline"}
            size="sm"
            onClick={() => onSelectCategory(category.id)}
            className={cn(
              "whitespace-nowrap",
              selectedCategoryId === category.id ? "bg-brand hover:bg-brand/90" : ""
            )}
          >
            {category.name}
          </Button>
        ))}
      </div>
    </ScrollArea>
  );
};

export default CategoryMenu;
