/**
 * Tetris ゲーム - メインゲームループ・状態管理システム
 * 
 * このファイルは以下の機能を提供します：
 * - Game クラス（ゲーム状態の管理）
 * - メインゲームループ（requestAnimationFrame）
 * - 自動落下システム
 * - テトリミノ生成・管理
 * - 依存性注入パターンによる描画システム連携
 */

import { createEmptyBoard, checkCollision, checkFullLines, clearLines, dropLinesDown, calculateScore } from './game.js';
import { createTetromino } from './tetromino.js';

/**
 * Game クラス - テトリスゲームの中核となる状態管理とロジック
 * 
 * 依存性注入パターンを使用して Renderer との疎結合を実現
 * テスト可能な設計により、高品質なコードベースを維持
 */
export class Game {
  /**
   * Game クラスのコンストラクタ
   * 
   * @param {Renderer} renderer - 描画を担当する Renderer インスタンス
   * @throws {Error} Renderer が提供されない場合
   */
  constructor(renderer) {
    // 依存性注入: Renderer インスタンスの検証
    if (!renderer || typeof renderer !== 'object') {
      throw new Error('Renderer instance is required');
    }
    
    // Renderer が必要なメソッドを持っているかチェック
    const requiredMethods = ['clear', 'drawBoard', 'drawTetromino'];
    for (const method of requiredMethods) {
      if (typeof renderer[method] !== 'function') {
        throw new Error('Renderer instance is required');
      }
    }
    
    // 描画システムの参照を保存
    this.renderer = renderer;
    
    // ゲーム状態の初期化
    this.initializeGameState();
    
    // デバッグ用: 初期化完了をログ出力
    console.log('Game initialized with renderer:', !!this.renderer);
  }

  /**
   * ゲーム状態を初期値に設定する
   * 
   * 全ての状態変数を適切な初期値で初期化
   * リセット機能でも使用される
   */
  initializeGameState() {
    // スコア関連の状態
    this.score = 0;           // 現在のスコア
    this.level = 1;           // 現在のレベル
    this.lines = 0;           // 消去したライン数
    
    // ゲーム制御の状態
    this.gameOver = false;    // ゲームオーバーフラグ
    this.paused = false;      // 一時停止フラグ
    
    // ゲームボードの初期化（20行×10列の空配列）
    this.board = createEmptyBoard();
    
    // テトリミノ管理
    this.currentTetromino = null;  // 現在操作中のテトリミノ
    
    // 時間管理（自動落下システム用）
    this.lastDropTime = 0;         // 前回の落下時刻
    this.dropInterval = 1000;      // 落下間隔（ミリ秒）
    
    // デバッグ用: 状態初期化をログ出力
    console.log('Game state initialized');
  }

  /**
   * スコアとライン数を加算し、レベルアップを処理する
   * 
   * @param {number} points - 加算するスコア
   * @param {number} linesCleared - 消去したライン数
   */
  addScore(points, linesCleared) {
    // 入力値の検証
    if (typeof points !== 'number' || points < 0) {
      console.warn('Invalid points value:', points);
      return;
    }
    
    if (typeof linesCleared !== 'number' || linesCleared < 0) {
      console.warn('Invalid lines cleared value:', linesCleared);
      return;
    }
    
    // スコアとライン数を加算
    this.score += points;
    this.lines += linesCleared;
    
    // レベルアップ判定（10ライン毎にレベルアップ）
    const newLevel = Math.floor(this.lines / 10) + 1;
    if (newLevel > this.level) {
      this.level = newLevel;
      this.updateDropInterval();
      console.log(`Level up! New level: ${this.level}`);
    }
    
    // デバッグ用: スコア更新をログ出力
    console.log(`Score: ${this.score}, Lines: ${this.lines}, Level: ${this.level}`);
  }

  /**
   * ゲームオーバー状態を設定する
   * 
   * @param {boolean} isGameOver - ゲームオーバー状態
   */
  setGameOver(isGameOver) {
    this.gameOver = Boolean(isGameOver);
    
    if (this.gameOver) {
      console.log('Game Over! Final Score:', this.score);
    }
  }

