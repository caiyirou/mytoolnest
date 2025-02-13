'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

// 工具分类选项
const categories = [
  'AI工具',
  '效率工具',
  '设计工具',
  '开发工具',
  '协作工具',
  '其他'
];

interface Tool {
  _id: string;
  title: string;
  description: string;
  url: string;
  category: string;
  creator: string;
}

export default function EditToolPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [tool, setTool] = useState<Tool | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  // 获取工具数据
  useEffect(() => {
    const fetchTool = async () => {
      try {
        const res = await fetch(`/api/tools/${params.id}`);
        if (!res.ok) {
          throw new Error('获取工具信息失败');
        }
        const data = await res.json();
        setTool(data);
        
        // 检查权限
        if (session?.user?.id !== data.creator) {
          router.push('/tools');
          return;
        }
      } catch (error) {
        setError('加载工具信息时出错');
      } finally {
        setIsLoading(false);
      }
    };

    if (session) {
      fetchTool();
    }
  }, [params.id, session, router]);

  // 如果未登录，重定向到登录页
  if (!session) {
    router.push('/login');
    return null;
  }

  // 如果正在加载，显示加载状态
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">
              加载中...
            </h2>
          </div>
        </div>
      </div>
    );
  }

  // 如果没有找到工具或发生错误
  if (!tool || error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600">
              {error || '工具不存在'}
            </h2>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const toolData = {
      title: formData.get('title'),
      description: formData.get('description'),
      url: formData.get('url'),
      category: formData.get('category')
    };

    try {
      const res = await fetch(`/api/tools/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(toolData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || '更新工具失败');
      }

      router.push('/tools');
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : '更新工具时出错');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow px-6 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              编辑工具
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              更新工具信息
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                工具名称
              </label>
              <input
                type="text"
                name="title"
                id="title"
                required
                maxLength={100}
                defaultValue={tool.title}
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                工具描述
              </label>
              <textarea
                name="description"
                id="description"
                required
                maxLength={500}
                rows={4}
                defaultValue={tool.description}
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700">
                工具链接
              </label>
              <input
                type="url"
                name="url"
                id="url"
                required
                defaultValue={tool.url}
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                分类
              </label>
              <select
                name="category"
                id="category"
                required
                defaultValue={tool.category}
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              >
                <option value="">选择分类</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <div className="text-red-600 text-sm">
                {error}
              </div>
            )}

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isSaving ? '保存中...' : '保存'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}