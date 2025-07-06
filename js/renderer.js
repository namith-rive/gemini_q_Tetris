/**
 * Tetris ゲーム描画システム
 * Canvas API を使用してゲーム要素を描画する
 * 
 * 主な機能:
 * - ゲームボードの描画
 * - テトリミノの描画
 * - 単一ブロックの描画
 * - Canvas のクリア操作
 * - 色管理システム
 */

/**
 * Renderer クラス - Canvas描画を管理
 * 
 * このクラスは Canvas 要素への描画を担当し、
 * ゲームの視覚的表現を提供します。
 */
export class Renderer {
  /**
   * Renderer のコンストラクタ
   * 
   * @param {HTMLCanvasElement} canvas - 描画対象の Canvas 要素
   * @param {number} blockSize - 1ブロックのピクセルサイズ（デフォルト: 20）
   */
  constructor(canvas, blockSize = 20) {
    // Canvas 要素の保存
    this.canvas = canvas;
    
    // ブロックサイズの設定（1ブロック = blockSize × blockSize ピクセル）
    this.blockSize = blockSize;
    
    // 2D描画コンテキストの取得
    // null チェックを行い、エラーハンドリングを実装
    this.context = null;
    if (canvas && typeof canvas.getContext === 'function') {
      this.context = canvas.getContext('2d');
    }
    
    // デバッグ用: 初期化完了をログ出力
    if (this.context) {
      console.log('Renderer initialized successfully');
    } else {
      console.warn('Renderer initialized without valid context');
    }
  }

  /**
   * 単一ブロックを描画する
   * 
   * @param {number} x - ゲーム座標でのX位置（0から始まる）
   * @param {number} y - ゲーム座標でのY位置（0から始まる）
   * @param {string} color - ブロックの色（CSS色指定）
   */
  drawBlock(x, y, color) {
    // コンテキストが無効な場合は描画をスキップ
    if (!this.context) {
      return;
    }
    
    // 無効な座標の場合は描画をスキップ
    if (typeof x !== 'number' || typeof y !== 'number') {
      return;
    }
    
    // ゲーム座標をピクセル座標に変換
    const pixelX = x * this.blockSize;
    const pixelY = y * this.blockSize;
    
    // 塗りつぶし色を設定
    this.context.fillStyle = color;
    
    // 矩形を描画（x, y, width, height）
    this.context.fillRect(
      pixelX,           // X座標（ピクセル）
      pixelY,           // Y座標（ピクセル）
      this.blockSize,   // 幅（ピクセル）
      this.blockSize    // 高さ（ピクセル）
    );
    
    // デバッグ用: 描画したブロックの情報をログ出力
    // console.log(`Block drawn at (${x}, ${y}) -> (${pixelX}, ${pixelY}) with color ${color}`);
  }

  /**
   * ゲームボード全体を描画する
   * 
   * @param {number[][]} board - ゲームボードの2次元配列
   *                            0: 空のセル, 1以上: ブロックの種類
   */
  drawBoard(board) {
    // ボードが無効な場合は描画をスキップ
    if (!board || !Array.isArray(board)) {
      return;
    }
    
    // ボードの各行をループ処理
    for (let row = 0; row < board.length; row++) {
      // 行が配列でない場合はスキップ
      if (!Array.isArray(board[row])) {
        continue;
      }
      
      // 行の各列をループ処理
      for (let col = 0; col < board[row].length; col++) {
        const blockValue = board[row][col];
        
        // 空のセル（0）は描画しない
        if (blockValue !== 0) {
          // ブロック値に応じた色を取得
          const color = this.getBlockColor(blockValue);
          
          // ブロックを描画
          this.drawBlock(col, row, color);
        }
      }
    }
    
    // デバッグ用: 描画したブロック数をカウント
    const blockCount = board.flat().filter(cell => cell !== 0).length;
    // console.log(`Board drawn with ${blockCount} blocks`);
  }

  /**
   * テトリミノを描画する
   * 
   * @param {Object} tetromino - テトリミノオブジェクト
   * @param {number[][]} tetromino.shape - テトリミノの形状配列
   * @param {number} tetromino.x - X座標
   * @param {number} tetromino.y - Y座標
   * @param {string} tetromino.color - テトリミノの色
   */
  drawTetromino(tetromino) {
    // テトリミノが無効な場合は描画をスキップ
    if (!tetromino) {
      return;
    }
    
    // 必要なプロパティの存在チェック
    const { shape, x, y, color } = tetromino;
    if (!shape || !Array.isArray(shape)) {
      return;
    }
    
    // テトリミノの形状配列をループ処理
    for (let row = 0; row < shape.length; row++) {
      // 行が配列でない場合はスキップ
      if (!Array.isArray(shape[row])) {
        continue;
      }
      
      for (let col = 0; col < shape[row].length; col++) {
        // ブロックが存在する場合のみ描画
        if (shape[row][col] !== 0) {
          // テトリミノの相対座標を絶対座標に変換
          const absoluteX = x + col;
          const absoluteY = y + row;
          
          // ブロックを描画
          this.drawBlock(absoluteX, absoluteY, color);
        }
      }
    }
    
    // デバッグ用: テトリミノの描画情報をログ出力
    // console.log(`Tetromino drawn at (${x}, ${y}) with color ${color}`);
  }

  /**
   * Canvas 全体をクリアする
   * 
   * 次のフレームの描画前に呼び出して、
   * 前のフレームの描画内容を消去します。
   */
  clear() {
    // コンテキストが無効な場合はクリアをスキップ
    if (!this.context || !this.canvas) {
      return;
    }
    
    // Canvas 全体をクリア
    this.context.clearRect(
      0,                    // 開始X座標
      0,                    // 開始Y座標
      this.canvas.width,    // Canvas の幅
      this.canvas.height    // Canvas の高さ
    );
    
    // デバッグ用: クリア操作をログ出力
    // console.log(`Canvas cleared (${this.canvas.width}x${this.canvas.height})`);
  }

  /**
   * ブロック値に応じた色を取得する
   * 
   * @param {number} blockValue - ブロックの値（0: 空, 1以上: ブロック種類）
   * @returns {string} CSS色指定文字列
   */
  getBlockColor(blockValue) {
    // 色マッピングテーブル
    // 各数値に対応する色を定義
    const colorMap = {
      0: 'transparent',  // 空のセル
      1: '#FF0000',      // 赤
      2: '#00FF00',      // 緑
      3: '#0000FF',      // 青
      4: '#FFFF00',      // 黄
      5: '#FF00FF',      // マゼンタ
      6: '#00FFFF',      // シアン
      7: '#FFA500',      // オレンジ
    };
    
    // 無効な値の場合のデフォルト処理
    if (blockValue < 0) {
      return 'transparent';
    }
    
    // マッピングテーブルから色を取得
    // 定義されていない値の場合は白を返す
    return colorMap[blockValue] || '#FFFFFF';
  }

  /**
   * 現在の描画設定を取得する（デバッグ用）
   * 
   * @returns {Object} 描画設定オブジェクト
   */
  getSettings() {
    return {
      blockSize: this.blockSize,
      canvasWidth: this.canvas ? this.canvas.width : null,
      canvasHeight: this.canvas ? this.canvas.height : null,
      hasContext: !!this.context
    };
  }

  /**
   * ブロックサイズを動的に変更する
   * 
   * @param {number} newSize - 新しいブロックサイズ
   */
  setBlockSize(newSize) {
    if (typeof newSize === 'number' && newSize > 0) {
      this.blockSize = newSize;
      console.log(`Block size changed to ${newSize}px`);
    }
  }
}