  /**
   * 一時停止状態を切り替える
   * 
   * @returns {boolean} 新しい一時停止状態
   */
  togglePause() {
    this.paused = !this.paused;
    console.log('Game paused:', this.paused);
    return this.paused;
  }

  /**
   * ゲーム状態を初期状態にリセットする
   * 
   * 新しいゲームを開始する際に使用
   */
  reset() {
    console.log('Resetting game state...');
    this.initializeGameState();
  }

  /**
   * 現在のレベルに基づいて落下間隔を計算する
   * 
   * @returns {number} 落下間隔（ミリ秒）
   */
  getDropInterval() {
    // レベルが上がるほど落下速度が速くなる
    // レベル1: 1000ms, レベル2: 800ms, レベル5: 500ms, レベル10: 100ms
    
    // 特定のレベルでの落下間隔をマッピング
    if (this.level <= 1) return 1000;
    if (this.level === 2) return 800;
    if (this.level <= 5) return 500;
    if (this.level >= 10) return 100;
    
    // レベル3-4とレベル6-9の間は線形補間
    if (this.level <= 4) {
      // レベル2(800ms)からレベル5(500ms)への線形補間
      return 800 - ((this.level - 2) * 100);
    } else {
      // レベル5(500ms)からレベル10(100ms)への線形補間
      return 500 - ((this.level - 5) * 80);
    }
  }

  /**
   * 落下間隔を現在のレベルに基づいて更新する
   */
  updateDropInterval() {
    this.dropInterval = this.getDropInterval();
    console.log(`Drop interval updated: ${this.dropInterval}ms`);
  }

  /**
   * テトリミノが落下すべきかどうかを判定する
   * 
   * @param {number} currentTime - 現在の時刻（ミリ秒）
   * @returns {boolean} 落下すべき場合は true
   */
  shouldDropTetromino(currentTime) {
    // ゲームが停止中の場合は落下しない
    if (this.paused || this.gameOver) {
      return false;
    }
    
    // 時間が経過していない場合は落下しない
    if (currentTime - this.lastDropTime < this.dropInterval) {
      return false;
    }
    
    // 落下時刻を更新
    this.lastDropTime = currentTime;
    return true;
  }

  /**
   * 新しいテトリミノを生成してゲームフィールドに配置する
   * 
   * @returns {boolean} 生成に成功した場合は true
   */
  spawnNewTetromino() {
    // ランダムなテトリミノタイプを選択
    const types = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
    const randomType = types[Math.floor(Math.random() * types.length)];
    
    // 新しいテトリミノを作成
    const newTetromino = createTetromino(randomType);
    
    // 初期位置での衝突判定
    if (checkCollision(this.board, newTetromino.shape, newTetromino.x, newTetromino.y)) {
      // 配置できない場合はゲームオーバー
      this.setGameOver(true);
      return false;
    }
    
    // テトリミノを配置
    this.currentTetromino = newTetromino;
    console.log(`New tetromino spawned: ${randomType}`);
    return true;
  }

