import { GetServerSideProps } from 'next';
import Layout from '@/components/layout/Layout';
import ArticleList from '@/components/article/ArticleList';
import { articlesApi, categoriesApi } from '@/lib/directus';
import { Article, Category, PaginatedResponse } from '@/types/directus';

interface HomeProps {
  articles: Article[];
  featuredArticles: Article[];
  categories: Category[];
  currentPage: number;
  totalPages: number;
}

export default function Home({
  articles,
  featuredArticles,
  categories,
  currentPage,
  totalPages,
}: HomeProps) {
  return (
    <Layout>
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">
            {process.env.NEXT_PUBLIC_SITE_NAME || 'Directus Blog'}
          </h1>
          <p className="text-xl mb-8">
            {process.env.NEXT_PUBLIC_SITE_DESCRIPTION || 'Directusで作成された記事ブログ'}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* 注目の記事 */}
        {featuredArticles.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">注目の記事</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {featuredArticles.map((article) => (
                <ArticleCard key={article.id} article={article} featured />
              ))}
            </div>
          </section>
        )}

        {/* カテゴリー一覧 */}
        {categories.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">カテゴリー</h2>
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/category/${category.slug}`}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full transition"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 最新記事一覧 */}
        <ArticleList
          articles={articles}
          title="最新記事"
          currentPage={currentPage}
          totalPages={totalPages}
        />
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const page = query.page ? parseInt(query.page as string) : 1;
  const limit = 9;

  try {
    // 最新の記事一覧を取得
    const articlesResponse = await articlesApi.getArticles({
      page,
      limit,
      filter: { status: { _eq: 'published' } },
    });

    // 注目記事を取得（例: 最新3件）
    const featuredArticlesResponse = await articlesApi.getArticles({
      limit: 2,
      filter: { status: { _eq: 'published' } },
      // 注目記事の条件を追加（例: featured_article: { _eq: true } など）
    });

    // カテゴリー一覧を取得
    const categories = await categoriesApi.getCategories();

    // ページネーション情報を計算
    const totalPages = Math.ceil((articlesResponse.meta?.total_count || 0) / limit);

    return {
      props: {
        articles: articlesResponse.data || [],
        featuredArticles: featuredArticlesResponse.data || [],
        categories,
        currentPage: page,
        totalPages,
      },
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    return {
      props: {
        articles: [],
        featuredArticles: [],
        categories: [],
        currentPage: 1,
        totalPages: 1,
      },
    };
  }
};