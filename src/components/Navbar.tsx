'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo和导航链接 */}
          <div className="flex items-center">
            <Link href="/" className="text-gray-800 font-bold text-xl">
              MyToolNest
            </Link>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link
                  href="/"
                  className="text-gray-500 hover:bg-gray-100 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  首页
                </Link>
                <Link
                  href={session ? "/dashboard" : "/login"}
                  className="text-gray-500 hover:bg-gray-100 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  工具库
                </Link>
              </div>
            </div>
          </div>

          {/* 用户菜单 */}
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              {session ? (
                <div className="flex items-center">
                  {session.user?.image && (
                    <Image
                      src={session.user.image}
                      alt={session.user.name || '用户头像'}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  )}
                  <span className="ml-2 text-gray-500">{session.user?.name}</span>
                  <button
                    onClick={() => signOut()}
                    className="ml-4 text-gray-500 hover:bg-gray-100 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    退出
                  </button>
                </div>
              ) : (
                <div className="flex space-x-4">
                  <Link
                    href="/login"
                    className="text-gray-500 hover:bg-gray-100 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    登录
                  </Link>
                  <Link
                    href="/register"
                    className="text-gray-500 hover:bg-gray-100 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    注册
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* 移动端菜单按钮 */}
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
            >
              <span className="sr-only">打开主菜单</span>
              {!isOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 移动端菜单 */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              href="/"
              className="text-gray-500 hover:bg-gray-100 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
            >
              首页
            </Link>
            <Link
              href="/dashboard"
              className="text-gray-500 hover:bg-gray-100 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
            >
              工具库
            </Link>
          </div>
          {/* 移动端用户菜单 */}
          <div className="pt-4 pb-3 border-t border-gray-100">
            {session ? (
              <div className="px-2 space-y-1">
                {/* 用户信息 */}
                <div className="flex items-center px-5">
                  {session.user?.image && (
                    <Image
                      src={session.user.image}
                      alt={session.user.name || '用户头像'}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  )}
                  <div className="ml-3">
                    <div className="text-base font-medium leading-none text-gray-500">
                      {session.user?.name}
                    </div>
                    <div className="text-sm font-medium leading-none text-gray-400">
                      {session.user?.email}
                    </div>
                  </div>
                </div>
                {/* 退出按钮 */}
                <button
                  onClick={() => signOut()}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                >
                  退出
                </button>
              </div>
            ) : (
              <div className="px-2 space-y-1">
                <Link
                  href="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                >
                  登录
                </Link>
                <Link
                  href="/register"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                >
                  注册
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}