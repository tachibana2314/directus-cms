import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { categoriesApi } from '@/lib/directus';
import { Category } from '@/types/directus';

const Header: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await categoriesApi.getCategories();
        setCategories(data);
      } catch (error) {
        console.error('Failed to load categories:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // メニューを閉じる
  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // ルート変更時にメニューを閉じる
  useEffect(() => {
    const handleRouteChange = () => {
      closeMenu();
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router]);

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-gray-800">
          {process.env.NEXT_PUBLIC_SITE_NAME || 'Directus Blog'}
        </Link>

        {/* ハンバーガーメニュー（モバイル用） */}
        <div className="md:hidden">
          <button
            onClick={toggleMenu}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* デスクトップ用ナビゲーション */}
        <nav className="hidden md:block">
          <ul className="flex space-x-8">
            <li>
              <Link 
                href="/" 
                className={`text-gray-600 hover:text-blue-600 ${
                  router.pathname === '/' ? 'text-blue-600 font-semibold' : ''
                }`}
              >
                ホーム
              </Link>
            </li>
            {!isLoading &&
              categories.slice(0, 4).map((category) => (
                <li key={category.id}>
                  <Link
                    href={`/category/${category.slug}`}
                    className={`text-gray-600 hover:text-blue-600 ${
                      router.asPath === `/category/${category.slug}` ? 'text-blue-600 font-semibold' : ''
                    }`}
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            <li>
              <Link 
                href="/about" 
                className={`text-gray-600 hover:text-blue-600 ${
                  router.pathname === '/about' ? 'text-blue-600 font-semibold' : ''
                }`}
              >
                About
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* モバイル用メニュー */}
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-lg py-4">
          <nav className="container mx-auto px-4">
            <ul className="space-y-4">
              <li>
                <Link 
                  href="/" 
                  className={`block text-gray-600 hover:text-blue-600 ${
                    router.pathname === '/' ? 'text-blue-600 font-semibold' : ''
                  }`}
                  onClick={closeMenu}
                >
                  ホーム
                </Link>
              </li>
              {!isLoading &&
                categories.map((category) => (
                  <li key={category.id}>
                    <Link
                      href={`/category/${category.slug}`}
                      className={`block text-gray-600 hover:text-blue-600 ${
                        router.asPath === `/category/${category.slug}` ? 'text-blue-600 font-semibold' : ''
                      }`}
                      onClick={closeMenu}
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
              <li>
                <Link 
                  href="/about" 
                  className={`block text-gray-600 hover:text-blue-600 ${
                    router.pathname === '/about' ? 'text-blue-600 font-semibold' : ''
                  }`}
                  onClick={closeMenu}
                >
                  About
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;