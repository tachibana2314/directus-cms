#!/bin/bash

#!/bin/bash

# Directus CMSのセットアップスクリプト

# 色の定義
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# 開始メッセージ
echo -e "${BLUE}${BOLD}==========================================${NC}"
echo -e "${BLUE}${BOLD}   Directus CMS Docker セットアップ      ${NC}"
echo -e "${BLUE}${BOLD}==========================================${NC}"

# Dockerがインストールされているか確認
if ! command -v docker &> /dev/null || ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Docker または Docker Compose がインストールされていません。${NC}"
    echo -e "インストール手順は以下を参照してください："
    echo -e "Docker: https://docs.docker.com/engine/install/"
    echo -e "Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi

# エラーが発生しても続行（-e を削除）
set +e

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

# コンテナの起動確認（インタラクティブでない簡易版）
RETRY_COUNT=0
MAX_RETRIES=30  # 5分間（10秒 x 30回）
CONTAINER_RUNNING=false
API_READY=false

echo -e "${YELLOW}Directusサービスの起動を待機しています...${NC}"
echo -e "${YELLOW}この処理には数分かかる場合があります。しばらくお待ちください...${NC}"

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if docker-compose ps | grep -q "directus.*running"; then
        CONTAINER_RUNNING=true
        echo -e "${GREEN}Directusコンテナが起動しました！${NC}"
        break
    fi
    echo -e "${YELLOW}Directusサービスの起動を待機しています... (${RETRY_COUNT}/${MAX_RETRIES})${NC}"
    sleep 10
    RETRY_COUNT=$((RETRY_COUNT+1))
done

if [ "$CONTAINER_RUNNING" = false ]; then
    echo -e "${RED}警告: Directusコンテナの起動確認がタイムアウトしました。${NC}"
    echo -e "${YELLOW}処理は続行しますが、エラーが発生する可能性があります。${NC}"
    echo -e "${YELLOW}問題が発生した場合は以下のコマンドでログを確認してください:${NC}"
    echo -e "${YELLOW}docker-compose logs directus${NC}"
    echo -e "${YELLOW}コンテナが停止している場合は以下で再起動:${NC}"
    echo -e "${YELLOW}docker-compose restart directus${NC}"
    # タイムアウトでも強制終了せず続行
fi

# APIが応答するか確認
echo -e "${YELLOW}Directus APIの応答を確認しています...${NC}"
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    # サーバーが応答するか確認 (-f: 失敗時に何も出力しない、-s: サイレントモード)
    if curl -sf http://localhost:8055/server/ping > /dev/null 2>&1; then
        echo -e "${GREEN}Directus APIが正常に応答しています！${NC}"
        API_READY=true
        break
    fi
    echo -e "${YELLOW}Directus APIの応答を待機しています... (${RETRY_COUNT}/${MAX_RETRIES})${NC}"
    sleep 10
    RETRY_COUNT=$((RETRY_COUNT+1))
done

if [ "$API_READY" = false ]; then
    echo -e "${RED}警告: Directus APIの応答がありません。${NC}"
    echo -e "${YELLOW}セットアップを続行しますが、スキーマのインポートとデータシードは失敗する可能性があります。${NC}"
    echo -e "${YELLOW}ログを確認するには: docker-compose logs directus${NC}"
    echo -e "${YELLOW}API起動後に以下のコマンドを実行してセットアップを完了してください:${NC}"
    echo -e "${YELLOW}make apply-schema${NC}"
    echo -e "${YELLOW}make seed${NC}"
    # タイムアウトでも強制終了せず続行
fi

# スキーマ適用はAPIが準備できている場合のみ実行
if [ "$API_READY" = true ]; then
    # 自動でスキーマとロールを適用
    echo -e "${YELLOW}データモデルのスナップショットを自動適用します...${NC}"
    
    # スキーマのインポート
    echo -e "${YELLOW}スキーマをインポートしています...${NC}"
    # -T フラグを削除（TTYエラーの回避）
    docker-compose exec directus npx directus schema apply ./snapshots/schema.yaml --yes || true
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}スキーマのインポートに成功しました！${NC}"
    else
        echo -e "${RED}スキーマのインポートに失敗しました。続行します...${NC}"
        echo -e "${YELLOW}後で手動でスキーマを適用するには:${NC}"
        echo -e "${YELLOW}make apply-schema${NC}"
    fi
    
    # ロールと権限のインポート
    echo -e "${YELLOW}ロールと権限をインポートしています...${NC}"
    # -T フラグを削除（TTYエラーの回避）
    docker-compose exec directus npx directus schema apply ./snapshots/roles.yaml --yes || true
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}ロールと権限のインポートに成功しました！${NC}"
    else
        echo -e "${RED}ロールと権限のインポートに失敗しました。続行します...${NC}"
    fi
