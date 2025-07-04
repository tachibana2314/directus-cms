# ワークフロー利用ガイド

このガイドでは、Directus CMSでの記事管理ワークフローの使い方について説明します。

## ワークフローの概要

このCMSでは、以下のような記事のライフサイクルを管理できます：

1. **下書き作成（Draft）**：ライターが記事を作成し、編集を継続できる状態
2. **レビュー依頼（Under Review）**：編集者によるレビューを待っている状態
3. **公開（Published）**：サイトに公開されている状態
4. **アーカイブ（Archived）**：過去の記事として保存されている状態

各状態に応じて、自動処理やユーザー権限が適切に設定されています。

## ユーザーロールと権限

### ライター（Writer）

- 記事の作成、編集（自分が作成した記事のみ）
- 記事ステータスの「Draft」→「Under Review」への変更
- カテゴリ・タグの閲覧（読み取り専用）

### 編集者（Editor）

- 全ての記事の閲覧、編集
- 記事ステータスの「Under Review」→「Published」への変更
- カテゴリ・タグの作成、編集、削除
- ダッシュボードへのアクセス

### 管理者（Administrator）

- 全てのコンテンツと設定へのアクセス
- ユーザー管理
- システム設定
- データモデルの編集

## 記事作成からレビュー、公開までの流れ

### 1. ライターによる記事作成

1. ダッシュボードにログインする
2. 「記事」コレクションから「+新規作成」ボタンをクリック
3. 必須項目を入力：
   - タイトル
   - スラッグ（自動生成されますが、必要に応じて編集可能）
   - 本文（WYSIWYGエディタを使用）
4. 必要に応じて追加情報を設定：
   - カテゴリ選択
   - タグ選択
   - アイキャッチ画像のアップロード
   - SEO関連情報（メタタイトル、説明、キーワード）
5. 「保存」ボタンをクリックして下書き状態で保存

### 2. レビュー依頼

1. 下書きの記事が完成したら、ステータスを「Under Review」に変更
2. 「保存」ボタンをクリック
3. システムが自動的に編集者にレビュー依頼の通知を送信

### 3. 編集者によるレビュー

1. 編集者がダッシュボードにログイン
2. 「記事」コレクションで「Under Review」ステータスの記事を確認
3. 記事を選択して内容を確認・編集
4. レビュー完了後：
   - 修正が必要な場合は、コメントを追加して「Draft」に戻す
   - 問題がなければステータスを「Published」に変更
5. 「保存」ボタンをクリック

### 4. 記事の公開

1. ステータスが「Published」に変更されると、以下の自動処理が実行されます：
   - SEOメタデータが未設定の場合、自動生成
   - 公開日時が設定されていない場合、現在日時を設定
   - 作成者に通知メール送信
   - （設定されている場合）SNS通知やその他の自動処理

## 自動ワークフロー（Flows）

以下の自動処理が設定されています：

### 1. 公開通知フロー

記事が「Published」ステータスに変更されたときに実行されるフロー：
- SEOメタデータ自動生成（未設定の場合）
- 記事作成者への通知メール送信
- （オプション）SNSへの投稿

### 2. レビューリクエストフロー

記事が「Under Review」ステータスに変更されたときに実行されるフロー：
- 編集者ロールのユーザーへの通知

## 特殊機能

### プレビュー機能

記事編集画面では、「プレビュー」ボタンを使用して実際の表示を確認できます。この機能は下書き状態でも利用可能です。

### バージョン履歴

記事の変更履歴は自動的に保存され、必要に応じて以前のバージョンに戻すことができます：
1. 記事編集画面の「リビジョン」タブを開く
2. 履歴リストから特定のバージョンを選択
3. 「このバージョンを復元」をクリック

### スケジュール公開

将来の日時に公開するよう設定できます：
1. 記事編集画面で「公開日」フィールドに将来の日時を設定
2. ステータスを「Published」に変更
3. 「保存」ボタンをクリック
4. 設定した日時に自動的に公開されます

## 多言語対応

### 言語バージョンの作成

1. 記事編集画面で右上の言語メニューをクリック
2. 追加したい言語を選択
3. 選択した言語で記事内容を編集
4. 各言語バージョンは個別に保存・管理できます

### 翻訳フロー

管理者によって設定されている場合、自動翻訳フローを使用できます：
1. 記事編集画面で「翻訳を作成」ボタンをクリック
2. 翻訳先の言語を選択
3. 自動翻訳APIを使用して翻訳が生成されます
4. 生成された翻訳を編集・確認し、保存

## トラブルシューティング

### 一般的な問題

1. **ステータス変更ができない**
   - 適切な権限があるか確認
   - 必須フィールドが入力されているか確認

2. **自動通知が届かない**
   - メールサーバーの設定を確認
   - ユーザープロファイルのメールアドレスが正しいか確認

3. **画像アップロードができない**
   - ファイルサイズ制限を確認
   - サポートされているファイル形式か確認

### サポート

さらに詳しい情報やカスタマイズについては、以下を参照してください：
- [Directus公式ドキュメント](https://docs.directus.io/)
- システム管理者に問い合わせ