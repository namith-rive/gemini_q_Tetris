// ゲームループ・状態管理システムのテスト
import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { Game } from '../main.js';
import { Renderer } from '../renderer.js';
import { createMockCanvas } from '../utils/mockCanvas.js';

// Rendererをモック化（実際のCanvas操作をスキップ）
jest.mock('../renderer.js');

describe('Game Class - Main Game Loop & State Management', () => {
  let mockRenderer;
  let mockCanvas;
  let game;

  beforeEach(() => {
    // 各テスト前に新しいモックを作成
    ({ mockCanvas } = createMockCanvas());
    mockRenderer = new Renderer(mockCanvas);
    
    // Rendererのメソッドをモック化
    mockRenderer.clear = jest.fn();
    mockRenderer.drawBoard = jest.fn();
    mockRenderer.drawTetromino = jest.fn();
  });

  describe('Game Class Initialization', () => {
    test('should initialize with a Renderer instance', () => {
      game = new Game(mockRenderer);
      expect(game.renderer).toBe(mockRenderer);
    });

    test('should initialize with correct default state', () => {
      game = new Game(mockRenderer);
      
      // 基本ゲーム状態の確認
      expect(game.score).toBe(0);
      expect(game.level).toBe(1);
      expect(game.lines).toBe(0);
      expect(game.gameOver).toBe(false);
      expect(game.paused).toBe(false);
      
      // ボードの初期状態確認（20行×10列の空配列）
      expect(game.board).toHaveLength(20);
      expect(game.board[0]).toHaveLength(10);
      expect(game.board.flat().every(cell => cell === 0)).toBe(true);
      
      // テトリミノの初期状態
      expect(game.currentTetromino).toBeNull();
      
      // 時間管理の初期状態
      expect(game.lastDropTime).toBe(0);
      expect(game.dropInterval).toBe(1000); // 1秒間隔
    });

    test('should throw an error if no Renderer is provided', () => {
      expect(() => new Game()).toThrow('Renderer instance is required');
    });

    test('should handle invalid Renderer gracefully', () => {
      expect(() => new Game(null)).toThrow('Renderer instance is required');
      expect(() => new Game({})).toThrow('Renderer instance is required');
    });
  });

  describe('Game State Management', () => {
    beforeEach(() => {
      game = new Game(mockRenderer);
    });

    test('should increase score correctly for single line clear', () => {
      const initialScore = game.score;
      const initialLines = game.lines;
      
      // 1ライン消去をシミュレート
      game.addScore(100, 1); // 100点、1ライン
      
      expect(game.score).toBe(initialScore + 100);
      expect(game.lines).toBe(initialLines + 1);
    });

    test('should increase score with different multipliers for multiple lines', () => {
      game.score = 0;
      game.lines = 0;
      
      // 異なるライン数での得点テスト
      game.addScore(100, 1); // シングル: 100点
      expect(game.score).toBe(100);
      
      game.addScore(300, 2); // ダブル: 300点
      expect(game.score).toBe(400);
      
      game.addScore(500, 3); // トリプル: 500点
      expect(game.score).toBe(900);
      
      game.addScore(800, 4); // テトリス: 800点
      expect(game.score).toBe(1700);
    });

    test('should level up after clearing specific number of lines', () => {
      game.lines = 9;
      game.level = 1;
      
      // 10ライン目をクリア（レベルアップ条件）
      game.addScore(100, 1);
      
      expect(game.level).toBe(2);
      expect(game.dropInterval).toBeLessThan(1000); // 落下速度が上がる
    });

    test('should transition to game over state correctly', () => {
      expect(game.gameOver).toBe(false);
      
      game.setGameOver(true);
      
      expect(game.gameOver).toBe(true);
    });

    test('should toggle pause state correctly', () => {
      expect(game.paused).toBe(false);
      
      game.togglePause();
      expect(game.paused).toBe(true);
      
      game.togglePause();
      expect(game.paused).toBe(false);
    });

    test('should reset game state correctly', () => {
      // ゲーム状態を変更
      game.score = 1000;
      game.level = 5;
      game.lines = 50;
      game.gameOver = true;
      game.paused = true;
      
      // リセット実行
      game.reset();
      
      // 初期状態に戻ることを確認
      expect(game.score).toBe(0);
      expect(game.level).toBe(1);
      expect(game.lines).toBe(0);
      expect(game.gameOver).toBe(false);
      expect(game.paused).toBe(false);
      expect(game.currentTetromino).toBeNull();
    });
  });

  describe('Automatic Drop System', () => {
    beforeEach(() => {
      game = new Game(mockRenderer);
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('should update drop timing correctly', () => {
      const currentTime = 1000;
      game.lastDropTime = 0;
      game.dropInterval = 500;
      
      const shouldDrop = game.shouldDropTetromino(currentTime);
      
      expect(shouldDrop).toBe(true);
      expect(game.lastDropTime).toBe(currentTime);
    });

    test('should not drop if interval has not passed', () => {
      const currentTime = 1000;
      game.lastDropTime = 600;
      game.dropInterval = 500;
      
      const shouldDrop = game.shouldDropTetromino(currentTime);
      
      expect(shouldDrop).toBe(false);
      expect(game.lastDropTime).toBe(600); // 変更されない
    });

    test('should adjust drop interval based on level', () => {
      game.level = 1;
      expect(game.getDropInterval()).toBe(1000);
      
      game.level = 2;
      expect(game.getDropInterval()).toBe(800);
      
      game.level = 5;
      expect(game.getDropInterval()).toBe(500);
      
      game.level = 10;
      expect(game.getDropInterval()).toBe(100);
    });

    test('should not update when game is paused', () => {
      game.paused = true;
      const currentTime = 2000;
      game.lastDropTime = 0;
      
      const shouldDrop = game.shouldDropTetromino(currentTime);
      
      expect(shouldDrop).toBe(false);
    });

    test('should not update when game is over', () => {
      game.gameOver = true;
      const currentTime = 2000;
      game.lastDropTime = 0;
      
      const shouldDrop = game.shouldDropTetromino(currentTime);
      
      expect(shouldDrop).toBe(false);
    });
  });

  describe('Tetromino Management', () => {
    beforeEach(() => {
      game = new Game(mockRenderer);
    });

    test('should spawn new tetromino correctly', () => {
      expect(game.currentTetromino).toBeNull();
      
      game.spawnNewTetromino();
      
      expect(game.currentTetromino).not.toBeNull();
      expect(game.currentTetromino.x).toBe(4); // 中央配置
      expect(game.currentTetromino.y).toBe(0); // 上部配置
      expect(['I', 'O', 'T', 'S', 'Z', 'J', 'L']).toContain(game.currentTetromino.type);
    });

    test('should detect game over when tetromino cannot spawn', () => {
      // ボード上部を埋める
      for (let col = 0; col < 10; col++) {
        game.board[0][col] = 1;
        game.board[1][col] = 1;
      }
      
      game.spawnNewTetromino();
      
      expect(game.gameOver).toBe(true);
    });

    test('should fix tetromino to board correctly', () => {
      // テトリミノを生成
      game.spawnNewTetromino();
      const tetromino = game.currentTetromino;
      
      // 底部に移動
      tetromino.y = 18;
      
      // ボードに固定
      game.fixTetrominoToBoard();
      
      // ボードにブロックが固定されたことを確認
      let hasFixedBlocks = false;
      for (let row = 0; row < game.board.length; row++) {
        for (let col = 0; col < game.board[row].length; col++) {
          if (game.board[row][col] !== 0) {
            hasFixedBlocks = true;
            break;
          }
        }
      }
      expect(hasFixedBlocks).toBe(true);
      
      // 新しいテトリミノが生成されることを確認
      expect(game.currentTetromino).not.toBe(tetromino);
    });
  });

  describe('Game Loop Integration', () => {
    beforeEach(() => {
      game = new Game(mockRenderer);
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('should update game state in main loop', () => {
      game.spawnNewTetromino();
      const initialY = game.currentTetromino.y;
      
      // ゲームループを1回実行
      game.update(1000);
      
      // テトリミノが落下したことを確認
      expect(game.currentTetromino.y).toBeGreaterThan(initialY);
    });

    test('should render game state correctly', () => {
      game.spawnNewTetromino();
      
      game.render();
      
      // 描画メソッドが呼ばれたことを確認
      expect(mockRenderer.clear).toHaveBeenCalled();
      expect(mockRenderer.drawBoard).toHaveBeenCalledWith(game.board);
      expect(mockRenderer.drawTetromino).toHaveBeenCalledWith(game.currentTetromino);
    });

    test('should not render when game is paused', () => {
      game.paused = true;
      
      game.render();
      
      // 描画がスキップされることを確認
      expect(mockRenderer.clear).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      game = new Game(mockRenderer);
    });

    test('should handle renderer errors gracefully', () => {
      // 描画エラーをシミュレート
      mockRenderer.clear.mockImplementation(() => {
        throw new Error('Canvas error');
      });
      
      expect(() => game.render()).not.toThrow();
    });

    test('should handle invalid game state gracefully', () => {
      // 無効な状態を設定
      game.level = -1;
      game.score = -100;
      
      expect(() => game.update(1000)).not.toThrow();
      
      // 状態が修正されることを確認
      expect(game.level).toBeGreaterThanOrEqual(1);
      expect(game.score).toBeGreaterThanOrEqual(0);
    });
  });
});
