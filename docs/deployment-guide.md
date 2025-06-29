# デプロイメントガイド

このガイドでは、Directus CMSをさまざまな環境にデプロイする方法を説明します。

## 本番環境へのデプロイ

### 準備

本番環境にデプロイする前に、以下の点に注意してください：

1. **セキュリティ**
   - 強力なパスワードと秘密鍵を使用する
   - `.env`ファイルのKEYとSECRETを必ず変更する
   - 管理者アカウントの認証情報を安全に管理する

2. **パフォーマンス**
   - キャッシュ設定を最適化する
   - データベースのインデックスを適切に設定する

3. **データベース**
   - 本番環境用のデータベースバックアップ戦略を計画する
   - 適切なデータベースユーザー権限を設定する

### デプロイオプション

#### 1. Dockerを使用したセルフホスティング

本プロジェクトで提供されているDockerセットアップは、本番環境でも使用できます。

```bash
# 本番環境用に.envを設定
cp .env.example .env
# .envを編集して本番環境設定を行う

# Dockerコンテナを起動
docker-compose up -d
```

#### 2. クラウドプロバイダー（AWS, GCP, Azure）へのデプロイ

**AWS EC2の例：**

1. EC2インスタンスをセットアップ
2. Dockerとdocker-composeをインストール
3. リポジトリをクローン
4. 環境変数を設定
5. コンテナを起動

```bash
sudo apt-get update
sudo apt-get install -y docker.io docker-compose
git clone https://github.com/your-repo/directus-cms-docker.git
cd directus-cms-docker
cp .env.example .env
# .envを編集
sudo docker-compose up -d
```

**AWS ECSの例：**

1. ECRにDockerイメージをプッシュ
2. ECSタスク定義を作成
3. ECSサービスを起動

#### 3. Kubernetesでのデプロイ

Kubernetesを使用する場合、以下のリソースを定義する必要があります：

- Deployment
- Service
- ConfigMap（環境変数用）
- Secret（機密情報用）
- PersistentVolumeClaim（データ永続化用）

サンプルKubernetesマニフェスト：

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: directus-config
data:
  DB_CLIENT: "pg"
  DB_HOST: "postgres"
  DB_PORT: "5432"
  DB_DATABASE: "directus"
  DB_USER: "directus"
  CACHE_ENABLED: "true"
  CACHE_STORE: "redis"
  CACHE_REDIS: "redis://redis:6379"
  
---
apiVersion: v1
kind: Secret
metadata:
  name: directus-secrets
type: Opaque
data:
  KEY: "your-base64-encoded-key"
  SECRET: "your-base64-encoded-secret"
  DB_PASSWORD: "your-base64-encoded-password"
  ADMIN_EMAIL: "your-base64-encoded-email"
  ADMIN_PASSWORD: "your-base64-encoded-password"

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: directus
spec:
  replicas: 2
  selector:
    matchLabels:
      app: directus
  template:
    metadata:
      labels:
        app: directus
    spec:
      containers:
      - name: directus
        image: directus/directus:latest
        ports:
        - containerPort: 8055
        envFrom:
        - configMapRef:
            name: directus-config
        - secretRef:
            name: directus-secrets
        volumeMounts:
        - name: uploads
          mountPath: /directus/uploads
      volumes:
      - name: uploads
        persistentVolumeClaim:
          claimName: directus-uploads-pvc
```

#### 4. Directus Cloud

最も簡単なオプションとして、[Directus Cloud](https://directus.io/cloud)を使用する方法があります。

1. Directus Cloudアカウントを作成
2. 新しいプロジェクトを作成
3. データベース設定を行う
4. データモデルをインポート（スナップショットを使用）

## HTTPS/TLSの設定

本番環境では、HTTPSを設定することが重要です。

### Nginxリバースプロキシの例

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:8055;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Let's Encryptを使用したSSL証明書の取得

```bash
# Certbotをインストール
sudo apt-get install certbot python3-certbot-nginx

# 証明書を取得
sudo certbot --nginx -d your-domain.com
```

## スケーリング

### 水平スケーリング

複数のDirectusインスタンスを実行する場合：

1. 共有ファイルストレージを設定（S3, GCS, Azure Blobなど）
2. ロードバランサーを設定
3. セッション管理を適切に設定

### 垂直スケーリング

1. より多くのリソース（CPU、メモリ）を割り当てる
2. データベースの最適化（インデックス、クエリチューニング）

## モニタリングとメンテナンス

### 監視

- Prometheusを使用してメトリクスを収集
- Grafanaでダッシュボードを作成
- ログ収集（ELK Stack、Loki + Grafanaなど）

### バックアップ

```bash
# データベースバックアップ
docker-compose exec database pg_dump -U directus -d directus > backup.sql

# アップロードファイルのバックアップ
tar -czf uploads_backup.tar.gz uploads/
```

### アップデート

```bash
# 最新のイメージをプル
docker-compose pull

# コンテナを再起動
docker-compose up -d
```

## 障害対応

一般的な問題とその解決策：

1. **コンテナが起動しない**
   - ログを確認: `docker-compose logs directus`
   - 環境変数が正しく設定されているか確認

2. **データベース接続エラー**
   - データベースが実行中か確認
   - 接続情報が正しいか確認

3. **APIが応答しない**
   - キャッシュをクリア
   - サービスを再起動