/**
 * カスタムエンドポイントの例: XMLサイトマップ生成
 * Directus Extensions SDKを使用したカスタムエンドポイント実装
 */
module.exports = function registerEndpoint(router, { services, exceptions }) {
  const { ItemsService } = services;
  const { ServiceUnavailableException } = exceptions;

  // サイトマップエンドポイントの登録
  router.get('/sitemap.xml', async (req, res) => {
    try {
      // 管理者権限でアイテムサービスを初期化
      const articlesService = new ItemsService('articles', {
        schema: req.schema,
        accountability: {
          admin: true,
        },
      });
      
      const categoriesService = new ItemsService('categories', {
        schema: req.schema,
        accountability: {
          admin: true,
        },
      });
      
      // 公開済みの記事を取得
      const articles = await articlesService.readByQuery({
        filter: { status: { _eq: 'published' } },
        fields: ['id', 'slug', 'date_updated', 'category_id'],
      });
      
      // カテゴリーを取得
      const categories = await categoriesService.readByQuery({
        fields: ['id', 'slug'],
      });
      
      // サイトマップXMLを生成
      const baseUrl = process.env.PUBLIC_URL || 'http://localhost:8055';
      let xml = '<?xml version="1.0" encoding="UTF-8"?>';
      xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
      
      // ホームページ
      xml += `
        <url>
          <loc>${baseUrl}</loc>
          <changefreq>daily</changefreq>
          <priority>1.0</priority>
        </url>
      `;
      
      // カテゴリーページ
      for (const category of categories) {
        xml += `
          <url>
            <loc>${baseUrl}/category/${category.slug}</loc>
            <changefreq>weekly</changefreq>
            <priority>0.8</priority>
          </url>
        `;
      }
      
      // 記事ページ
      for (const article of articles) {
        const lastmod = new Date(article.date_updated).toISOString();
        
        // カテゴリースラッグを取得（オプション）
        let categorySlug = '';
        if (article.category_id) {
          const category = categories.find(c => c.id === article.category_id);
          if (category) categorySlug = `${category.slug}/`;
        }
        
        xml += `
          <url>
            <loc>${baseUrl}/${categorySlug}${article.slug}</loc>
            <lastmod>${lastmod}</lastmod>
            <changefreq>monthly</changefreq>
            <priority>0.6</priority>
          </url>
        `;
      }
      
      xml += '</urlset>';
      
      // XMLレスポンスを返す
      res.setHeader('Content-Type', 'application/xml');
      res.send(xml);
      
    } catch (error) {
      console.error('サイトマップ生成エラー:', error);
      throw new ServiceUnavailableException('サイトマップの生成に失敗しました');
    }
  });
  
  // サイトマップインデックスエンドポイント（大規模サイト用オプション）
  router.get('/sitemap-index.xml', (req, res) => {
    const baseUrl = process.env.PUBLIC_URL || 'http://localhost:8055';
    const today = new Date().toISOString().split('T')[0];
    
    let xml = '<?xml version="1.0" encoding="UTF-8"?>';
    xml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
    
    xml += `
      <sitemap>
        <loc>${baseUrl}/sitemap.xml</loc>
        <lastmod>${today}</lastmod>
      </sitemap>
    `;
    
    // 大規模サイトの場合は、複数のサイトマップファイルへのリンクを追加
    // 例: カテゴリー別、年別など
    
    xml += '</sitemapindex>';
    
    res.setHeader('Content-Type', 'application/xml');
    res.send(xml);
  });
};