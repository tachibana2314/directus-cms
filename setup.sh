#!/bin/bash

#!/bin/bash

# Directus CMSのセットアップスクリプト（シンプル版）

# 色の定義
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Directus CMS Dockerセットアップを開始します...${NC}"

# 必要なディレクトリを作成
echo -e "${YELLOW}必要なディレクトリを作成しています...${NC}"
mkdir -p uploads extensions data/database data/redis snapshots

# パーミッションを設定
echo -e "${YELLOW}パーミッションを設定しています...${NC}"
chmod -R 777 uploads
chmod -R 777 extensions
chmod -R 777 data
chmod -R 777 snapshots

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

# Dockerコンテナの起動
echo -e "${YELLOW}Dockerコンテナを起動しています...${NC}"
docker-compose up -d

# 完了メッセージ
echo -e "${GREEN}セットアップが完了しました！${NC}"
echo -e "${YELLOW}Directusの起動には数分かかる場合があります...${NC}"
echo -e "${GREEN}Directusは http://localhost:8055 でアクセスできます${NC}"
echo -e "${GREEN}管理者ログイン情報:${NC}"
echo -e "${GREEN}- Email: admin@example.com${NC}"
echo -e "${GREEN}- Password: admin_password${NC}"
echo -e "${YELLOW}注意: 本番環境では必ずパスワードを変更してください${NC}"

# デモデータについての情報
echo -e "\n${YELLOW}デモデータをインポートするには以下のコマンドを実行してください:${NC}"
echo -e "${YELLOW}npm install && node seed.js${NC}"