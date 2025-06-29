import axios from 'axios';

// DirectusのAPIクライアント設定
const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055';
const directusToken = process.env.DIRECTUS_TOKEN;

// Axiosインスタンスの作成
const directusClient = axios.create({
  baseURL: directusUrl,
});

// 認証トークンがある場合はヘッダーに設定
if (directusToken) {
  directusClient.defaults.headers.common['Authorization'] = `Bearer ${directusToken}`;
}

// 記事に関するAPI関数
export const articlesApi = {
  // 記事一覧を取得
  async getArticles(options: {
    page?: number;
    limit?: number;
    sort?: string;
    filter?: any;
    fields?: string[];
  } = {}) {
    const {
      page = 1,
      limit = 10,
      sort = '-publish_date',
      filter = { status: { _eq: 'published' } },
      fields = ['*', 'category_id.*'],
    } = options;

    try {
      const response = await directusClient.get('/items/articles', {
        params: {
          page,
          limit,
          sort,
          fields: fields.join(','),
          filter: JSON.stringify(filter),
        },
      });
      
      return {
        data: response.data.data,
        meta: response.data.meta,
      };
    } catch (error) {
      console.error('Error fetching articles:', error);
      throw error;
    }
  },

  // 特定の記事を取得
  async getArticle(slug: string) {
    try {
      const response = await directusClient.get('/items/articles', {
        params: {
          filter: JSON.stringify({ slug: { _eq: slug } }),
          fields: ['*', 'category_id.*'],
          limit: 1,
        },
      });
      
      if (!response.data.data || response.data.data.length === 0) {
        throw new Error('Article not found');
      }
      
      return response.data.data[0];
    } catch (error) {
      console.error(`Error fetching article with slug ${slug}:`, error);
      throw error;
    }
  },
  
  // 関連記事を取得
  async getRelatedArticles(categoryId: string, articleId: string, limit: number = 3) {
    try {
      const response = await directusClient.get('/items/articles', {
        params: {
          filter: JSON.stringify({
            _and: [
              { status: { _eq: 'published' } },
              { category_id: { _eq: categoryId } },
              { id: { _neq: articleId } },
            ],
          }),
          fields: ['id', 'title', 'slug', 'publish_date', 'category_id.*'],
          limit,
        },
      });
      
      return response.data.data;
    } catch (error) {
      console.error('Error fetching related articles:', error);
      throw error;
    }
  },
  
  // カテゴリ別の記事を取得
  async getArticlesByCategory(categorySlug: string, options: {
    page?: number;
    limit?: number;
  } = {}) {
    const { page = 1, limit = 10 } = options;
    
    try {
      // まずカテゴリを取得
      const categoryResponse = await directusClient.get('/items/categories', {
        params: {
          filter: JSON.stringify({ slug: { _eq: categorySlug } }),
          limit: 1,
        },
      });
      
      if (!categoryResponse.data.data || categoryResponse.data.data.length === 0) {
        throw new Error('Category not found');
      }
      
      const categoryId = categoryResponse.data.data[0].id;
      
      // カテゴリに属する記事を取得
      return this.getArticles({
        page,
        limit,
        filter: {
          _and: [
            { status: { _eq: 'published' } },
            { category_id: { _eq: categoryId } },
          ],
        },
      });
    } catch (error) {
      console.error(`Error fetching articles for category ${categorySlug}:`, error);
      throw error;
    }
  },
};

// カテゴリに関するAPI関数
export const categoriesApi = {
  // カテゴリ一覧を取得
  async getCategories() {
    try {
      const response = await directusClient.get('/items/categories', {
        params: {
          fields: ['id', 'name', 'slug', 'description'],
          sort: 'name',
        },
      });
      
      return response.data.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },
  
  // 特定のカテゴリを取得
  async getCategory(slug: string) {
    try {
      const response = await directusClient.get('/items/categories', {
        params: {
          filter: JSON.stringify({ slug: { _eq: slug } }),
          fields: ['id', 'name', 'slug', 'description'],
          limit: 1,
        },
      });
      
      if (!response.data.data || response.data.data.length === 0) {
        throw new Error('Category not found');
      }
      
      return response.data.data[0];
    } catch (error) {
      console.error(`Error fetching category with slug ${slug}:`, error);
      throw error;
    }
  },
};

// タグに関するAPI関数
export const tagsApi = {
  // タグ一覧を取得
  async getTags() {
    try {
      const response = await directusClient.get('/items/tags', {
        params: {
          fields: ['id', 'name', 'slug'],
          sort: 'name',
        },
      });
      
      return response.data.data;
    } catch (error) {
      console.error('Error fetching tags:', error);
      throw error;
    }
  },
  
  // 特定のタグを取得
  async getTag(slug: string) {
    try {
      const response = await directusClient.get('/items/tags', {
        params: {
          filter: JSON.stringify({ slug: { _eq: slug } }),
          fields: ['id', 'name', 'slug'],
          limit: 1,
        },
      });
      
      if (!response.data.data || response.data.data.length === 0) {
        throw new Error('Tag not found');
      }
      
      return response.data.data[0];
    } catch (error) {
      console.error(`Error fetching tag with slug ${slug}:`, error);
      throw error;
    }
  },
  
  // タグ別の記事を取得
  async getArticlesByTag(tagSlug: string, options: {
    page?: number;
    limit?: number;
  } = {}) {
    const { page = 1, limit = 10 } = options;
    
    try {
      // まずタグを取得
      const tagResponse = await directusClient.get('/items/tags', {
        params: {
          filter: JSON.stringify({ slug: { _eq: tagSlug } }),
          limit: 1,
        },
      });
      
      if (!tagResponse.data.data || tagResponse.data.data.length === 0) {
        throw new Error('Tag not found');
      }
      
      const tagId = tagResponse.data.data[0].id;
      
      // タグに関連する記事を取得（中間テーブル経由）
      const response = await directusClient.get('/items/articles', {
        params: {
          filter: JSON.stringify({
            _and: [
              { status: { _eq: 'published' } },
              { 
                tags: {
                  tag_id: {
                    _eq: tagId
                  }
                }
              }
            ],
          }),
          fields: ['*', 'category_id.*'],
          limit,
          page,
        },
      });
      
      return {
        data: response.data.data,
        meta: response.data.meta,
      };
    } catch (error) {
      console.error(`Error fetching articles for tag ${tagSlug}:`, error);
      throw error;
    }
  },
};

// ユーティリティ関数
export const directusUtils = {
  // 画像URLを生成
  getImageUrl(id: string, options: {
    width?: number;
    height?: number;
    fit?: 'cover' | 'contain' | 'inside' | 'outside';
    quality?: number;
  } = {}) {
    if (!id) return '';
    
    const { width, height, fit = 'cover', quality = 80 } = options;
    const baseUrl = `${directusUrl}/assets/${id}`;
    
    const params = new URLSearchParams();
    if (width) params.append('width', width.toString());
    if (height) params.append('height', height.toString());
    if (fit) params.append('fit', fit);
    if (quality) params.append('quality', quality.toString());
    
    const queryString = params.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  },
};