#!/bin/bash

# Directus CMSのセットアップスクリプト

# 色の定義
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Dockerがインストールされているか確認
if ! command -v docker &> /dev/null || ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Docker または Docker Compose がインストールされていません。${NC}"
    echo -e "インストール手順は以下を参照してください："
    echo -e "Docker: https://docs.docker.com/engine/install/"
    echo -e "Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi

echo -e "${YELLOW}Directus CMS Dockerセットアップを開始します...${NC}"

# .envファイルが存在するか確認
if [ ! -f .env ]; then
    echo -e "${YELLOW}環境設定ファイルを作成しています...${NC}"
    cp .env.example .env
    
    # ユニークなキーと秘密鍵を生成
    KEY=$(openssl rand -hex 16)
    SECRET=$(openssl rand -hex 32)
    sed -i "s/generate-unique-key-here/$KEY/g" .env
    sed -i "s/generate-unique-secret-here/$SECRET/g" .env
    echo -e "${GREEN}.env ファイルを作成しました。必要に応じて設定を変更してください。${NC}"
else
    echo -e "${YELLOW}.env ファイルが既に存在します。既存の設定を使用します。${NC}"
fi

# 必要なディレクトリを作成
echo -e "${YELLOW}必要なディレクトリを作成しています...${NC}"
mkdir -p uploads extensions data/database data/redis

# パーミッションを設定
echo -e "${YELLOW}ディレクトリのパーミッションを設定しています...${NC}"
chmod -R 777 uploads
chmod -R 777 extensions
chmod -R 777 data
chmod -R 777 snapshots

# Dockerコンテナの起動
echo -e "${YELLOW}Dockerコンテナを起動しています...${NC}"
docker-compose up -d

# エラーチェック
if [ $? -ne 0 ]; then
    echo -e "${RED}Dockerコンテナの起動に失敗しました。エラーを確認してください。${NC}"
    exit 1
fi

# コンテナの起動を待機
echo -e "${YELLOW}Directusサービスの起動を待機しています...${NC}"
echo -e "${YELLOW}これには数分かかる場合があります...${NC}"

# コンテナが実行中か確認
RETRY_COUNT=0
MAX_RETRIES=20  # 約3分間（10秒 x 20回）

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if docker-compose ps | grep -q "directus.*running"; then
        break
    fi
    echo -e "${YELLOW}Directusサービスの起動を待機しています... (${RETRY_COUNT}/${MAX_RETRIES})${NC}"
    sleep 10
    RETRY_COUNT=$((RETRY_COUNT+1))
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo -e "${RED}Directusサービスの起動がタイムアウトしました。ログを確認してください:${NC}"
    echo -e "${YELLOW}docker-compose logs directus${NC}"
    exit 1
fi

# APIが応答するか確認
echo -e "${YELLOW}Directus APIの応答を確認しています...${NC}"
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -s http://localhost:8055/server/ping | grep -q "pong"; then
        echo -e "${GREEN}Directus APIが正常に応答しています！${NC}"
        break
    fi
    echo -e "${YELLOW}Directus APIの応答を待機しています... (${RETRY_COUNT}/${MAX_RETRIES})${NC}"
    sleep 10
    RETRY_COUNT=$((RETRY_COUNT+1))
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo -e "${RED}Directus APIの応答がありません。ログを確認してください:${NC}"
    echo -e "${YELLOW}docker-compose logs directus${NC}"
    exit 1
fi

# 自動でスキーマとロールを適用
echo -e "${YELLOW}データモデルのスナップショットを自動適用します...${NC}"

# スキーマのインポート
echo -e "${YELLOW}スキーマをインポートしています...${NC}"
docker-compose exec -T directus npx directus schema apply ./snapshots/schema.yaml --yes

if [ $? -eq 0 ]; then
    echo -e "${GREEN}スキーマのインポートに成功しました！${NC}"
else
    echo -e "${RED}スキーマのインポートに失敗しました。続行します...${NC}"
fi

# ロールと権限のインポート
echo -e "${YELLOW}ロールと権限をインポートしています...${NC}"
docker-compose exec -T directus npx directus schema apply ./snapshots/roles.yaml --yes

if [ $? -eq 0 ]; then
    echo -e "${GREEN}ロールと権限のインポートに成功しました！${NC}"
else
    echo -e "${RED}ロールと権限のインポートに失敗しました。続行します...${NC}"
fi

# NPMパッケージインストール
echo -e "${YELLOW}デモデータインポート用のパッケージをインストールしています...${NC}"
npm install

# 必要な情報を表示
echo -e "\n${GREEN}セットアップが完了しました！${NC}"
echo -e "${GREEN}Directusは http://localhost:8055 でアクセスできます${NC}"
echo -e "${GREEN}管理者ログイン情報:${NC}"
echo -e "${GREEN}- Email: $(grep ADMIN_EMAIL .env | cut -d '=' -f2)${NC}"
echo -e "${GREEN}- Password: $(grep ADMIN_PASSWORD .env | cut -d '=' -f2)${NC}"
echo -e "${YELLOW}注意: 本番環境では必ずパスワードを変更してください${NC}"

# Next.jsフロントエンドの起動
echo -e "\n${YELLOW}Next.jsフロントエンドを起動しますか？ (y/N)${NC}"
read -r start_frontend

if [[ "$start_frontend" =~ ^[yY]$ ]]; then
    echo -e "${YELLOW}Next.jsフロントエンドを起動しています...${NC}"
    docker-compose up -d frontend
    echo -e "${GREEN}Next.jsフロントエンドが http://localhost:3000 で起動しました${NC}"
else
    echo -e "\n${YELLOW}次のコマンドでNext.jsフロントエンドを起動できます:${NC}"
    echo -e "${YELLOW}docker-compose up -d frontend${NC}"
fi

# デモデータのインポート
echo -e "\n${YELLOW}デモデータをインポートしますか？ (y/N)${NC}"
read -r import_demo

if [[ "$import_demo" =~ ^[yY]$ ]]; then
    echo -e "${YELLOW}デモデータをインポートしています...${NC}"
    node seed.js
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}デモデータのインポートに成功しました！${NC}"
    else
        echo -e "${RED}デモデータのインポートに失敗しました。エラーを確認してください。${NC}"
    fi
else
    echo -e "\n${YELLOW}後でデモデータをインポートするには以下のコマンドを実行してください:${NC}"
    echo -e "${YELLOW}node seed.js${NC}"
fi

echo -e "\n${GREEN}全てのセットアップが完了しました！${NC}"
echo -e "${GREEN}お疲れ様でした！${NC}"