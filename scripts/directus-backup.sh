#!/bin/bash

# Directus CMS のバックアップスクリプト
# このスクリプトはデータベースとアップロードされたファイルのバックアップを作成します

# 設定
BACKUP_DIR="./backups"
DATE=$(date +%Y-%m-%d-%H%M)
DB_BACKUP="${BACKUP_DIR}/directus-db-${DATE}.sql"
FILES_BACKUP="${BACKUP_DIR}/directus-uploads-${DATE}.tar.gz"
SNAPSHOT_DIR="${BACKUP_DIR}/snapshots"

# 色の定義
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# バックアップディレクトリの作成
echo -e "${YELLOW}バックアップディレクトリを作成しています...${NC}"
mkdir -p $BACKUP_DIR
mkdir -p $SNAPSHOT_DIR

# データベースのバックアップ
echo -e "${YELLOW}データベースをバックアップしています...${NC}"
docker-compose exec -T database pg_dump -U directus -d directus > $DB_BACKUP
if [ $? -eq 0 ]; then
    echo -e "${GREEN}データベースのバックアップに成功しました: ${DB_BACKUP}${NC}"
else
    echo -e "\033[0;31mデータベースのバックアップに失敗しました${NC}"
fi

# アップロードファイルのバックアップ
echo -e "${YELLOW}アップロードファイルをバックアップしています...${NC}"
tar -czf $FILES_BACKUP uploads/
if [ $? -eq 0 ]; then
    echo -e "${GREEN}アップロードファイルのバックアップに成功しました: ${FILES_BACKUP}${NC}"
else
    echo -e "\033[0;31mアップロードファイルのバックアップに失敗しました${NC}"
fi

# スナップショットのバックアップ
echo -e "${YELLOW}スナップショットをバックアップしています...${NC}"
cp -r snapshots/* $SNAPSHOT_DIR/
if [ $? -eq 0 ]; then
    echo -e "${GREEN}スナップショットのバックアップに成功しました: ${SNAPSHOT_DIR}${NC}"
else
    echo -e "\033[0;31mスナップショットのバックアップに失敗しました${NC}"
fi

# 古いバックアップの削除（30日以上経過したもの）
echo -e "${YELLOW}古いバックアップを削除しています...${NC}"
find $BACKUP_DIR -name "directus-db-*.sql" -mtime +30 -delete
find $BACKUP_DIR -name "directus-uploads-*.tar.gz" -mtime +30 -delete

echo -e "${GREEN}バックアップが完了しました${NC}"
echo -e "データベース: ${DB_BACKUP}"
echo -e "アップロードファイル: ${FILES_BACKUP}"
echo -e "スナップショット: ${SNAPSHOT_DIR}"