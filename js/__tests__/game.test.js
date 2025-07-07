// ゲームロジックのテスト
import { describe, test, expect, beforeEach } from '@jest/globals';
import { checkCollision, createEmptyBoard, checkFullLines, clearLines, dropLinesDown, calculateScore } from '../game.js';
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

  describe('Line Clearing', () => {
    let board;
    
    beforeEach(() => {
      board = createEmptyBoard();
    });

    describe('checkFullLines()', () => {
      test('should return empty array when no full lines exist', () => {
        // 空のボード
        expect(checkFullLines(board)).toEqual([]);
        
        // 一部だけ埋まったボード
        board[19][0] = 1;
        board[19][1] = 1;
        expect(checkFullLines(board)).toEqual([]);
      });

      test('should detect single full line', () => {
        // 最下段を埋める
        for (let col = 0; col < 10; col++) {
          board[19][col] = 1;
        }
        expect(checkFullLines(board)).toEqual([19]);
      });

      test('should detect multiple consecutive full lines (Tetris)', () => {
        // 下から4行を埋める
        for (let row = 16; row < 20; row++) {
          for (let col = 0; col < 10; col++) {
            board[row][col] = 1;
          }
        }
        expect(checkFullLines(board)).toEqual([16, 17, 18, 19]);
      });

      test('should detect multiple non-consecutive full lines', () => {
        // 17行目と19行目を埋める
        for (let col = 0; col < 10; col++) {
          board[17][col] = 1;
          board[19][col] = 1;
        }
        expect(checkFullLines(board)).toEqual([17, 19]);
      });

      test('should not detect almost full lines', () => {
        // 1つだけ空きがある行
        for (let col = 0; col < 9; col++) {
          board[19][col] = 1;
        }
        expect(checkFullLines(board)).toEqual([]);
      });
    });

    describe('clearLines()', () => {
      test('should clear single line', () => {
        // 最下段を埋める
        for (let col = 0; col < 10; col++) {
          board[19][col] = 1;
        }
        
        clearLines(board, [19]);
        
        // 19行目がクリアされている
        for (let col = 0; col < 10; col++) {
          expect(board[19][col]).toBe(0);
        }
      });

      test('should clear multiple lines', () => {
        // 16-19行目を埋める
        for (let row = 16; row < 20; row++) {
          for (let col = 0; col < 10; col++) {
            board[row][col] = 1;
          }
        }
        
        clearLines(board, [16, 17, 18, 19]);
        
        // 指定された行がクリアされている
        for (let row = 16; row < 20; row++) {
          for (let col = 0; col < 10; col++) {
            expect(board[row][col]).toBe(0);
          }
        }
      });

      test('should clear non-consecutive lines', () => {
        // 17行目と19行目を埋める
        for (let col = 0; col < 10; col++) {
          board[17][col] = 1;
          board[19][col] = 1;
        }
        
        clearLines(board, [17, 19]);
        
        // 指定された行がクリアされている
        for (let col = 0; col < 10; col++) {
          expect(board[17][col]).toBe(0);
          expect(board[19][col]).toBe(0);
        }
      });

      test('should handle empty line indices', () => {
        // ボードに何かデータを設定
        board[19][0] = 1;
        const originalBoard = board.map(row => [...row]);
        
        clearLines(board, []);
        
        // ボードが変更されていない
        expect(board).toEqual(originalBoard);
      });
    });

    describe('dropLinesDown()', () => {
      test('should drop lines after single line clear', () => {
        // テストデータ設定：上部にブロック配置
        board[10][5] = 1;
        board[15][3] = 2;
        
        // 最下段をクリア済みと仮定
        dropLinesDown(board, [19]);
        
        // ブロックが1行下に移動
        expect(board[11][5]).toBe(1);
        expect(board[16][3]).toBe(2);
        expect(board[10][5]).toBe(0);
        expect(board[15][3]).toBe(0);
      });

      test('should drop lines after multiple line clear (Tetris)', () => {
        // テストデータ設定
        board[10][5] = 1;
        board[12][3] = 2;
        
        // 下から4行をクリア済みと仮定
        dropLinesDown(board, [16, 17, 18, 19]);
        
        // ブロックが4行下に移動
        expect(board[14][5]).toBe(1);
        expect(board[16][3]).toBe(2);
        expect(board[10][5]).toBe(0);
        expect(board[12][3]).toBe(0);
      });

      test('should handle non-consecutive line clears', () => {
        // テストデータ設定
        board[16][5] = 1; // 17行目と19行目の間
        board[18][3] = 2; // 17行目と19行目の間
        board[10][7] = 3; // 17行目より上
        
        // 17行目と19行目をクリア済みと仮定
        dropLinesDown(board, [17, 19]);
        
        // 適切にドロップされている
        expect(board[18][5]).toBe(1); // 16→18 (1行下)
        expect(board[19][3]).toBe(2); // 18→19 (1行下)
        expect(board[12][7]).toBe(3); // 10→12 (2行下)
      });

      test('should handle empty cleared lines', () => {
        // テストデータ設定
        board[10][5] = 1;
        const originalBoard = board.map(row => [...row]);
        
        dropLinesDown(board, []);
        
        // ボードが変更されていない
        expect(board).toEqual(originalBoard);
      });
    });
  });

  describe('Scoring Logic', () => {
    describe('calculateScore()', () => {
      test('should score 100 points for a single line clear at level 1', () => {
        expect(calculateScore(1, 1)).toBe(100);
      });

      test('should score 300 points for a double line clear at level 1', () => {
        expect(calculateScore(2, 1)).toBe(300);
      });

      test('should score 500 points for a triple line clear at level 1', () => {
        expect(calculateScore(3, 1)).toBe(500);
      });

      test('should score 800 points for a Tetris (4 lines) at level 1', () => {
        expect(calculateScore(4, 1)).toBe(800);
      });

      test('should correctly apply the level multiplier', () => {
        expect(calculateScore(1, 5)).toBe(500); // 100 * 5
        expect(calculateScore(2, 3)).toBe(900); // 300 * 3
        expect(calculateScore(3, 10)).toBe(5000); // 500 * 10
        expect(calculateScore(4, 2)).toBe(1600); // 800 * 2
      });

      test('should return 0 for 0 lines cleared', () => {
        expect(calculateScore(0, 1)).toBe(0);
        expect(calculateScore(0, 10)).toBe(0);
      });

      test('should handle invalid inputs gracefully', () => {
        // 無効なライン数
        expect(calculateScore(-1, 1)).toBe(0); // 負のライン数
        expect(calculateScore(5, 1)).toBe(0);  // 5ラインは一度に消せない
        
        // 無効なレベル
        expect(calculateScore(1, 0)).toBe(0);  // レベル0
        expect(calculateScore(1, -5)).toBe(0); // 負のレベル
      });
    });
  });
});
