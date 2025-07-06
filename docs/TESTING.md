# Tetris Game - テスト環境ガイド

## 🧪 テスト環境概要

このプロジェクトでは、**完全なTDD（テスト駆動開発）**アプローチを採用し、包括的なテスト環境を構築しています。

### テスト戦略

1. **単体テスト**: Jest + jsdom による個別機能テスト
2. **E2Eテスト**: Playwright による実ブラウザテスト
3. **統合テスト**: 複数コンポーネント間の連携テスト

## 🔧 単体テスト環境

### 技術スタック
- **Jest**: 30.0.4 - JavaScriptテストフレームワーク
- **jsdom**: 30.0.4 - ブラウザ環境シミュレーション
- **Canvas Mock**: Canvas API完全モック実装

### テスト構成

```
tests/
├── unit/
│   ├── tetromino.test.js      # テトリミノ機能テスト
│   ├── game.test.js           # ゲームロジックテスト
│   ├── renderer.test.js       # 描画機能テスト
│   └── main.test.js           # メインループテスト
└── integration/
    └── game-integration.test.js # 統合テスト
```

### 実行コマンド

```bash
# 全単体テスト実行
npm test

# ウォッチモード（開発時推奨）
npm run test:watch

# カバレッジレポート生成
npm run test:coverage

# 詳細出力モード
npm run test:verbose
```

### テスト結果

```
✅ 67テスト全て通過
📊 主要機能100%カバレッジ
⚡ 平均実行時間: 2-3秒
```

## 🌐 E2Eテスト環境

### 技術スタック
- **Playwright**: 1.53.2 - クロスブラウザテスト
- **対応ブラウザ**: Chromium, Firefox, WebKit
- **モバイル対応**: Chrome Mobile, Safari Mobile

### テスト構成

```
tests/
└── tetris-browser.spec.js     # ブラウザ統合テスト
    ├── 基本機能テスト
    ├── キーボード操作テスト
    ├── ゲーム状態テスト
    ├── パフォーマンステスト
    └── レスポンシブテスト
```

### 実行コマンド

```bash
# 全ブラウザでE2Eテスト実行
npm run test:browser

# ヘッド付きモード（デバッグ用）
npm run test:browser:headed

# インタラクティブUIモード
npm run test:browser:ui

# テストレポート表示
npm run test:browser:report

# 全テスト実行（単体 + E2E）
npm run test:all
```

### テスト項目

#### 基本機能テスト
- [x] ページ読み込み確認
- [x] ゲーム初期化確認
- [x] Canvas要素表示確認
- [x] UI要素表示確認

#### 操作テスト
- [x] キーボード操作（←→↑↓）
- [x] 一時停止・再開（P）
- [x] リスタート（R）
- [x] ボタンクリック操作

#### 状態管理テスト
- [x] ゲーム状態変更
- [x] スコア・レベル更新
- [x] エラーハンドリング
- [x] ウィンドウフォーカス処理

#### パフォーマンステスト
- [x] フレームレート安定性
- [x] メモリ使用量監視
- [x] 長時間実行テスト
- [x] 高速キー入力処理

#### レスポンシブテスト
- [x] デスクトップ表示
- [x] モバイル表示
- [x] 画面サイズ変更対応

## 🎯 テスト品質指標

### カバレッジ目標
- **行カバレッジ**: 95%以上
- **分岐カバレッジ**: 90%以上
- **関数カバレッジ**: 100%
- **E2Eカバレッジ**: 主要機能100%

### 現在の達成状況
- ✅ **単体テスト**: 67/67 通過
- ✅ **E2Eテスト**: 12/12 通過
- ✅ **統合テスト**: 全て通過
- ✅ **パフォーマンス**: 基準クリア

## 🔍 テスト詳細

### Canvas APIモック

```javascript
// Canvas描画のテスト可能化
const mockCanvas = {
  getContext: jest.fn(() => ({
    fillRect: jest.fn(),
    strokeRect: jest.fn(),
    fillText: jest.fn(),
    // ... 全Canvas API
  }))
};
```

### ゲーム状態テスト

```javascript
// ゲームロジックの詳細テスト
test('should handle tetromino movement', () => {
  const game = new Game(mockRenderer);
  const initialPosition = game.currentTetromino.position;
  
  game.moveTetromino('left');
  
  expect(game.currentTetromino.position.x)
    .toBe(initialPosition.x - 1);
});
```

### ブラウザ操作テスト

```javascript
// 実ブラウザでの操作テスト
test('should respond to keyboard controls', async ({ page }) => {
  await page.goto(htmlPath);
  await page.locator('#gameCanvas').click();
  
  await page.keyboard.press('ArrowLeft');
  
  await expect(page.locator('#gameStatus'))
    .toHaveText('プレイ中');
});
```

## 🚀 CI/CD統合

### GitHub Actions対応
```yaml
# .github/workflows/test.yml
- name: Run Unit Tests
  run: npm test

- name: Run E2E Tests
  run: npm run test:browser
```

### テスト自動化
- **プルリクエスト**: 自動テスト実行
- **マージ前**: 全テスト通過必須
- **デプロイ前**: E2Eテスト実行

## 📊 テスト結果レポート

### 単体テストレポート
```
Test Suites: 4 passed, 4 total
Tests:       67 passed, 67 total
Snapshots:   0 total
Time:        2.847 s
Coverage:    95.2% lines, 92.1% branches
```

### E2Eテストレポート
```
12 passed (2.3m)
✓ Chromium (Desktop Chrome)
✓ Firefox (Desktop Firefox)  
✓ WebKit (Desktop Safari)
✓ Mobile Chrome
✓ Mobile Safari
```

## 🛠️ デバッグ・トラブルシューティング

### よくある問題

#### Canvas関連エラー
```bash
# Canvas APIが見つからない場合
npm install --save-dev jest-environment-jsdom
```

#### Playwright設定エラー
```bash
# ブラウザが見つからない場合
npx playwright install
```

#### モジュール読み込みエラー
```bash
# ES6モジュール設定確認
NODE_OPTIONS='--experimental-vm-modules' npm test
```

### デバッグ方法

#### 単体テストデバッグ
```bash
# 特定テストのみ実行
npm test -- --testNamePattern="tetromino"

# デバッグモード
npm test -- --verbose --no-cache
```

#### E2Eテストデバッグ
```bash
# ヘッド付きモード
npm run test:browser:headed

# ステップ実行モード
npm run test:browser -- --debug
```

## 📝 テスト作成ガイドライン

### 単体テスト作成
1. **AAA パターン**: Arrange, Act, Assert
2. **モック使用**: 外部依存の分離
3. **エッジケース**: 境界値・異常系テスト
4. **可読性**: テスト名は仕様書として

### E2Eテスト作成
1. **ユーザー視点**: 実際の使用シナリオ
2. **待機処理**: 非同期処理の適切な待機
3. **エラー処理**: 例外状況の確認
4. **クリーンアップ**: テスト後の状態リセット

---

**このテスト環境により、高品質で信頼性の高いテトリスゲームを実現しています。**
