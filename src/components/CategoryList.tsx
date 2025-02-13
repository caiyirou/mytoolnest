'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CreateCategoryDialog from './CreateCategoryDialog';
import EditCategoryDialog from './EditCategoryDialog';
import type { Category } from '@/types/category';

interface CategoryListProps {
  categories: Category[];
  selectedCategory: string;
}

export default function CategoryList({ categories, selectedCategory }: CategoryListProps) {
  const router = useRouter();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const handleCategoryClick = (categoryId: string) => {
    router.push(`/dashboard?category=${categoryId}`);
  };

  const handleEditClick = (category: Category, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCategory(category);
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">分类</h2>
        <button
          onClick={() => setIsCreateDialogOpen(true)}
          className="inline-flex items-center p-1.5 border border-transparent rounded-full text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      <nav className="space-y-1">
        <button
          onClick={() => handleCategoryClick('all')}
          className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
            selectedCategory === 'all'
              ? 'bg-gray-100 text-gray-900'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          }`}
        >
          全部工具
        </button>
        <button
          onClick={() => handleCategoryClick('uncategorized')}
          className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
            selectedCategory === 'uncategorized'
              ? 'bg-gray-100 text-gray-900'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          }`}
        >
          未分类
        </button>
        {categories.map((category) => (
          <div
            key={category._id}
            onClick={() => handleCategoryClick(category._id)}
            className={`group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md cursor-pointer ${
              selectedCategory === category._id
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <span>{category.name}</span>
            <button
              onClick={(e) => handleEditClick(category, e)}
              className="hidden group-hover:block p-1 text-gray-400 hover:text-gray-500"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>
          </div>
        ))}
      </nav>

      <CreateCategoryDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
      />

      {editingCategory && (
        <EditCategoryDialog
          isOpen={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false);
            setEditingCategory(null);
          }}
          category={editingCategory}
        />
      )}
    </div>
  );
}