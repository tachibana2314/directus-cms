import React from 'react';
import Link from 'next/link';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  baseUrl,
}) => {
  // 表示するページ番号の範囲を計算
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5; // 最大表示ページ数
    
    // 常に最初のページを表示
    pages.push(1);
    
    if (totalPages <= maxVisiblePages) {
      // ページ数が少ない場合は全て表示
      for (let i = 2; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // ページ数が多い場合は省略形で表示
      if (currentPage <= 3) {
        // 現在のページが先頭付近
        pages.push(2, 3, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        // 現在のページが末尾付近
        pages.push('...', totalPages - 2, totalPages - 1, totalPages);
      } else {
        // 現在のページが中央付近
        pages.push('...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    
    return pages;
  };
  
  // URLを生成
  const getPageUrl = (page: number) => {
    if (page === 1) {
      return baseUrl || '/';
    }
    
    return `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}page=${page}`;
  };
  
  const pageNumbers = getPageNumbers();
  
  return (
    <nav className="flex justify-center">
      <ul className="flex items-center space-x-2">
        {/* 前のページへ */}
        {currentPage > 1 && (
          <li>
            <Link 
              href={getPageUrl(currentPage - 1)}
              className="px-3 py-1 rounded border border-gray-300 text-gray-700 hover:bg-gray-100"
              aria-label="前のページへ"
            >
              &laquo;
            </Link>
          </li>
        )}
        
        {/* ページ番号 */}
        {pageNumbers.map((page, index) => {
          // 省略記号の場合
          if (page === '...') {
            return (
              <li key={`ellipsis-${index}`} className="px-3 py-1 text-gray-500">
                &hellip;
              </li>
            );
          }
          
          // ページ番号の場合
          const pageNum = page as number;
          const isCurrentPage = pageNum === currentPage;
          
          return (
            <li key={pageNum}>
              {isCurrentPage ? (
                <span className="px-3 py-1 rounded bg-blue-600 text-white">
                  {pageNum}
                </span>
              ) : (
                <Link 
                  href={getPageUrl(pageNum)}
                  className="px-3 py-1 rounded border border-gray-300 text-gray-700 hover:bg-gray-100"
                >
                  {pageNum}
                </Link>
              )}
            </li>
          );
        })}
        
        {/* 次のページへ */}
        {currentPage < totalPages && (
          <li>
            <Link 
              href={getPageUrl(currentPage + 1)}
              className="px-3 py-1 rounded border border-gray-300 text-gray-700 hover:bg-gray-100"
              aria-label="次のページへ"
            >
              &raquo;
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Pagination;