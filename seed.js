const fs = require('fs');
const path = require('path');
const axios = require('axios');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

// 色の定義
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// 設定
const API_URL = 'http://localhost:8055';
const EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const PASSWORD = process.env.ADMIN_PASSWORD || 'admin_password';

// APIクライアント
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000 // タイムアウト10秒
});

// スキーマが存在するか確認する関数
async function checkSchemaExists() {
  try {
    console.log(`${colors.blue}スキーマの存在を確認しています...${colors.reset}`);
    
    // Collections APIを呼び出してスキーマが存在するか確認
    const response = await api.get('/collections');
    const collections = response.data.data || [];
    
    // 必要なコレクションがあるか確認
    const requiredCollections = ['articles', 'categories', 'tags', 'article_tags'];
    const existingCollections = collections.map(c => c.collection);
    
    const missingCollections = requiredCollections.filter(c => !existingCollections.includes(c));
    
    if (missingCollections.length > 0) {
      console.log(`${colors.yellow}以下のコレクションが見つかりません: ${missingCollections.join(', ')}${colors.reset}`);
      console.log(`${colors.yellow}スキーマを適用します...${colors.reset}`);
      
      try {
        // スキーマの適用を試みる
        await exec('docker-compose exec -T directus npx directus schema apply ./snapshots/schema.yaml --yes');
        console.log(`${colors.green}スキーマを適用しました${colors.reset}`);
        return true;
      } catch (error) {
        console.error(`${colors.red}スキーマの適用に失敗しました: ${error.message}${colors.reset}`);
        
        // スキーマ適用に失敗した場合、ユーザーに対応を促す
        console.log(`${colors.yellow}以下の手順を試してください:${colors.reset}`);
        console.log(`${colors.yellow}1. docker-compose exec directus npx directus schema apply ./snapshots/schema.yaml --yes${colors.reset}`);
        console.log(`${colors.yellow}2. その後再度 node seed.js を実行${colors.reset}`);
        
        return false;
      }
    }
    
    console.log(`${colors.green}必要なスキーマが既に存在します${colors.reset}`);
    return true;
  } catch (error) {
    // APIが応答しない場合
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      console.error(`${colors.red}Directus APIに接続できません。サービスが実行中か確認してください。${colors.reset}`);
      console.log(`${colors.yellow}docker-compose ps で状態を確認し、必要に応じて docker-compose up -d で再起動してください。${colors.reset}`);
    } else {
      console.error(`${colors.red}スキーマの確認中にエラーが発生しました:${colors.reset}`, error.message);
      console.log(`${colors.yellow}ログイン後に再試行します...${colors.reset}`);
    }
    return true; // とりあえずログイン処理を続行
  }
}

// ログイン関数
async function login() {
  try {
    console.log(`${colors.blue}Directus APIにログインしています...${colors.reset}`);
    
    const response = await api.post('/auth/login', {
      email: EMAIL,
      password: PASSWORD
    });
    
    // トークンをヘッダーに設定
    api.defaults.headers.common['Authorization'] = `Bearer ${response.data.data.access_token}`;
    console.log(`${colors.green}ログインに成功しました${colors.reset}`);
    return response.data.data.access_token;
  } catch (error) {
    console.error(`${colors.red}ログインに失敗しました:${colors.reset}`, error.response?.data?.errors?.[0]?.message || error.message);
    
    if (error.response?.status === 401) {
      console.log(`${colors.yellow}ログイン情報を確認してください:${colors.reset}`);
      console.log(`${colors.yellow}Email: ${EMAIL}${colors.reset}`);
      console.log(`${colors.yellow}Password: ${PASSWORD}${colors.reset}`);
    } else if (error.code === 'ECONNREFUSED') {
      console.log(`${colors.yellow}Directus APIサーバーが実行中か確認してください${colors.reset}`);
      console.log(`${colors.yellow}docker-compose ps${colors.reset}`);
      console.log(`${colors.yellow}docker-compose logs directus${colors.reset}`);
    }
    
    process.exit(1);
  }
}

