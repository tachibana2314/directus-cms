/**
 * カスタムフックの例: 記事のスラッグ自動生成と公開通知
 * Directus Extensions SDKを使用したカスタムフック実装
 */
module.exports = function registerHook({ filter, action }, { services, exceptions }) {
  const { ItemsService } = services;
  const { ServiceUnavailableException } = exceptions;
  
  /**
   * フィルターフック: 記事作成時にスラッグを自動生成
   */
  filter('items.create', async (input, { collection }) => {
    // 記事コレクションの場合のみ処理
    if (collection !== 'articles') return input;
    
    // タイトルがあり、スラッグが未設定の場合にスラッグを自動生成
    if (input.title && !input.slug) {
      input.slug = generateSlug(input.title);
    }
    
    return input;
  });
  
  /**
   * アクションフック: 記事が公開されたときに実行
   */
  action('items.update', async ({ item, collection, accountability }) => {
    // 記事コレクションの場合のみ処理
    if (collection !== 'articles') return;
    
    // 記事のステータスが「published」に変更された場合
    if (item.status === 'published') {
      try {
        // 公開日が設定されていない場合、現在の日時を設定
        if (!item.publish_date) {
          const articlesService = new ItemsService('articles', {
            accountability: accountability,
          });
          
          await articlesService.updateOne(item.id, {
            publish_date: new Date().toISOString(),
          });
          
          console.log(`記事ID ${item.id} の公開日時を自動設定しました`);
        }
        
        // カスタム処理の例: 記事公開をログに記録
        console.log(`記事「${item.title}」が公開されました`);
        
        // ここに追加の処理を実装できます
        // - 外部APIを呼び出してSNSに投稿
        // - 検索インデックスの更新
        // - 関連コンテンツの更新
        // など
        
      } catch (error) {
        console.error(`記事ID ${item.id} の処理中にエラーが発生しました:`, error);
      }
    }
  });
  
  /**
   * スラッグを生成するユーティリティ関数
   */
  function generateSlug(text) {
    return String(text)
      .toLowerCase()
      .normalize('NFD') // 発音区別記号を分解
      .replace(/[\u0300-\u036f]/g, '') // 発音区別記号を削除
      .replace(/[^\w\s-]/g, '') // 英数字、アンダースコア、ハイフン、スペース以外を削除
      .trim() // 前後の空白を削除
      .replace(/\s+/g, '-') // スペースをハイフンに置換
      .replace(/-+/g, '-'); // 連続するハイフンを1つに置換
  }
};