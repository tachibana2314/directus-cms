# Directus CMS Docker用Makefile
# 一般的な操作を簡単に実行するためのショートカットコマンド

.PHONY: setup start stop restart status logs seed help

# デフォルトコマンド: ヘルプを表示
default: help

# セットアップ: 環境を初期化し、コンテナを起動
setup:
	@echo "Directus CMS環境をセットアップしています..."
	@chmod +x ./setup.sh
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

# シード: デモデータをインポート
seed:
	@echo "デモデータをインポートしています..."
	@npm install && node seed.js

# パーミッション修正: ディレクトリのパーミッションを修正
fix-permissions:
	@echo "ディレクトリのパーミッションを修正しています..."
	@chmod -R 777 uploads extensions data snapshots
	@echo "パーミッションを修正しました"

# ヘルプ: 利用可能なコマンド一覧を表示
help:
	@echo "Directus CMS Docker - 利用可能なコマンド:"
	@echo ""
	@echo "  make setup           - 環境をセットアップし、コンテナを起動"
	@echo "  make start           - コンテナを起動"
	@echo "  make stop            - コンテナを停止"
	@echo "  make restart         - コンテナを再起動"
	@echo "  make status          - コンテナのステータスを表示"
	@echo "  make logs            - コンテナのログを表示"
	@echo "  make seed            - デモデータをインポート"
	@echo "  make fix-permissions - ディレクトリのパーミッションを修正"
	@echo ""
	@echo "例: make seed          # デモデータをインポート"
	@echo "    make fix-permissions # パーミッションの問題を修正"