// カテゴリのインポート
async function importCategories() {
  try {
    let categoriesData;
    try {
      categoriesData = JSON.parse(fs.readFileSync(path.join(__dirname, 'demo-data/categories.json'), 'utf8'));
    } catch (readError) {
      console.error(`${colors.red}カテゴリデータの読み込みに失敗しました:${colors.reset}`, readError.message);
      return;
    }
    
    console.log(`${colors.blue}カテゴリのインポートを開始...${colors.reset}`);
    
    // 既存のカテゴリをチェック
    const existingResponse = await api.get('/items/categories');
    const existingCategories = existingResponse.data.data || [];
    
    for (const category of categoriesData) {
      try {
        // 既に同名のカテゴリが存在するかチェック
        const exists = existingCategories.some(c => c.name === category.name || c.slug === category.slug);
        
        if (exists) {
          console.log(`${colors.yellow}カテゴリはすでに存在します: ${category.name}${colors.reset}`);
          continue;
        }
        
        const response = await api.post('/items/categories', category);
        console.log(`${colors.green}カテゴリを作成しました: ${category.name}${colors.reset}`);
      } catch (error) {
        console.error(`${colors.red}カテゴリ作成エラー (${category.name}):${colors.reset}`, error.response?.data?.errors?.[0]?.message || error.message);
      }
    }
    
    console.log(`${colors.green}カテゴリのインポートが完了しました${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}カテゴリのインポートに失敗しました:${colors.reset}`, error.message);
    if (error.response?.data?.errors) {
      console.error(`${colors.red}詳細エラー:${colors.reset}`, JSON.stringify(error.response.data.errors, null, 2));
    }
  }
}

// タグのインポート
async function importTags() {
  try {
    let tagsData;
    try {
      tagsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'demo-data/tags.json'), 'utf8'));
    } catch (readError) {
      console.error(`${colors.red}タグデータの読み込みに失敗しました:${colors.reset}`, readError.message);
      return;
    }
    
    console.log(`${colors.blue}タグのインポートを開始...${colors.reset}`);
    
    // 既存のタグをチェック
    const existingResponse = await api.get('/items/tags');
    const existingTags = existingResponse.data.data || [];
    
    for (const tag of tagsData) {
      try {
        // 既に同名のタグが存在するかチェック
        const exists = existingTags.some(t => t.name === tag.name || t.slug === tag.slug);
        
        if (exists) {
          console.log(`${colors.yellow}タグはすでに存在します: ${tag.name}${colors.reset}`);
          continue;
        }
        
        const response = await api.post('/items/tags', tag);
        console.log(`${colors.green}タグを作成しました: ${tag.name}${colors.reset}`);
      } catch (error) {
        console.error(`${colors.red}タグ作成エラー (${tag.name}):${colors.reset}`, error.response?.data?.errors?.[0]?.message || error.message);
      }
    }
    
    console.log(`${colors.green}タグのインポートが完了しました${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}タグのインポートに失敗しました:${colors.reset}`, error.message);
    if (error.response?.data?.errors) {
      console.error(`${colors.red}詳細エラー:${colors.reset}`, JSON.stringify(error.response.data.errors, null, 2));
    }
  }
}

