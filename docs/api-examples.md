# APIの使用例

Directus CMSは、強力なREST APIとGraphQL APIを提供しています。このドキュメントでは、一般的なAPI利用例を紹介します。

## REST API

### 認証

```bash
# API認証トークンの取得
curl -X POST http://localhost:8055/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin_password"}'
```

レスポンス:
```json
{
  "data": {
    "access_token": "your-access-token",
    "expires": 900000,
    "refresh_token": "your-refresh-token"
  }
}
```

取得したトークンをAuthorizationヘッダーに含めて使用します:
```
Authorization: Bearer your-access-token
```

### 記事の取得

#### 全記事の一覧を取得

```bash
curl -X GET http://localhost:8055/items/articles \
  -H "Authorization: Bearer your-access-token"
```

#### 特定の記事を取得

```bash
curl -X GET http://localhost:8055/items/articles/article-uuid \
  -H "Authorization: Bearer your-access-token"
```

#### フィルタリング

```bash
# カテゴリーでフィルタリング
curl -X GET "http://localhost:8055/items/articles?filter[category_id][_eq]=category-uuid" \
  -H "Authorization: Bearer your-access-token"

# 公開ステータスのみ取得
curl -X GET "http://localhost:8055/items/articles?filter[status][_eq]=published" \
  -H "Authorization: Bearer your-access-token"
```

#### ソートとページネーション

```bash
# 公開日で降順ソート
curl -X GET "http://localhost:8055/items/articles?sort=-publish_date" \
  -H "Authorization: Bearer your-access-token"

# ページネーション
curl -X GET "http://localhost:8055/items/articles?page=1&limit=10" \
  -H "Authorization: Bearer your-access-token"
```

### 記事の作成・更新

#### 新規記事の作成

```bash
curl -X POST http://localhost:8055/items/articles \
  -H "Authorization: Bearer your-access-token" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "新しい記事タイトル",
    "slug": "new-article-slug",
    "content": "<p>記事の内容</p>",
    "status": "draft",
    "category_id": "category-uuid"
  }'
```

#### 記事の更新

```bash
curl -X PATCH http://localhost:8055/items/articles/article-uuid \
  -H "Authorization: Bearer your-access-token" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "更新されたタイトル",
    "status": "published",
    "publish_date": "2025-07-01T10:00:00"
  }'
```

## GraphQL API

GraphQL APIは `/graphql` エンドポイントで利用可能です。

### 認証

RESTと同様に認証トークンを取得し、ヘッダーに含めます：

```bash
# GraphQLクエリの例
curl -X POST http://localhost:8055/graphql \
  -H "Authorization: Bearer your-access-token" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "YOUR_GRAPHQL_QUERY"
  }'
```

### クエリ例

#### 記事一覧を取得

```graphql
query {
  articles {
    id
    title
    slug
    content
    status
    publish_date
    category_id {
      id
      name
    }
  }
}
```

#### 特定の記事の詳細を取得

```graphql
query {
  articles_by_id(id: "article-uuid") {
    id
    title
    slug
    content
    status
    publish_date
    category_id {
      name
      slug
    }
    user_created {
      first_name
      last_name
    }
  }
}
```

#### カテゴリーでフィルタリング

```graphql
query {
  articles(filter: { category_id: { _eq: "category-uuid" } }) {
    id
    title
    slug
  }
}
```

### ミューテーション例

#### 記事を作成

```graphql
mutation {
  create_articles_item(
    data: {
      title: "GraphQLで作成した記事"
      slug: "graphql-created-article"
      content: "<p>GraphQLを使って作成された記事です</p>"
      status: "draft"
    }
  ) {
    id
    title
  }
}
```

#### 記事を更新

```graphql
mutation {
  update_articles_item(
    id: "article-uuid",
    data: {
      title: "GraphQLで更新した記事"
      status: "published"
    }
  ) {
    id
    title
    status
  }
}
```

## その他の機能

### ファイルのアップロード

```bash
# ファイルのアップロード (REST API)
curl -X POST http://localhost:8055/files \
  -H "Authorization: Bearer your-access-token" \
  -F "file=@/path/to/image.jpg"
```

### リレーションシップの処理

```bash
# タグを記事に関連付ける
curl -X POST http://localhost:8055/items/article_tags \
  -H "Authorization: Bearer your-access-token" \
  -H "Content-Type: application/json" \
  -d '{
    "article_id": "article-uuid",
    "tag_id": "tag-uuid"
  }'
```

### リアルタイム更新（WebSockets）

WebSocketsを使用してリアルタイム更新を受信するには、以下のエンドポイントに接続します：

```javascript
// クライアント側のJavaScriptでの例
const socket = new WebSocket('ws://localhost:8055/websocket');

socket.onopen = () => {
  // 認証
  socket.send(JSON.stringify({
    type: 'auth',
    access_token: 'your-access-token'
  }));
  
  // 購読
  socket.send(JSON.stringify({
    type: 'subscribe',
    collection: 'articles'
  }));
};

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('受信データ:', data);
};
```

## 公開API

認証が不要な公開APIを設定することも可能です。詳細は管理画面の「設定 > ロールと権限」で「Public」ロールを設定してください。