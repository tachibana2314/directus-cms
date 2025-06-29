import React from 'react';
import ArticleCard from './ArticleCard';
import { Article } from '@/types/directus';
import Pagination from '../ui/Pagination';

interface ArticleListProps {
  articles: Article[];
  title?: string;
  currentPage?: number;
  totalPages?: number;
  baseUrl?: string;
}

const ArticleList: React.FC<ArticleListProps> = ({
  articles,
  title,
  currentPage,
  totalPages,
  baseUrl = '',
}) => {
  if (articles.length === 0) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold text-gray-800">{title || '記事一覧'}</h2>
        <p className="text-gray-500 mt-4">記事がありません</p>
      </div>
    );
  }

  return (
    <div className="py-8">
      {title && (
        <h2 className="text-2xl font-bold text-gray-800 mb-6">{title}</h2>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
      
      {currentPage && totalPages && totalPages > 1 && (
        <div className="mt-12">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            baseUrl={baseUrl}
          />
        </div>
      )}
    </div>
  );
};

export default ArticleList;