// 記事のインポート
async function importArticles() {
  try {
    let articlesData;
    try {
      articlesData = JSON.parse(fs.readFileSync(path.join(__dirname, 'demo-data/articles.json'), 'utf8'));
    } catch (readError) {
      console.error(`${colors.red}記事データの読み込みに失敗しました:${colors.reset}`, readError.message);
      return;
    }
    
    console.log(`${colors.blue}記事のインポートを開始...${colors.reset}`);
    
    // 既存の記事をチェック
    const existingArticlesResponse = await api.get('/items/articles');
    const existingArticles = existingArticlesResponse.data.data || [];
    
    // カテゴリとタグの取得
    const categoriesResponse = await api.get('/items/categories');
    const categories = categoriesResponse.data.data || [];
    
    const tagsResponse = await api.get('/items/tags');
    const tags = tagsResponse.data.data || [];
    
    if (categories.length === 0) {
      console.log(`${colors.yellow}警告: カテゴリが存在しません。先にカテゴリをインポートしてください。${colors.reset}`);
    }
    
    if (tags.length === 0) {
      console.log(`${colors.yellow}警告: タグが存在しません。先にタグをインポートしてください。${colors.reset}`);
    }
    
    for (const article of articlesData) {
      try {
        // 既に同じスラッグの記事が存在するかチェック
        const exists = existingArticles.some(a => a.slug === article.slug);
        
        if (exists) {
          console.log(`${colors.yellow}記事はすでに存在します: ${article.title}${colors.reset}`);
          continue;
        }
        
        // カテゴリIDの解決
        const category = categories.find(c => c.name === article.category);
        const categoryId = category ? category.id : null;
        
        if (!categoryId && article.category) {
          console.log(`${colors.yellow}警告: カテゴリ「${article.category}」が見つかりません。${colors.reset}`);
        }
        
        // タグIDの解決
        const articleTags = [];
        if (article.tags && Array.isArray(article.tags)) {
          for (const tagName of article.tags) {
            const tag = tags.find(t => t.name === tagName);
            if (tag) {
              articleTags.push(tag.id);
            } else {
              console.log(`${colors.yellow}警告: タグ「${tagName}」が見つかりません。${colors.reset}`);
            }
          }
        }
        
        // 公開日の設定（未指定の場合は現在時刻）
        const publishDate = article.publish_date || new Date().toISOString();
        
        // 記事データの準備
        const articleData = {
          title: article.title,
          slug: article.slug,
          content: article.content,
          status: article.status,
          publish_date: publishDate,
          category_id: categoryId,
          seo_title: article.seo_title || article.title,
          seo_description: article.seo_description || '',
          seo_keywords: article.seo_keywords || []
        };
        
        // 記事の作成
        const response = await api.post('/items/articles', articleData);
        const createdArticleId = response.data.data.id;
        console.log(`${colors.green}記事を作成しました: ${article.title}${colors.reset}`);
        
        // タグの関連付け
        if (articleTags.length > 0) {
          for (const tagId of articleTags) {
            try {
              await api.post('/items/article_tags', {
                article_id: createdArticleId,
                tag_id: tagId
              });
            } catch (tagError) {
              console.error(`${colors.yellow}タグ関連付けエラー (記事ID: ${createdArticleId}, タグID: ${tagId}):${colors.reset}`, tagError.response?.data?.errors?.[0]?.message || tagError.message);
            }
          }
          console.log(`${colors.green}記事にタグを設定しました: ${article.title}${colors.reset}`);
        }
      } catch (error) {
        console.error(`${colors.red}記事作成エラー (${article.title}):${colors.reset}`, error.response?.data?.errors?.[0]?.message || error.message);
        
        // 詳細なエラー情報を表示
        if (error.response?.data?.errors) {
          console.error(`${colors.red}詳細エラー:${colors.reset}`);
          error.response.data.errors.forEach((err, index) => {
            console.error(`${colors.red}[${index + 1}] ${err.message}${colors.reset}`);
            if (err.extensions?.field) {
              console.error(`${colors.red}   フィールド: ${err.extensions.field}${colors.reset}`);
            }
          });
        }
      }
    }
    
    console.log(`${colors.green}記事のインポートが完了しました${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}記事のインポートに失敗しました:${colors.reset}`, error.message);
    if (error.response?.data?.errors) {
      console.error(`${colors.red}詳細エラー:${colors.reset}`, JSON.stringify(error.response.data.errors, null, 2));
    }
  }
}

// メイン実行関数
async function main() {
  try {
    // スキーマ確認
    const schemaExists = await checkSchemaExists();
    if (!schemaExists) {
      console.log(`${colors.yellow}スキーマの問題により処理を中断します。上記のガイダンスに従ってください。${colors.reset}`);
      return;
    }
    
    // ログイン処理
    await login();
    
    // データインポート
    await importCategories();
    await importTags();
    await importArticles();
    
    console.log(`${colors.green}すべてのデータのインポートが完了しました！${colors.reset}`);
    
    // 結果の概要を表示
    try {
      const categoriesCount = (await api.get('/items/categories')).data.data.length;
      const tagsCount = (await api.get('/items/tags')).data.data.length;
      const articlesCount = (await api.get('/items/articles')).data.data.length;
      
      console.log(`\n${colors.cyan}インポート結果:${colors.reset}`);
      console.log(`${colors.cyan}カテゴリ: ${categoriesCount}件${colors.reset}`);
      console.log(`${colors.cyan}タグ: ${tagsCount}件${colors.reset}`);
      console.log(`${colors.cyan}記事: ${articlesCount}件${colors.reset}`);
      
      console.log(`\n${colors.green}管理画面: http://localhost:8055/admin/content/articles${colors.reset}`);
      console.log(`${colors.green}フロントエンド: http://localhost:3000${colors.reset}`);
    } catch (error) {
      // エラー処理は不要
    }
  } catch (error) {
    console.error(`${colors.red}データインポート中にエラーが発生しました:${colors.reset}`, error.message);
    process.exit(1);
  }
}

// スクリプト実行
main().catch(error => {
  console.error(`${colors.red}致命的なエラーが発生しました:${colors.reset}`, error);
  process.exit(1);
});