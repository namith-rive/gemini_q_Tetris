// ゲームロジックのテスト
import { describe, test, expect, beforeEach } from '@jest/globals';
import { checkCollision, createEmptyBoard } from '../game.js';
import { createTestTetromino } from '../utils/testHelpers.js';

describe('Game Logic', () => {
  describe('Board Management', () => {
    test('should create empty board with correct dimensions', () => {
      const board = createEmptyBoard();
      expect(board).toHaveLength(20); // 高さ20
      expect(board[0]).toHaveLength(10); // 幅10
      
      // 全てのセルが0で初期化されている
      for (let row = 0; row < 20; row++) {
        for (let col = 0; col < 10; col++) {
          expect(board[row][col]).toBe(0);
        }
      }
    });

    test('should create board with custom dimensions', () => {
      const board = createEmptyBoard(8, 15);
      expect(board).toHaveLength(15);
      expect(board[0]).toHaveLength(8);
    });
  });

  describe('Collision Detection', () => {
    let board;
    
    beforeEach(() => {
      board = createEmptyBoard();
    });

    describe('Wall collisions', () => {
      test('should detect left wall collision', () => {
        const shape = [[1,1],[1,1]]; // O-piece
        expect(checkCollision(board, shape, -1, 0)).toBe(true);
      });

      test('should detect right wall collision', () => {
        const shape = [[1,1],[1,1]]; // O-piece
        expect(checkCollision(board, shape, 9, 0)).toBe(true);
      });

      test('should detect floor collision', () => {
        const shape = [[1,1],[1,1]]; // O-piece
        expect(checkCollision(board, shape, 0, 19)).toBe(true);
      });

      test('should not detect collision in valid position', () => {
        const shape = [[1,1],[1,1]]; // O-piece
        expect(checkCollision(board, shape, 4, 10)).toBe(false);
      });
    });

    describe('Block collisions', () => {
      test('should detect collision with existing blocks', () => {
        board[10][5] = 1; // 既存ブロック配置
        const shape = [[1]];
        expect(checkCollision(board, shape, 5, 10)).toBe(true);
      });

      test('should not detect collision with empty space', () => {
        board[10][5] = 1; // 既存ブロック配置
        const shape = [[1]];
        expect(checkCollision(board, shape, 6, 10)).toBe(false);
      });

      test('should detect collision with multiple blocks', () => {
        // L字型の既存ブロック配置
        board[18][3] = 1;
        board[19][3] = 1;
        board[19][4] = 1;
        
        const shape = [[1,1],[1,1]]; // O-piece
        expect(checkCollision(board, shape, 3, 18)).toBe(true);
      });
    });

    describe('Complex shape collisions', () => {
      test('should detect collision with I-piece', () => {
        const shape = [
          [0,0,0,0], 
          [1,1,1,1], 
          [0,0,0,0], 
          [0,0,0,0]
        ];
        
        // 右端での衝突
        expect(checkCollision(board, shape, 7, 0)).toBe(true);
        // 左端での衝突
        expect(checkCollision(board, shape, -1, 0)).toBe(true);
        // 正常な位置
        expect(checkCollision(board, shape, 3, 0)).toBe(false);
      });

      test('should detect collision with T-piece', () => {
        const shape = [
          [0,1,0], 
          [1,1,1], 
          [0,0,0]
        ];
        
        // 既存ブロックとの衝突
        board[1][4] = 1;
        expect(checkCollision(board, shape, 4, 0)).toBe(true);
        
        // 正常な位置
        expect(checkCollision(board, shape, 1, 0)).toBe(false);
      });
    });

    describe('Edge cases', () => {
      test('should handle null shape gracefully', () => {
        expect(() => checkCollision(board, null, 0, 0)).not.toThrow();
        expect(checkCollision(board, null, 0, 0)).toBe(false);
      });

      test('should handle empty shape gracefully', () => {
        expect(() => checkCollision(board, [], 0, 0)).not.toThrow();
        expect(checkCollision(board, [], 0, 0)).toBe(false);
      });

      test('should handle out-of-bounds coordinates', () => {
        const shape = [[1]];
        expect(checkCollision(board, shape, -100, -100)).toBe(true);
        expect(checkCollision(board, shape, 100, 100)).toBe(true);
      });

      test('should handle negative y coordinates correctly', () => {
        const shape = [[1]];
        // 負のY座標でも、ブロックが範囲内にあれば衝突判定
        expect(checkCollision(board, shape, 5, -1)).toBe(false);
      });
    });

    describe('Offset collision detection', () => {
      test('should detect collision with offset', () => {
        const shape = [[1,1],[1,1]]; // O-piece
        
        // オフセットありでの衝突判定
        expect(checkCollision(board, shape, 8, 0, 1, 0)).toBe(true); // 右にオフセット
        expect(checkCollision(board, shape, 0, 18, 0, 1)).toBe(true); // 下にオフセット
        expect(checkCollision(board, shape, 4, 10, 0, 0)).toBe(false); // オフセットなし
      });
    });
  });
});
