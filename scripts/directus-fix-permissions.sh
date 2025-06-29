#!/bin/bash

# Directus CMS用のパーミッション修正スクリプト

# 色の定義
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Directus CMSのディレクトリパーミッションを修正しています...${NC}"

# プロジェクトのルートディレクトリを取得
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# 必要なディレクトリのリスト
DIRECTORIES=(
  "uploads"
  "extensions"
  "data"
  "data/database"
  "data/redis"
  "snapshots"
)

# ディレクトリが存在することを確認し、必要に応じて作成
for DIR in "${DIRECTORIES[@]}"; do
  FULL_PATH="$ROOT_DIR/$DIR"
  
  if [ ! -d "$FULL_PATH" ]; then
    echo -e "${YELLOW}ディレクトリを作成しています: $DIR${NC}"
    mkdir -p "$FULL_PATH"
  fi
  
  echo -e "${YELLOW}パーミッションを設定しています: $DIR${NC}"
  chmod -R 777 "$FULL_PATH"
done

# setup.shに実行権限を付与
if [ -f "$ROOT_DIR/setup.sh" ]; then
  echo -e "${YELLOW}setup.shに実行権限を付与しています${NC}"
  chmod +x "$ROOT_DIR/setup.sh"
fi

echo -e "${GREEN}パーミッションの修正が完了しました${NC}"
echo -e "${GREEN}以下のディレクトリが書き込み可能になりました:${NC}"

for DIR in "${DIRECTORIES[@]}"; do
  echo -e "${GREEN}- $DIR${NC}"
done