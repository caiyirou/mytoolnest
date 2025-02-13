'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import ToolCard from '@/components/ToolCard';
import { Tool } from '@/types/tool';

// ... 保持现有的 categories 和 sortOptions ...

const ITEMS_PER_PAGE = 9; // 每页显示的工具数量

export default function ToolsPage() {
  const { data: session } = useSession();
  const [tools, setTools] = useState<Tool[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTools = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/tools');
      if (!res.ok) throw new Error('获取工具列表失败');
      const data = await res.json();
      setTools(data);
    } catch (error) {
      console.error('获取工具列表时出错:', error);
      setError('获取工具列表失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个工具吗？')) {
      return;
    }

    try {
      const res = await fetch(`/api/tools/${id}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        throw new Error('删除失败');
      }

      setTools(tools.filter(tool => tool._id !== id));
    } catch (error) {
      console.error('删除工具时出错:', error);
      setError('删除工具失败');
    }
  };

  useEffect(() => {
    fetchTools();
  }, []);

  // 使用 useMemo 优化过滤和排序逻辑
  const filteredTools = useMemo(() => {
    let result = [...tools];
    
    // 搜索过滤
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(tool => 
        tool.title.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query)
      );
    }
    
    // 分类过滤
    if (selectedCategory !== '全部') {
      result = result.filter(tool => tool.category === selectedCategory);
    }
    
    // 排序
    if (sortBy === 'popular') {
      result.sort((a, b) => (b.favoritesCount || 0) - (a.favoritesCount || 0));
    } else {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    
    return result;
  }, [tools, searchQuery, selectedCategory, sortBy]);

  // 计算分页数据
  const paginatedTools = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTools.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredTools, currentPage]);

  // 计算总页数
  const totalPages = Math.ceil(filteredTools.length / ITEMS_PER_PAGE);

  // 当过滤条件改变时，重置页码
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, sortBy]);

  // 生成页码数组
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // 如果总页数小于等于最大可见页数，显示所有页码
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // 否则显示当前页附近的页码
      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      
      if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }
      
      if (startPage > 1) {
        pageNumbers.push(1);
        if (startPage > 2) pageNumbers.push('...');
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }
    
    return pageNumbers;
  };

  // 分页按钮组件
  const Pagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex justify-center items-center space-x-2 mt-8">
        <button
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          上一页
        </button>
        
        {getPageNumbers().map((pageNum, index) => (
          <button
            key={index}
            onClick={() => typeof pageNum === 'number' && setCurrentPage(pageNum)}
            disabled={pageNum === '...'}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              pageNum === currentPage
                ? 'bg-blue-600 text-white'
                : pageNum === '...'
                ? 'text-gray-700 cursor-default'
                : 'text-gray-700 hover:bg-gray-50 border border-gray-300'
            }`}
          >
            {pageNum}
          </button>
        ))}
        
        <button
          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          下一页
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* ... 保持现有的标题和搜索/筛选部分 ... */}

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center">
              <svg
                className="animate-spin h-5 w-5 text-blue-600 mr-2"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span className="text-lg font-medium text-gray-900">加载中...</span>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-red-600">
              {error}
            </h3>
          </div>
        ) : filteredTools.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900">
              {searchQuery.trim() 
                ? '没有找到匹配的工具' 
                : selectedCategory === '全部' 
                  ? '还没有工具' 
                  : '该分类下还没有工具'
              }
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              {searchQuery.trim() 
                ? '试试其他关键词' 
                : selectedCategory === '全部' 
                  ? '开始添加一些实用的工具吧。' 
                  : '换个分类看看吧。'
              }
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {paginatedTools.map((tool) => (
                <ToolCard
                  key={tool._id}
                  tool={tool}
                  onDelete={handleDelete}
                />
              ))}
            </div>
            <Pagination />
          </>
        )}
      </div>
    </div>
  );
}