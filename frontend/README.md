# Next.js フロントエンド for Directus CMS

このディレクトリには、Directus CMSのAPIを使用したNext.jsフロントエンドの実装例が含まれています。

## 機能

- Server-Side Rendering (SSR) による高速な表示
- 静的サイト生成 (Static Site Generation) のサポート
- 記事一覧と詳細表示
- カテゴリとタグによるフィルタリング
- 検索機能
- レスポンシブデザイン
- SEO最適化

## セットアップ

1. Directus CMSが実行中であることを確認
2. 以下のコマンドでNext.jsアプリを初期化

```bash
cd frontend
npm install
npm run dev
```

3. ブラウザで http://localhost:3000 にアクセス

## 環境変数の設定

`.env.local`ファイルを作成して以下の変数を設定してください：

```
NEXT_PUBLIC_DIRECTUS_URL=http://localhost:8055
DIRECTUS_TOKEN=your_api_token_here  # オプション
```

## ビルドと実行

```bash
# 開発モード
npm run dev

# 本番用ビルド
npm run build

# 本番モードで実行
npm run start

# 静的サイトの生成
npm run export
```

## ディレクトリ構造

```
frontend/
├── components/        # UIコンポーネント
├── hooks/             # カスタムReactフック
├── lib/               # ユーティリティ関数
├── pages/             # Next.jsページ
├── public/            # 静的ファイル
├── services/          # APIサービス
├── styles/            # CSSスタイル
└── types/             # TypeScript型定義
```

## デプロイ

Next.jsアプリケーションは以下のプラットフォームに簡単にデプロイできます：

- Vercel
- Netlify
- AWS Amplify
- その他のNode.js対応ホスティングサービス