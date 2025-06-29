#!/bin/bash

# Directus CMSの非インタラクティブセットアップスクリプト
# CI/CDや自動化されたデプロイメントに使用

# 環境変数を設定
export NON_INTERACTIVE=1

# setup.shを実行
./setup.sh

# 終了コードをチェック
if [ $? -eq 0 ]; then
  echo "セットアップが成功しました"
  exit 0
else
  echo "セットアップ中にエラーが発生しました"
  exit 1
fi