else
    echo -e "${YELLOW}APIが応答していないため、スキーマと権限の適用をスキップします${NC}"
    echo -e "${YELLOW}APIが起動した後、手動で以下のコマンドを実行してください:${NC}"
    echo -e "${YELLOW}make apply-schema${NC}"
fi

# NPMパッケージインストール
echo -e "${YELLOW}デモデータインポート用のパッケージをインストールしています...${NC}"
npm install --no-audit --no-fund || echo -e "${YELLOW}パッケージのインストールに問題が発生しました。続行します...${NC}"

# 必要な情報を表示
echo -e "\n${GREEN}セットアップが完了しました！${NC}"
echo -e "${GREEN}Directusは http://localhost:8055 でアクセスできます${NC}"
echo -e "${GREEN}管理者ログイン情報:${NC}"
echo -e "${GREEN}- Email: $(grep ADMIN_EMAIL .env | cut -d '=' -f2 || echo 'admin@example.com')${NC}"
echo -e "${GREEN}- Password: $(grep ADMIN_PASSWORD .env | cut -d '=' -f2 || echo 'admin_password')${NC}"
echo -e "${YELLOW}注意: 本番環境では必ずパスワードを変更してください${NC}"

# ノンインタラクティブモード用の変更（CI/CDなどで自動実行する場合）
# 環境変数 NON_INTERACTIVE が設定されている場合はプロンプトをスキップ
if [ -z "${NON_INTERACTIVE}" ]; then
    # Next.jsフロントエンドの起動（インタラクティブモード）
    echo -e "\n${YELLOW}Next.jsフロントエンドを起動しますか？ (y/N)${NC}"
    read -r -t 30 start_frontend || start_frontend="n"  # 30秒でタイムアウト、デフォルトはn
    
    if [[ "$start_frontend" =~ ^[yY]$ ]]; then
        echo -e "${YELLOW}Next.jsフロントエンドを起動しています...${NC}"
        docker-compose up -d frontend
        echo -e "${GREEN}Next.jsフロントエンドが http://localhost:3000 で起動しました${NC}"
    else
        echo -e "\n${YELLOW}次のコマンドでNext.jsフロントエンドを起動できます:${NC}"
        echo -e "${YELLOW}docker-compose up -d frontend${NC}"
    fi
    
    # APIが準備できている場合のみデモデータのインポートを提案
    if [ "$API_READY" = true ]; then
        echo -e "\n${YELLOW}デモデータをインポートしますか？ (y/N)${NC}"
        read -r -t 30 import_demo || import_demo="n"  # 30秒でタイムアウト、デフォルトはn
        
        if [[ "$import_demo" =~ ^[yY]$ ]]; then
            echo -e "${YELLOW}デモデータをインポートしています...${NC}"
            node seed.js || echo -e "${RED}デモデータのインポートに失敗しました。${NC}"
        else
            echo -e "\n${YELLOW}後でデモデータをインポートするには以下のコマンドを実行してください:${NC}"
            echo -e "${YELLOW}node seed.js${NC}"
        fi
    else
        echo -e "\n${YELLOW}APIが応答していないため、デモデータのインポートはスキップします。${NC}"
        echo -e "${YELLOW}APIが起動した後、手動でデータをインポートしてください:${NC}"
        echo -e "${YELLOW}node seed.js${NC}"
    fi
else
    # ノンインタラクティブモード - プロンプトなしで続行
    echo -e "\n${YELLOW}ノンインタラクティブモードで実行中。ユーザープロンプトをスキップします。${NC}"
fi

# セットアップ完了メッセージ
echo -e "\n${GREEN}セットアップが完了しました！${NC}"

# 次のステップを表示
echo -e "\n${YELLOW}次のステップ:${NC}"
echo -e "1. ${YELLOW}Directus管理画面にログイン: http://localhost:8055/admin${NC}"
echo -e "2. ${YELLOW}パーミッション問題が発生した場合: make fix-permissions${NC}"
echo -e "3. ${YELLOW}APIが起動したらスキーマを適用: make apply-schema${NC}"
echo -e "4. ${YELLOW}デモデータのインポート: make seed${NC}"
echo -e "5. ${YELLOW}Next.jsフロントエンドの起動: make frontend${NC}"