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
MAX_RETRIES=12  # 2分間（10秒 x 12回）

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
else
    # 起動確認
    echo -e "${GREEN}セットアップが完了しました！${NC}"
    echo -e "${GREEN}Directusは http://localhost:8055 でアクセスできます${NC}"
    echo -e "${GREEN}管理者ログイン情報:${NC}"
    echo -e "${GREEN}- Email: $(grep ADMIN_EMAIL .env | cut -d '=' -f2)${NC}"
    echo -e "${GREEN}- Password: $(grep ADMIN_PASSWORD .env | cut -d '=' -f2)${NC}"
    echo -e "${YELLOW}注意: 本番環境では必ずパスワードを変更してください${NC}"
    
    # スナップショットのインポート
    echo -e "\n${YELLOW}データモデルのスナップショットをインポートしますか？ (y/N)${NC}"
    read -r import_snapshot
    
    if [[ "$import_snapshot" =~ ^[yY]$ ]]; then
        echo -e "${YELLOW}スナップショットをインポートしています...${NC}"
        docker-compose exec directus npx directus schema apply ./snapshots/schema.yaml --yes
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}スキーマのインポートに成功しました！${NC}"
        else
            echo -e "${RED}スキーマのインポートに失敗しました。ログを確認してください。${NC}"
        fi
        
        echo -e "${YELLOW}ロールと権限をインポートしています...${NC}"
        docker-compose exec directus npx directus schema apply ./snapshots/roles.yaml --yes
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}ロールと権限のインポートに成功しました！${NC}"
        else
            echo -e "${RED}ロールと権限のインポートに失敗しました。ログを確認してください。${NC}"
        fi
    fi
    
    # 拡張機能のインストール
    if [ -d "./extensions" ] && [ "$(ls -A ./extensions)" ]; then
        echo -e "\n${YELLOW}拡張機能をインストールしますか？ (y/N)${NC}"
        read -r install_extensions
        
        if [[ "$install_extensions" =~ ^[yY]$ ]]; then
            echo -e "${YELLOW}拡張機能をインストールしています...${NC}"
            docker-compose restart directus
            echo -e "${GREEN}拡張機能のインストールが完了しました！${NC}"
        fi
    fi
    
    echo -e "\n${GREEN}セットアップが完了しました！${NC}"
    echo -e "${YELLOW}デモデータをインポートするには、以下のコマンドを実行してください:${NC}"
    echo -e "${YELLOW}npm install && node seed.js${NC}"
fi