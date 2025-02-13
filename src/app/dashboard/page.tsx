'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ToolCard from '@/components/ToolCard';
import type { Tool } from '@/types/tool';

// 排序选项
const sortOptions = [
  { value: 'newest', label: '最新添加' },
  { value: 'popular', label: '最多收藏' }
];

export default function DashboardPage() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const searchParams = useSearchParams();
  const category = searchParams.get('category');

  // 获取工具列表
  useEffect(() => {
    const fetchTools = async () => {
      try {
        setIsLoading(true);
        const url = new URL('/api/tools', window.location.origin);
        if (category) {
          url.searchParams.set('category', category);
        }
        
        const res = await fetch(url);
        if (!res.ok) throw new Error('获取工具列表失败');
        
        const data = await res.json();
        setTools(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '获取工具列表失败');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTools();
  }, [category]);

  // 处理工具删除
  const handleDelete = async (toolId: string) => {
    if (!window.confirm('确定要删除这个工具吗？')) {
      return;
    }

    try {
      const res = await fetch(`/api/tools/${toolId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('删除工具失败');

      setTools(tools.filter(tool => tool._id !== toolId));
    } catch (err) {
      alert(err instanceof Error ? err.message : '删除工具失败');
    }
  };

  // 过滤和排序工具
  const filteredAndSortedTools = tools
    .filter(tool => 
      tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'popular') {
        return (b.favoritesCount || 0) - (a.favoritesCount || 0);
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 顶部标题和按钮 */}
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">我的工具箱</h1>
          <Link
            href="/dashboard/tools/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg
              className="-ml-1 mr-2 h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            新建工具
          </Link>
        </div>

        {/* 工具列表区域 */}
        <div>
          {/* 搜索和排序 */}
          <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div className="flex-1 w-full sm:w-auto sm:max-w-xs">
              <input
                type="text"
                placeholder="搜索工具..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex space-x-4 w-full sm:w-auto">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="block w-full sm:w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 工具列表内容 */}
          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse bg-white rounded-lg shadow-sm p-6 h-48"
                >
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-red-600">
                {error}
              </h3>
            </div>
          ) : filteredAndSortedTools.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900">
                {searchQuery ? '没有找到匹配的工具' : '暂无工具'}
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                {searchQuery ? '试试其他关键词' : '点击右上角的"添加工具"按钮开始添加吧'}
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {filteredAndSortedTools.map((tool) => (
                <ToolCard
                  key={tool._id}
                  tool={tool}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}