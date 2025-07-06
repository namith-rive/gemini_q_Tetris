# Tetris Game - Gemini & Amazon Q Collaboration

HTML5 Canvas + Vanilla JavaScriptを使用したブラウザベースのテトリスゲーム。
TDD（テスト駆動開発）アプローチによる高品質実装。

## 🎮 ゲーム実行

```bash
# ローカルサーバー起動
python3 -m http.server 8080

# ブラウザでアクセス
http://localhost:8080
```

## 🎯 操作方法

- **左移動**: ← キー
- **右移動**: → キー  
- **回転**: ↑ キー
- **ソフトドロップ**: ↓ キー
- **一時停止**: P キー
- **リスタート**: R キー

## 🧪 テスト実行

```bash
# 単体テスト
npm test

# ブラウザテスト
npm run test:browser

# 全テスト実行
npm run test:all
```

## 📊 開発状況

- ✅ **Phase 1 MVP**: 完了（67単体テスト + 12E2Eテスト 全て通過）
- 🚧 **Phase 2**: ライン消去・スコア計算・レベルアップ（次のステップ）
- 📋 **Phase 3**: UX向上機能（将来実装）

## 📁 ファイル構成

```
gemini_q_Tetris/
├── index.html              // メインHTMLファイル
├── style.css               // スタイルシート
├── js/                     // JavaScriptファイル群
│   ├── main.js            // メインゲームループ
│   ├── game.js            // ゲームロジック
│   ├── tetromino.js       // テトリミノ定義
│   ├── renderer.js        // 描画処理
│   └── app.js             // ブラウザ統合
├── tests/                  // テストファイル群
├── docs/                   // 設計ドキュメント
├── tetris_tasklist.md     // 統合タスクリスト
├── PROGRESS.md            // 進捗記録
└── TESTING.md             // テスト環境ガイド
```

## 🏆 プロジェクトの特徴

1. **完全なTDD**: テスト駆動開発による高品質実装
2. **AI協働開発**: Gemini AIとAmazon Qのペアプログラミング
3. **包括的テスト**: 単体テスト + E2Eテストの完全カバレッジ
4. **モダン技術**: ES6モジュール、Canvas API、Playwright
5. **段階的開発**: MVP → 機能拡張 → UX向上

## 📈 開発統計

- **テスト**: 79テスト全て通過 ✅
- **対応ブラウザ**: Chrome, Firefox, Safari, Mobile
- **開発時間**: 約18時間
- **コード行数**: ~2,500行（テスト・ドキュメント含む）

## 📚 ドキュメント

- **tetris_tasklist.md**: 統合タスクリスト（開発計画・進捗管理）
- **PROGRESS.md**: 進捗記録（日次更新）
- **TESTING.md**: テスト環境ガイド（実行方法・デバッグ）
- **docs/tetris_specification.md**: 技術仕様書（アーキテクチャ・設計）

---

**Created through collaboration between Gemini AI and Amazon Q**
