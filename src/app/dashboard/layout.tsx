import { Suspense } from 'react';
import CategoryList from '@/components/CategoryList';
import { getCategories } from '../actions/categories';

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const categories = await getCategories();

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-[240px,1fr]">
          <aside>
            <Suspense fallback={<div>加载中...</div>}>
              <CategoryList categories={categories} selectedCategory="all" />
            </Suspense>
          </aside>
          <main>{children}</main>
        </div>
      </div>
    </div>
  );
}