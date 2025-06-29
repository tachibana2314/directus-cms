const fs = require('fs');
const path = require('path');
const axios = require('axios');

// 設定
const API_URL = 'http://localhost:8055';
const EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const PASSWORD = process.env.ADMIN_PASSWORD || 'admin_password';

// APIクライアント
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// ログイン関数
async function login() {
  try {
    const response = await api.post('/auth/login', {
      email: EMAIL,
      password: PASSWORD
    });
    
    // トークンをヘッダーに設定
    api.defaults.headers.common['Authorization'] = `Bearer ${response.data.data.access_token}`;
    console.log('ログインに成功しました');
    return response.data.data.access_token;
  } catch (error) {
    console.error('ログインに失敗しました:', error.response?.data || error.message);
    process.exit(1);
  }
}

// カテゴリのインポート
async function importCategories() {
  try {
    const categoriesData = JSON.parse(fs.readFileSync(path.join(__dirname, 'demo-data/categories.json'), 'utf8'));
    
    console.log('カテゴリのインポートを開始...');
    
    for (const category of categoriesData) {
      try {
        const response = await api.post('/items/categories', category);
        console.log(`カテゴリを作成しました: ${category.name}`);
      } catch (error) {
        console.error(`カテゴリ作成エラー (${category.name}):`, error.response?.data || error.message);
      }
    }
    
    console.log('カテゴリのインポートが完了しました');
  } catch (error) {
    console.error('カテゴリのインポートに失敗しました:', error.message);
  }
}

// タグのインポート
async function importTags() {
  try {
    const tagsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'demo-data/tags.json'), 'utf8'));
    
    console.log('タグのインポートを開始...');
    
    for (const tag of tagsData) {
      try {
        const response = await api.post('/items/tags', tag);
        console.log(`タグを作成しました: ${tag.name}`);
      } catch (error) {
        console.error(`タグ作成エラー (${tag.name}):`, error.response?.data || error.message);
      }
    }
    
    console.log('タグのインポートが完了しました');
  } catch (error) {
    console.error('タグのインポートに失敗しました:', error.message);
  }
}

// 記事のインポート
async function importArticles() {
  try {
    const articlesData = JSON.parse(fs.readFileSync(path.join(__dirname, 'demo-data/articles.json'), 'utf8'));
    
    console.log('記事のインポートを開始...');
    
    // カテゴリとタグの取得
    const categoriesResponse = await api.get('/items/categories');
    const categories = categoriesResponse.data.data;
    
    const tagsResponse = await api.get('/items/tags');
    const tags = tagsResponse.data.data;
    
    for (const article of articlesData) {
      try {
        // カテゴリIDの解決
        const category = categories.find(c => c.name === article.category);
        const categoryId = category ? category.id : null;
        
        // タグIDの解決
        const articleTags = [];
        if (article.tags && Array.isArray(article.tags)) {
          for (const tagName of article.tags) {
            const tag = tags.find(t => t.name === tagName);
            if (tag) {
              articleTags.push(tag.id);
            }
          }
        }
        
        // 記事データの準備
        const articleData = {
          title: article.title,
          slug: article.slug,
          content: article.content,
          status: article.status,
          category_id: categoryId,
          seo_title: article.seo_title,
          seo_description: article.seo_description,
          seo_keywords: article.seo_keywords
        };
        
        // 記事の作成
        const response = await api.post('/items/articles', articleData);
        console.log(`記事を作成しました: ${article.title}`);
        
        // タグの関連付け（多対多の関係を処理するために、記事とタグの中間テーブルへのデータ挿入が必要）
        if (articleTags.length > 0) {
          for (const tagId of articleTags) {
            await api.post('/items/article_tags', {
              article_id: response.data.data.id,
              tag_id: tagId
            });
          }
          console.log(`記事にタグを設定しました: ${article.title}`);
        }
      } catch (error) {
        console.error(`記事作成エラー (${article.title}):`, error.response?.data || error.message);
      }
    }
    
    console.log('記事のインポートが完了しました');
  } catch (error) {
    console.error('記事のインポートに失敗しました:', error.message);
  }
}

// メイン実行関数
async function main() {
  try {
    await login();
    await importCategories();
    await importTags();
    await importArticles();
    console.log('データのインポートが完了しました！');
  } catch (error) {
    console.error('データインポート中にエラーが発生しました:', error.message);
  }
}

// スクリプト実行
main();