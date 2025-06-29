# Directus CMS Docker用Makefile
# 一般的な操作を簡単に実行するためのショートカットコマンド

.PHONY: setup start stop restart status backup restore seed install-ext help

# デフォルトコマンド: ヘルプを表示
default: help

# セットアップ: 環境を初期化し、コンテナを起動
setup:
	@echo "Directus CMS環境をセットアップしています..."
	@./setup.sh

# 起動: Dockerコンテナを起動
start:
	@echo "Dockerコンテナを起動しています..."
	@docker-compose up -d
	@echo "起動完了: http://localhost:8055"

# 停止: Dockerコンテナを停止
stop:
	@echo "Dockerコンテナを停止しています..."
	@docker-compose down
	@echo "停止完了"

# 再起動: Dockerコンテナを再起動
restart:
	@echo "Dockerコンテナを再起動しています..."
	@docker-compose restart
	@echo "再起動完了"

# ステータス: 実行中のコンテナを表示
status:
	@docker-compose ps

# ログ: コンテナのログを表示
logs:
	@docker-compose logs -f

# バックアップ: データベースとファイルのバックアップを作成
backup:
	@echo "バックアップを作成しています..."
	@./scripts/directus-backup.sh

# リストア: データベースとファイルをリストア
restore:
	@echo "使用方法: make restore DB=<データベースバックアップ> FILES=<ファイルバックアップ>"
	@[ -n "$(DB)" ] && [ -n "$(FILES)" ] && ./scripts/directus-restore.sh $(DB) $(FILES) || echo "DBとFILESパラメータが必要です"

# シード: デモデータをインポート
seed:
	@echo "デモデータをインポートしています..."
	@npm install && node seed.js

# 拡張機能インストール: カスタム拡張機能をインストール
install-ext:
	@echo "拡張機能をインストールしています..."
	@docker-compose restart directus
	@echo "拡張機能をインストールしました"

# スキーマ適用: スナップショットからスキーマを適用
apply-schema:
	@echo "スナップショットからスキーマを適用しています..."
	@docker-compose exec directus npx directus schema apply ./snapshots/schema.yaml --yes
	@echo "スキーマを適用しました"

# スキーマスナップショット: 現在のスキーマからスナップショットを作成
snapshot-schema:
	@echo "スキーマスナップショットを作成しています..."
	@docker-compose exec directus npx directus schema snapshot ./snapshots/schema-$(shell date +%Y%m%d%H%M).yaml
	@echo "スナップショットを作成しました"

# クリーン: 不要なデータを削除
clean:
	@echo "クリーンアップしています..."
	@docker-compose down -v
	@rm -rf data/database/* data/redis/* uploads/*
	@echo "クリーンアップ完了"

# ヘルプ: 利用可能なコマンド一覧を表示
help:
	@echo "Directus CMS Docker - 利用可能なコマンド:"
	@echo ""
	@echo "  make setup        - 環境をセットアップし、コンテナを起動"
	@echo "  make start        - コンテナを起動"
	@echo "  make stop         - コンテナを停止"
	@echo "  make restart      - コンテナを再起動"
	@echo "  make status       - コンテナのステータスを表示"
	@echo "  make logs         - コンテナのログを表示"
	@echo "  make backup       - データベースとファイルのバックアップを作成"
	@echo "  make restore DB=<path> FILES=<path> - バックアップからリストア"
	@echo "  make seed         - デモデータをインポート"
	@echo "  make install-ext  - 拡張機能をインストール"
	@echo "  make apply-schema - スナップショットからスキーマを適用"
	@echo "  make snapshot-schema - スキーマスナップショットを作成"
	@echo "  make clean        - データを削除してクリーンアップ"
	@echo ""
	@echo "例: make backup     # バックアップを作成"
	@echo "    make restore DB=./backups/directus-db-2025-06-29.sql FILES=./backups/directus-uploads-2025-06-29.tar.gz"