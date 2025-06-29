// DirectusのAPIレスポンスに対応する型定義

// 共通のメタデータ型
export interface DirectusMeta {
  filter_count?: number;
  total_count?: number;
  page?: number;
  page_count?: number;
  per_page?: number;
}

// 記事の型
export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  status: 'draft' | 'under_review' | 'published' | 'archived';
  publish_date: string | null;
  category_id: Category | string | null;
  featured_image: string | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string[] | null;
  user_created: string | User;
  date_created: string;
  user_updated: string | User | null;
  date_updated: string | null;
  tags?: ArticleTag[];
}

// カテゴリの型
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

// タグの型
export interface Tag {
  id: string;
  name: string;
  slug: string;
}

// 記事とタグの関連付けの型（中間テーブル）
export interface ArticleTag {
  id: string;
  article_id: string | Article;
  tag_id: string | Tag;
}

// ユーザーの型
export interface User {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  role: string;
}

// ページネーションのレスポンス型
export interface PaginatedResponse<T> {
  data: T[];
  meta: DirectusMeta;
}