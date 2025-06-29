import Layout from '@/components/layout/Layout';

export default function AboutPage() {
  return (
    <Layout title="About" description="このサイトについて">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">About</h1>
        
        <div className="prose max-w-none">
          <p>
            このサイトは、Directus CMSとNext.jsを組み合わせたヘッドレスCMSの実装例です。
            管理者はDirectus管理画面から直感的に記事を作成・管理することができ、フロントエンドはNext.jsによる高速なウェブサイトとして配信されます。
          </p>
          
          <h2>使用技術</h2>
          <ul>
            <li>
              <strong>バックエンド:</strong> Directus CMS、PostgreSQL、Docker
            </li>
            <li>
              <strong>フロントエンド:</strong> Next.js、TypeScript、Tailwind CSS
            </li>
          </ul>
          
          <h2>主な機能</h2>
          <ul>
            <li>記事の作成・編集・公開</li>
            <li>カテゴリとタグによる分類</li>
            <li>カスタムワークフロー（下書き→レビュー→公開）</li>
            <li>SEO最適化</li>
            <li>レスポンシブデザイン</li>
            <li>高速なページロード</li>
          </ul>
          
          <h2>ヘッドレスCMSのメリット</h2>
          <p>
            ヘッドレスCMSアーキテクチャでは、コンテンツ管理（バックエンド）とコンテンツ表示（フロントエンド）が完全に分離されています。
            これにより、以下のようなメリットがあります：
          </p>
          <ul>
            <li>フロントエンドとバックエンドの独立した開発</li>
            <li>APIを通じた複数プラットフォームへのコンテンツ配信</li>
            <li>パフォーマンスの最適化</li>
            <li>セキュリティの向上</li>
            <li>柔軟なスケーリング</li>
          </ul>
          
          <h2>お問い合わせ</h2>
          <p>
            このデモサイトについてのご質問やお問い合わせは、以下の連絡先までお願いいたします：
          </p>
          <p>
            Email: contact@example.com
          </p>
        </div>
      </div>
    </Layout>
  );
}