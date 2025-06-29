import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import ArticleList from '@/components/article/ArticleList';
import { articlesApi, categoriesApi } from '@/lib/directus';
import { Article, Category } from '@/types/directus';

interface CategoryPageProps {
  category: Category;
  articles: Article[];
  currentPage: number;
  totalPages: number;
}

export default function CategoryPage({
  category,
  articles,
  currentPage,
  totalPages,
}: CategoryPageProps) {
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

  return (
    <Layout
      title={`${category.name}の記事一覧`}
      description={category.description || `${category.name}に関する記事一覧です。`}
    >
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-3">{category.name}</h1>
          {category.description && <p className="text-lg">{category.description}</p>}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <ArticleList
          articles={articles}
          title={`${category.name}の記事`}
          currentPage={currentPage}
          totalPages={totalPages}
          baseUrl={`/category/${category.slug}`}
        />
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params, query }) => {
  if (!params?.slug) {
    return {
      notFound: true,
    };
  }

  const slug = params.slug as string;
  const page = query.page ? parseInt(query.page as string) : 1;
  const limit = 9;

  try {
    // カテゴリを取得
    const category = await categoriesApi.getCategory(slug);

    if (!category) {
      return {
        notFound: true,
      };
    }

    // カテゴリに属する記事を取得
    const articlesResponse = await articlesApi.getArticlesByCategory(slug, {
      page,
      limit,
    });

    // ページネーション情報を計算
    const totalPages = Math.ceil((articlesResponse.meta?.total_count || 0) / limit);

    return {
      props: {
        category,
        articles: articlesResponse.data || [],
        currentPage: page,
        totalPages,
      },
    };
  } catch (error) {
    console.error('Error fetching category:', error);
    return {
      notFound: true,
    };
  }
};