#!/bin/bash

# Directus CMS のリストアスクリプト
# このスクリプトはデータベースとアップロードされたファイルのリストアを行います

# 色の定義
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 引数のチェック
if [ "$#" -ne 2 ]; then
    echo -e "${RED}使用方法: $0 <データベースバックアップファイル> <アップロードバックアップファイル>${NC}"
    echo -e "例: $0 ./backups/directus-db-2025-06-29-1200.sql ./backups/directus-uploads-2025-06-29-1200.tar.gz"
    exit 1
fi

DB_BACKUP=$1
FILES_BACKUP=$2

# ファイルの存在確認
if [ ! -f "$DB_BACKUP" ]; then
    echo -e "${RED}指定されたデータベースバックアップファイルが存在しません: ${DB_BACKUP}${NC}"
    exit 1
fi

if [ ! -f "$FILES_BACKUP" ]; then
    echo -e "${RED}指定されたアップロードバックアップファイルが存在しません: ${FILES_BACKUP}${NC}"
    exit 1
fi

# 確認
echo -e "${YELLOW}以下の操作を実行します:${NC}"
echo -e "1. 現在のデータベースを削除し、${DB_BACKUP}からリストアします"
echo -e "2. 現在のアップロードファイルを削除し、${FILES_BACKUP}からリストアします"
echo -e "${RED}この操作は元に戻せません。続行しますか？ (y/N)${NC}"
read -r confirm

if [[ ! "$confirm" =~ ^[yY]$ ]]; then
    echo -e "${YELLOW}リストア操作をキャンセルしました${NC}"
    exit 0
fi

# データベースのリストア
echo -e "${YELLOW}データベースをリストアしています...${NC}"
docker-compose exec -T database psql -U directus -d postgres -c "DROP DATABASE IF EXISTS directus WITH (FORCE);"
docker-compose exec -T database psql -U directus -d postgres -c "CREATE DATABASE directus;"
cat $DB_BACKUP | docker-compose exec -T database psql -U directus -d directus

if [ $? -eq 0 ]; then
    echo -e "${GREEN}データベースのリストアに成功しました${NC}"
else
    echo -e "${RED}データベースのリストアに失敗しました${NC}"
    exit 1
fi

# アップロードファイルのリストア
echo -e "${YELLOW}アップロードファイルをリストアしています...${NC}"
rm -rf uploads/*
tar -xzf $FILES_BACKUP -C ./

if [ $? -eq 0 ]; then
    echo -e "${GREEN}アップロードファイルのリストアに成功しました${NC}"
else
    echo -e "${RED}アップロードファイルのリストアに失敗しました${NC}"
    exit 1
fi

# Directusサービスの再起動
echo -e "${YELLOW}Directusサービスを再起動しています...${NC}"
docker-compose restart directus

echo -e "${GREEN}リストアが完了しました${NC}"
echo -e "データベース: ${DB_BACKUP}"
echo -e "アップロードファイル: ${FILES_BACKUP}"
echo -e "${YELLOW}管理画面にアクセスして、正常に動作することを確認してください: http://localhost:8055/admin${NC}"