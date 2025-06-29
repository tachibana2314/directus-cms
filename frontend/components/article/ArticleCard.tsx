import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Article } from '@/types/directus';
import { directusUtils } from '@/lib/directus';

interface ArticleCardProps {
  article: Article;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article }) => {
  // カテゴリ情報を取得
  const category = typeof article.category_id === 'object' ? article.category_id : null;
  
  // 公開日をフォーマット
  const formattedDate = article.publish_date
    ? format(new Date(article.publish_date), 'yyyy年MM月dd日', { locale: ja })
    : null;
  
  // 記事へのリンクURLを生成
  const articleUrl = `/article/${article.slug}`;
  
  // アイキャッチ画像のURLを生成
  const imageUrl = article.featured_image
    ? directusUtils.getImageUrl(article.featured_image, { width: 400, height: 225 })
    : '/images/placeholder.jpg';
  
  // 記事概要（プレビュー）を生成
  const getPreview = () => {
    // HTMLタグを除去
    const stripHtml = (html: string) => html.replace(/<[^>]*>?/gm, '');
    const plainText = stripHtml(article.content);
    // 120文字程度の概要を返す
    return plainText.length > 120 ? plainText.substring(0, 120) + '...' : plainText;
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <Link href={articleUrl} className="block">
        <div className="relative h-48">
          <Image
            src={imageUrl}
            alt={article.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
          />
        </div>
      </Link>
      
      <div className="p-4">
        {category && (
          <Link href={`/category/${category.slug}`}>
            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mb-2">
              {category.name}
            </span>
          </Link>
        )}
        
        <Link href={articleUrl}>
          <h2 className="text-xl font-semibold text-gray-800 mb-2 hover:text-blue-600">{article.title}</h2>
        </Link>
        
        <p className="text-gray-600 text-sm mb-4">{getPreview()}</p>
        
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div>
            {formattedDate}
          </div>
          
          <Link href={articleUrl} className="text-blue-600 hover:underline">
            続きを読む &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ArticleCard;