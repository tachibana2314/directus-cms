import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import parse from 'html-react-parser';
import Layout from '@/components/layout/Layout';
import ArticleList from '@/components/article/ArticleList';
import { articlesApi, directusUtils } from '@/lib/directus';
import { Article } from '@/types/directus';

interface ArticlePageProps {
  article: Article;
  relatedArticles: Article[];
}

export default function ArticlePage({ article, relatedArticles }: ArticlePageProps) {
  const router = useRouter();

  // フォールバックページの表示
  if (router.isFallback) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // 記事が見つからない場合
  if (!article) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">記事が見つかりません</h1>
            <p className="text-gray-600 mb-8">お探しの記事は削除されたか、移動された可能性があります。</p>
            <Link href="/" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
              トップページに戻る
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  // カテゴリ情報を取得
  const category = typeof article.category_id === 'object' ? article.category_id : null;

  // 公開日をフォーマット
  const formattedDate = article.publish_date
    ? format(new Date(article.publish_date), 'yyyy年MM月dd日', { locale: ja })
    : null;

  // アイキャッチ画像のURLを生成
  const imageUrl = article.featured_image
    ? directusUtils.getImageUrl(article.featured_image, { width: 1200 })
    : '/images/placeholder.jpg';

  return (
    <Layout
      title={article.seo_title || article.title}
      description={article.seo_description || ''}
      keywords={article.seo_keywords || []}
      ogImage={imageUrl}
    >
      <article className="container mx-auto px-4 py-8">
        {/* 記事ヘッダー */}
        <header className="mb-8">
          {/* カテゴリ */}
          {category && (
            <Link href={`/category/${category.slug}`}>
              <span className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full mb-4">
                {category.name}
              </span>
            </Link>
          )}

          {/* タイトル */}
          <h1 className="text-4xl font-bold text-gray-800 mb-4">{article.title}</h1>

          {/* メタ情報 */}
          <div className="flex items-center text-gray-600 text-sm mb-6">
            {formattedDate && <time dateTime={article.publish_date || ''}>{formattedDate}</time>}
          </div>

          {/* アイキャッチ画像 */}
          {article.featured_image && (
            <div className="relative h-96 mb-8">
              <Image
                src={imageUrl}
                alt={article.title}
                fill
                sizes="(max-width: 768px) 100vw, 1200px"
                priority
                className="object-cover rounded"
              />
            </div>
          )}
        </header>

        {/* 記事本文 */}
        <div className="prose prose-lg max-w-none">
          {parse(article.content)}
        </div>

        {/* 関連記事 */}
        {relatedArticles.length > 0 && (
          <div className="mt-16 pt-8 border-t border-gray-200">
            <ArticleList articles={relatedArticles} title="関連記事" />
          </div>
        )}
      </article>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  if (!params?.slug) {
    return {
      notFound: true,
    };
  }

  const slug = params.slug as string;

  try {
    // 記事を取得
    const article = await articlesApi.getArticle(slug);

    // 記事が公開されていない場合は404を返す
    if (!article || article.status !== 'published') {
      return {
        notFound: true,
      };
    }

    // 関連記事を取得（同じカテゴリの記事）
    let relatedArticles: Article[] = [];
    if (article.category_id && typeof article.category_id === 'object') {
      const categoryId = article.category_id.id;
      relatedArticles = await articlesApi.getRelatedArticles(categoryId, article.id);
    }

    return {
      props: {
        article,
        relatedArticles,
      },
    };
  } catch (error) {
    console.error('Error fetching article:', error);
    return {
      notFound: true,
    };
  }
};