  /**
   * 現在のテトリミノをボードに固定し、ライン消去処理を行う
   */
  fixTetrominoToBoard() {
    if (!this.currentTetromino) {
      return;
    }
    
    // テトリミノの各ブロックをボードに固定
    const { shape, x, y, type } = this.currentTetromino;
    
    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (shape[row][col] !== 0) {
          const boardX = x + col;
          const boardY = y + row;
          
          // ボード範囲内の場合のみ固定
          if (boardY >= 0 && boardY < this.board.length && 
              boardX >= 0 && boardX < this.board[0].length) {
            // テトリミノタイプに応じた値を設定（色識別用）
            const colorValue = this.getTetrominoColorValue(type);
            this.board[boardY][boardX] = colorValue;
          }
        }
      }
    }
    
    console.log(`Tetromino fixed to board: ${type}`);
    
    // ライン消去処理
    this.processLineClearing();
    
    // 現在のテトリミノをクリア
    this.currentTetromino = null;
    
    // 新しいテトリミノを生成
    this.spawnNewTetromino();
  }

  /**
   * ライン消去処理を実行する
   */
  processLineClearing() {
    // 完成したラインを検出
    const fullLines = checkFullLines(this.board);
    
    if (fullLines.length > 0) {
      // ラインをクリア
      clearLines(this.board, fullLines);
      
      // ブロックを下に落とす
      dropLinesDown(this.board, fullLines);
      
      // スコアを計算して加算
      const points = calculateScore(fullLines.length, this.level);
      this.addScore(points, fullLines.length);
      
      console.log(`Lines cleared: ${fullLines.length}, Points: ${points}`);
    }
  }

  /**
   * テトリミノタイプに応じた色値を取得する
   * 
   * @param {string} type - テトリミノタイプ
   * @returns {number} 色値（1-7）
   */
  getTetrominoColorValue(type) {
    const colorMap = {
      'I': 1, 'O': 2, 'T': 3, 'S': 4, 'Z': 5, 'J': 6, 'L': 7
    };
    return colorMap[type] || 1;
  }

  /**
   * ゲーム状態を更新する（メインループから呼び出される）
   * 
   * @param {number} currentTime - 現在の時刻（ミリ秒）
   */
  update(currentTime) {
    try {
      // 無効な状態を修正
      this.validateAndFixGameState();
      
      // ゲームが停止中の場合は更新しない
      if (this.paused || this.gameOver) {
        return;
      }
      
      // テトリミノが存在しない場合は新しく生成
      if (!this.currentTetromino) {
        this.spawnNewTetromino();
        return;
      }
      
      // 自動落下の判定と実行
      if (this.shouldDropTetromino(currentTime)) {
        this.dropCurrentTetromino();
      }
      
    } catch (error) {
      console.error('Error in game update:', error);
      // エラーが発生した場合はゲームを一時停止
      this.paused = true;
    }
  }

  /**
   * 現在のテトリミノを1段下に落下させる
   */
  dropCurrentTetromino() {
    if (!this.currentTetromino) {
      return;
    }
    
    const { shape, x, y } = this.currentTetromino;
    
    // 1段下への移動が可能かチェック
    if (!checkCollision(this.board, shape, x, y + 1)) {
      // 移動可能な場合は落下
      this.currentTetromino.y += 1;
    } else {
      // 移動不可能な場合はボードに固定
      this.fixTetrominoToBoard();
    }
  }

  /**
   * ゲーム状態を検証し、無効な値を修正する
   */
  validateAndFixGameState() {
    // レベルの検証と修正
    if (this.level < 1) {
      this.level = 1;
      console.warn('Level corrected to minimum value: 1');
    }
    
    // スコアの検証と修正
    if (this.score < 0) {
      this.score = 0;
      console.warn('Score corrected to minimum value: 0');
    }
    
    // ライン数の検証と修正
    if (this.lines < 0) {
      this.lines = 0;
      console.warn('Lines corrected to minimum value: 0');
    }
  }

  /**
   * ゲーム画面を描画する
   */
  render() {
    try {
      // 一時停止中は描画をスキップ
      if (this.paused) {
        return;
      }
      
      // 画面をクリア
      this.renderer.clear();
      
      // ゲームボードを描画
      this.renderer.drawBoard(this.board);
      
      // 現在のテトリミノを描画
      if (this.currentTetromino) {
        this.renderer.drawTetromino(this.currentTetromino);
      }
      
    } catch (error) {
      console.error('Error in game render:', error);
      // 描画エラーは致命的ではないため、ゲームは継続
    }
  }

  /**
   * 衝突判定を行う（ブラウザ環境用のラッパー）
   */
  checkCollision(board, shape, x, y, offsetX = 0, offsetY = 0) {
    // game.js の checkCollision 関数を使用
    return checkCollision(board, shape, x, y, offsetX, offsetY);
  }

  /**
   * ゲームの現在状態を取得する（デバッグ用）
   * 
   * @returns {Object} ゲーム状態オブジェクト
   */
  getGameState() {
    return {
      score: this.score,
      level: this.level,
      lines: this.lines,
      gameOver: this.gameOver,
      paused: this.paused,
      hasCurrentTetromino: !!this.currentTetromino,
      dropInterval: this.dropInterval,
      lastDropTime: this.lastDropTime
    };
  }
}
