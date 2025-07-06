// テトリミノシステムのテスト
import { describe, test, expect, beforeEach } from '@jest/globals';
import { TETROMINOS, createTetromino, moveTetromino } from '../tetromino.js';

describe('Tetromino System', () => {
  describe('Shape definitions', () => {
    test('I-piece should have correct shape and color', () => {
      const iPiece = TETROMINOS['I'];
      expect(iPiece.color).toBe('cyan');
      expect(iPiece.shapes[0]).toEqual([
        [0,0,0,0], 
        [1,1,1,1], 
        [0,0,0,0], 
        [0,0,0,0]
      ]);
    });

    test('O-piece should have correct shape and color', () => {
      const oPiece = TETROMINOS['O'];
      expect(oPiece.color).toBe('yellow');
      expect(oPiece.shapes[0]).toEqual([
        [1,1], 
        [1,1]
      ]);
    });

    test('all 7 tetromino types should be defined', () => {
      const types = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
      types.forEach(type => {
        expect(TETROMINOS[type]).toBeDefined();
        expect(TETROMINOS[type].color).toBeDefined();
        expect(TETROMINOS[type].shapes).toHaveLength(4); // 4回転
      });
    });

    test('each tetromino should have 4 rotation states', () => {
      Object.keys(TETROMINOS).forEach(type => {
        expect(TETROMINOS[type].shapes).toHaveLength(4);
        TETROMINOS[type].shapes.forEach(shape => {
          expect(Array.isArray(shape)).toBe(true);
          expect(shape.length).toBeGreaterThan(0);
        });
      });
    });
  });

  describe('Tetromino creation', () => {
    test('should create tetromino with correct properties', () => {
      const tetromino = createTetromino('I');
      
      expect(tetromino.type).toBe('I');
      expect(tetromino.shape).toEqual(TETROMINOS['I'].shapes[0]);
      expect(tetromino.color).toBe('cyan');
      expect(tetromino.x).toBe(4); // 中央配置
      expect(tetromino.y).toBe(0); // 上部配置
      expect(tetromino.rotation).toBe(0);
    });

    test('should handle invalid tetromino type gracefully', () => {
      expect(() => createTetromino('INVALID')).not.toThrow();
      const tetromino = createTetromino('INVALID');
      expect(tetromino).toBeDefined();
    });
  });

  describe('Tetromino movement', () => {
    let tetromino;

    beforeEach(() => {
      tetromino = createTetromino('I');
    });

    test('should move tetromino left correctly', () => {
      const moved = moveTetromino(tetromino, 'left');
      expect(moved.x).toBe(tetromino.x - 1);
      expect(moved.y).toBe(tetromino.y);
      expect(moved.type).toBe(tetromino.type);
    });

    test('should move tetromino right correctly', () => {
      const moved = moveTetromino(tetromino, 'right');
      expect(moved.x).toBe(tetromino.x + 1);
      expect(moved.y).toBe(tetromino.y);
    });

    test('should move tetromino down correctly', () => {
      const moved = moveTetromino(tetromino, 'down');
      expect(moved.x).toBe(tetromino.x);
      expect(moved.y).toBe(tetromino.y + 1);
    });

    test('should not modify original tetromino', () => {
      const originalX = tetromino.x;
      const originalY = tetromino.y;
      
      moveTetromino(tetromino, 'left');
      
      expect(tetromino.x).toBe(originalX);
      expect(tetromino.y).toBe(originalY);
    });

    test('should handle invalid direction gracefully', () => {
      const moved = moveTetromino(tetromino, 'invalid');
      expect(moved.x).toBe(tetromino.x);
      expect(moved.y).toBe(tetromino.y);
    });
  });
});
