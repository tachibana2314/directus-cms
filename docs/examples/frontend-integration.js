/**
 * DirectusのREST APIを使用したフロントエンドのサンプル実装
 * このファイルはNext.jsやNuxt.jsなどのフレームワークで使用できる基本的なAPI接続の例を示します。
 */

// Directus APIへの接続設定
const DIRECTUS_URL = 'http://localhost:8055';
const API_TOKEN = 'YOUR_API_TOKEN'; // 実際の環境では環境変数から取得することを推奨

// 認証トークンを取得する関数
async function getAuthToken(email, password) {
  try {
    const response = await fetch(`${DIRECTUS_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.errors?.[0]?.message || 'Authentication failed');
    }

    return data.data.access_token;
  } catch (error) {
    console.error('Authentication error:', error);
    throw error;
  }
}

// 記事一覧を取得する関数
async function getArticles(options = {}) {
  const {
    page = 1,
    limit = 10,
    sort = '-publish_date',
    filter = { status: { _eq: 'published' } },
    fields = ['id', 'title', 'slug', 'content', 'publish_date', 'category_id.*'],
  } = options;

  try {
    const queryParams = new URLSearchParams({
      page,
      limit,
      sort,
      fields: fields.join(','),
      filter: JSON.stringify(filter),
    });

    const response = await fetch(`${DIRECTUS_URL}/items/articles?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.errors?.[0]?.message || 'Failed to fetch articles');
    }

    return data.data;
  } catch (error) {
    console.error('Error fetching articles:', error);
    throw error;
  }
}

// 特定の記事を取得する関数
async function getArticleBySlug(slug) {
  try {
    const response = await fetch(`${DIRECTUS_URL}/items/articles?filter[slug][_eq]=${slug}&fields=*,category_id.*`, {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.errors?.[0]?.message || 'Failed to fetch article');
    }

    return data.data[0];
  } catch (error) {
    console.error(`Error fetching article with slug ${slug}:`, error);
    throw error;
  }
}

// カテゴリー一覧を取得する関数
async function getCategories() {
  try {
    const response = await fetch(`${DIRECTUS_URL}/items/categories?fields=id,name,slug`, {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.errors?.[0]?.message || 'Failed to fetch categories');
    }

    return data.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
}

// 使用例
async function exampleUsage() {
  // 認証（管理画面ではなくAPIのみアクセスする場合）
  // const token = await getAuthToken('admin@example.com', 'admin_password');
  // console.log('Authentication successful, token:', token);
  
  try {
    // 記事一覧を取得
    const articles = await getArticles({
      limit: 5,
      filter: { status: { _eq: 'published' } },
    });
    console.log('Latest 5 published articles:', articles);
    
    // 特定のカテゴリーの記事を取得
    const techArticles = await getArticles({
      filter: { 
        status: { _eq: 'published' },
        category_id: { slug: { _eq: 'technology' } }
      },
    });
    console.log('Technology articles:', techArticles);
    
    // 特定の記事を取得
    if (articles.length > 0) {
      const articleSlug = articles[0].slug;
      const article = await getArticleBySlug(articleSlug);
      console.log('Article details:', article);
    }
    
    // カテゴリー一覧を取得
    const categories = await getCategories();
    console.log('Categories:', categories);
    
  } catch (error) {
    console.error('Error in example usage:', error);
  }
}

// 実行する場合はコメントを解除
// exampleUsage();

// モジュールとしてエクスポート
export {
  getAuthToken,
  getArticles,
  getArticleBySlug,
  getCategories,
};