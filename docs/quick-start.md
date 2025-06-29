# Directus CMS Docker クイックスタート

このガイドでは、Directus CMS Dockerを使用して記事管理CMSを素早くセットアップする方法を説明します。

## 1. 必要条件

- Docker と Docker Compose がインストール済みであること
- Git がインストール済みであること
- Node.js（オプション、デモデータのインポートに使用）

## 2. リポジトリのクローン

```bash
git clone https://github.com/tachibana2314/directus-cms.git
cd directus-cms
```

## 3. セットアップ

セットアップスクリプトを使用してDirectus環境を初期化します：

```bash
./setup.sh
```

このスクリプトは以下の処理を行います：

1. `.env.example`から`.env`ファイルを作成
2. ランダムな認証キーを生成
3. 必要なディレクトリを作成
4. Dockerコンテナを起動
5. スキーマのインポートを提案（オプション）

また、Makefileを使って簡単にセットアップすることもできます：

```bash
make setup
```

## 4. 管理画面へのアクセス

セットアップが完了したら、ブラウザで以下のURLにアクセスします：

```
http://localhost:8055/admin
```

デフォルトの管理者アカウント：
- Email: admin@example.com
- Password: admin_password

**注意**: 本番環境では必ずパスワードを変更してください。

## 5. デモデータのインポート（オプション）

サンプルデータをインポートするには：

```bash
npm install
node seed.js
```

または：

```bash
make seed
```

## 6. データモデル

CMSには以下のデータモデルが含まれています：

- **記事（Articles）**: タイトル、スラッグ、本文、ステータス等
- **カテゴリ（Categories）**: 記事の分類
- **タグ（Tags）**: 記事に付与できるキーワード

## 7. 主なコマンド

Makefileを使用して一般的な操作を簡単に実行できます：

```bash
# システムステータスを表示
make status

# コンテナを停止
make stop

# コンテナを再起動
make restart

# ログを表示
make logs

# バックアップを作成
make backup

# データをリストア
make restore DB=./backups/directus-db-YYYY-MM-DD.sql FILES=./backups/directus-uploads-YYYY-MM-DD.tar.gz

# 環境をクリーンアップ
make clean
```

## 8. カスタマイズ

### 環境変数

`.env`ファイルを編集して設定をカスタマイズできます：

- データベース接続設定
- 管理者アカウント
- キャッシュ設定
- 言語設定
- ストレージ設定

### カスタム拡張機能

以下のカスタム拡張機能が含まれています：

1. **記事フック（extensions/hooks/article-hooks）**
   - スラッグの自動生成
   - 公開時の自動処理

2. **サイトマップエンドポイント（extensions/endpoints/sitemap）**
   - XMLサイトマップの自動生成
   - SEO対策用

### フロントエンド統合

`docs/examples/frontend-integration.js`にフロントエンドとの統合例があります。

## 9. 次のステップ

- ロールと権限の設定
- フロントエンドとの連携
- カスタムフローの作成
- 多言語対応の設定

詳細については、[Directus公式ドキュメント](https://docs.directus.io/)を参照してください。