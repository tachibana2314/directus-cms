# Directus CMS Docker

記事管理用のヘッドレスCMS（Directus）をDocker環境で実行するためのプロジェクトです。

## 概要

このプロジェクトは、以下の機能を提供します：

- 記事（ブログ、ニュースなど）の管理
- 編集者・ライター向けの直感的な管理画面
- フロントエンドに依存しないREST/GraphQL API
- 多言語対応とSEO最適化
- Dockerを使用したローカル開発環境

## 主な機能

- 記事（Articles）、カテゴリ（Categories）、タグ（Tags）の管理
- ユーザーロールベースのアクセス制御（ライター、編集者、管理者）
- コンテンツワークフロー（draft→under_review→published）
- REST/GraphQL APIによるデータアクセス
- リアルタイムAPI（WebSockets）対応
- 多言語対応

## 技術スタック

- Directus: ヘッドレスCMS
- PostgreSQL: データベース
- Redis: キャッシュ
- Docker & Docker Compose: コンテナ化と環境構築

## 前提条件

- Docker と Docker Compose がインストールされていること
- Node.js (デモデータのインポートに使用)

## セットアップ手順

### 1. リポジトリのクローン

```bash
git clone https://github.com/yourusername/directus-cms-docker.git
cd directus-cms-docker
```

### 2. 環境設定

```bash
# .env.example を .env にコピー
cp .env.example .env

# 必要に応じて .env の内容を編集
# 特に KEY, SECRET, ADMIN_EMAIL, ADMIN_PASSWORD は必ず変更してください
```

### 3. セットアップ実行

以下のコマンドでセットアップスクリプトを実行します：

```bash
./setup.sh
```

または、Makeコマンドを使用します：

```bash
make setup
```

セットアップスクリプトは以下の処理を行います：
- 必要なディレクトリの作成
- パーミッションの設定
- 環境設定ファイルの作成
- Dockerコンテナの起動

### 4. アクセス方法

セットアップが完了すると、以下のURLでDirectus管理画面にアクセスできます：

- Directus管理画面: http://localhost:8055/admin
- API: http://localhost:8055/

管理者アカウント（デフォルト）：
- Email: admin@example.com
- Password: admin_password

**注意**: 起動には数分かかる場合があります。ブラウザで直ちにアクセスできない場合は、しばらく待ってからリロードしてください。

### 5. デモデータのインポート

コンテナが起動して安定した後、以下のコマンドでデモデータをインポートできます：

```bash
make seed
```

または、直接以下のコマンドを実行します：

```bash
npm install && node seed.js
```

### トラブルシューティング

#### パーミッションエラーが発生する場合

```bash
make fix-permissions
```

#### コンテナが起動しない場合

```bash
# ログを確認
docker-compose logs directus

# コンテナを再起動
docker-compose restart
```

## データモデル

### 記事（Articles）

- タイトル（必須）
- スラッグ（ユニーク）
- 本文（WYSIWYG/HTML）
- 公開日
- ステータス（draft/under_review/published/archived）
- カテゴリ（M2O）
- タグ（M2M）
- アイキャッチ画像
- メタデータ（SEO用：メタタイトル、ディスクリプション、キーワード）

### カテゴリ（Categories）

- 名前（必須、ユニーク）
- スラッグ（ユニーク）
- 説明（オプション）

### タグ（Tags）

- 名前（必須、ユニーク）
- スラッグ（ユニーク）

## ユーザーロール

- **ライター**: 記事の作成と下書き管理
- **編集者**: 記事のレビューと公開管理
- **管理者**: 全てのコンテンツとシステム設定

## ワークフロー

1. ライターが記事を作成し、「under_review」ステータスに変更
2. システムが編集者にレビュー依頼を通知
3. 編集者が記事をレビューし、「published」に変更
4. システムが公開通知を送信し、未設定のSEOメタデータを自動生成

## API利用例

### REST APIサンプル

記事一覧の取得:
```
GET /items/articles?fields=*,category_id.*
```

特定の記事の取得:
```
GET /items/articles/[id]?fields=*,category_id.*,tags.*
```

### GraphQL APIサンプル

```graphql
query {
  articles {
    id
    title
    content
    publish_date
    status
    category_id {
      id
      name
    }
    tags {
      tags_id {
        id
        name
      }
    }
  }
}
```

## ディレクトリ構造

```
directus-cms-docker/
├── docker-compose.yml      # Dockerコンテナ設定
├── .env.example            # 環境変数テンプレート
├── .env                    # 環境変数（gitignoreされます）
├── setup.sh                # セットアップスクリプト
├── seed.js                 # デモデータ投入スクリプト
├── uploads/                # アップロードされたファイル
├── extensions/             # Directusの拡張機能
├── snapshots/              # スキーマスナップショット
│   ├── schema.yaml         # データモデル定義
│   ├── roles.yaml          # ロールと権限設定
│   └── flows/              # ワークフロー設定
│       ├── publish_notification.json
│       └── review_request.json
├── demo-data/              # デモデータ
│   ├── articles.json
│   ├── categories.json
│   └── tags.json
└── data/                   # データベースとキャッシュのボリューム
    ├── database/
    └── redis/
```

## カスタマイズ

### 環境変数の調整

`.env`ファイルを編集することで、以下の設定をカスタマイズできます：

- データベース接続情報
- 管理者アカウント
- API設定（CORS、認証など）
- ファイルストレージ
- キャッシュ設定
- 言語設定

### 拡張機能の追加

Directusのカスタム拡張機能を開発する場合は、`extensions/`ディレクトリにコードを配置します。拡張機能の開発方法については、[Directus公式ドキュメント](https://docs.directus.io/extensions/introduction.html)を参照してください。

## 本番環境への展開

本番環境にデプロイする際は、以下の点に注意してください：

1. 強力なパスワードと秘密鍵を使用する
2. HTTPS/TLSを設定する（リバースプロキシの使用を推奨）
3. ボリュームをバックアップする仕組みを構築する
4. スケーリングが必要な場合は、データベースとDirectusを別々にスケールする

## ライセンス

このプロジェクトは[MITライセンス](LICENSE)の下で公開されています。

Directusは、年間収益500万ドル未満の組織であれば無料で商用利用できます。詳細は[Directusライセンス](https://directus.io/pricing)を参照してください。