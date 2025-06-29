#!/bin/bash

# Directus CMSのセットアップスクリプト

# 色の定義
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

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
fi

# 必要なディレクトリを作成
mkdir -p uploads extensions data/database data/redis

# Dockerコンテナの起動
echo -e "${YELLOW}Dockerコンテナを起動しています...${NC}"
docker-compose up -d

# コンテナの起動を待機
echo -e "${YELLOW}Directusサービスの起動を待機しています...${NC}"
sleep 10

# 起動確認
echo -e "${GREEN}セットアップが完了しました！${NC}"
echo -e "${GREEN}Directusは http://localhost:8055 でアクセスできます${NC}"
echo -e "${GREEN}管理者ログイン情報:${NC}"
echo -e "${GREEN}- Email: $(grep ADMIN_EMAIL .env | cut -d '=' -f2)${NC}"
echo -e "${GREEN}- Password: $(grep ADMIN_PASSWORD .env | cut -d '=' -f2)${NC}"
echo -e "${YELLOW}注意: 本番環境では必ずパスワードを変更してください${NC}"