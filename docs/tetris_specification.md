# テトリスゲーム - 技術仕様書

## 📋 概要

HTML5 Canvas + Vanilla JavaScriptを使用したブラウザベースのテトリスゲーム。
TDD（テスト駆動開発）アプローチにより、高品質で保守性の高いコードを実現。

## 🎯 基本仕様

### ゲームフィールド
- **サイズ**: 10×20 ブロック
- **Canvas**: 400×800 ピクセル
- **ブロックサイズ**: 40×40 ピクセル
- **座標系**: 左上原点 (0,0)

### テトリミノ仕様
- **種類**: 7種類（I, O, T, S, Z, J, L）
- **回転**: 4方向回転状態
- **色**: 各ピース固有色設定
- **初期位置**: フィールド上部中央

### 操作仕様
- **左移動**: ← キー
- **右移動**: → キー
- **右回転**: ↑ キー
- **ソフトドロップ**: ↓ キー
- **一時停止**: P キー
- **リスタート**: R キー

## 🏗️ アーキテクチャ設計

### モジュール構成

```
js/
├── main.js          // メインゲームループ
├── game.js          // ゲームロジック・状態管理
├── tetromino.js     // テトリミノ定義・操作
├── renderer.js      // Canvas描画システム
├── app.js           // ブラウザ統合・DOM操作
└── utils/
    └── testSetup.js // テスト環境設定
```

### 設計原則
1. **単一責任原則**: 各モジュールは明確な責任を持つ
2. **依存性注入**: テスト可能性を重視した設計
3. **疎結合**: モジュール間の依存を最小化
4. **高凝集**: 関連する機能を適切にグループ化

## 🔧 技術スタック

### 開発環境
- **言語**: JavaScript (ES6+)
- **モジュール**: ES6 Modules
- **描画**: HTML5 Canvas API
- **スタイル**: CSS3

### テスト環境
- **単体テスト**: Jest 30.0.4 + jsdom
- **E2Eテスト**: Playwright 1.53.2
- **対応ブラウザ**: Chromium, Firefox, WebKit
- **モバイル**: Chrome Mobile, Safari Mobile

## 📊 データ構造

### テトリミノ定義
```javascript
const TETROMINOS = {
  I: {
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    color: '#00FFFF'
  },
  // ... 他のテトリミノ
};
```

### ゲーム状態
```javascript
class Game {
  constructor(renderer) {
    this.board = Array(20).fill().map(() => Array(10).fill(0));
    this.currentTetromino = null;
    this.score = 0;
    this.level = 1;
    this.lines = 0;
    this.isRunning = false;
    this.isPaused = false;
  }
}
```

## 🎮 ゲームロジック

### 衝突検出アルゴリズム
```javascript
checkCollision(tetromino, offsetX = 0, offsetY = 0) {
  for (let y = 0; y < tetromino.shape.length; y++) {
    for (let x = 0; x < tetromino.shape[y].length; x++) {
      if (tetromino.shape[y][x]) {
        const newX = tetromino.position.x + x + offsetX;
        const newY = tetromino.position.y + y + offsetY;
        
        // 境界チェック
        if (newX < 0 || newX >= 10 || newY >= 20) return true;
        
        // ブロック衝突チェック
        if (newY >= 0 && this.board[newY][newX]) return true;
      }
    }
  }
  return false;
}
```

### 自動落下システム
```javascript
update() {
  if (!this.isRunning || this.isPaused) return;
  
  this.dropTimer += this.deltaTime;
  if (this.dropTimer >= this.dropInterval) {
    this.dropTetromino();
    this.dropTimer = 0;
  }
}
```

## 🎨 描画システム

### Canvas描画パターン
```javascript
class Renderer {
  drawBlock(x, y, color) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x * 40, y * 40, 40, 40);
    this.ctx.strokeStyle = '#333';
    this.ctx.strokeRect(x * 40, y * 40, 40, 40);
  }
  
  drawBoard(board) {
    for (let y = 0; y < board.length; y++) {
      for (let x = 0; x < board[y].length; x++) {
        if (board[y][x]) {
          this.drawBlock(x, y, board[y][x]);
        }
      }
    }
  }
}
```

## 🧪 テスト戦略

### テスト分類
1. **単体テスト**: 個別モジュールの機能テスト
2. **統合テスト**: モジュール間連携テスト
3. **E2Eテスト**: ブラウザでの実際の動作テスト

### テストカバレッジ目標
- **行カバレッジ**: 95%以上
- **分岐カバレッジ**: 90%以上
- **関数カバレッジ**: 100%

### モック戦略
```javascript
// Canvas APIモック
const mockCanvas = {
  getContext: jest.fn(() => ({
    fillRect: jest.fn(),
    strokeRect: jest.fn(),
    fillText: jest.fn(),
    clearRect: jest.fn()
  }))
};
```

## 🚀 パフォーマンス要件

### フレームレート
- **目標**: 60 FPS
- **最低**: 30 FPS
- **測定**: requestAnimationFrame使用

### メモリ使用量
- **初期**: 10MB以下
- **実行時**: 50MB以下
- **メモリリーク**: なし

### レスポンス時間
- **キー入力**: 16ms以下
- **画面更新**: 16ms以下
- **ゲーム状態更新**: 1ms以下

## 🔒 品質保証

### コード品質
- **ESLint**: コード規約チェック
- **Prettier**: コードフォーマット
- **JSDoc**: ドキュメンテーション

### テスト品質
- **TDD**: テストファースト開発
- **継続的テスト**: ウォッチモード
- **自動化**: CI/CD統合

## 📱 ブラウザ対応

### 対応ブラウザ
- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

### モバイル対応
- **iOS Safari**: 14+
- **Android Chrome**: 90+
- **レスポンシブ**: 320px〜1920px

## 🔧 開発環境

### 必要なツール
```bash
# Node.js 18+
node --version

# npm パッケージ
npm install

# テスト実行
npm test
npm run test:browser

# 開発サーバー
python3 -m http.server 8080
```

### ディレクトリ構造
```
gemini_q_Tetris/
├── index.html
├── style.css
├── js/
├── tests/
├── docs/
└── package.json
```

---

**Created through collaboration between Gemini AI and Amazon Q**
**Version: 1.0.0**
**Last Updated: 2025-07-06**
