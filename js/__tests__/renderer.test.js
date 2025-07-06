// 描画システムのテスト
import { describe, test, expect, beforeEach } from '@jest/globals';
import { Renderer } from '../renderer.js';
import { createMockCanvas } from '../utils/mockCanvas.js';
import { createEmptyBoard } from '../utils/testHelpers.js';

describe('Renderer', () => {
  let renderer;
  let mockCanvas;
  let mockContext;

  beforeEach(() => {
    ({ mockCanvas, mockContext } = createMockCanvas());
    renderer = new Renderer(mockCanvas);
  });

  describe('Initialization', () => {
    test('should initialize with canvas and context', () => {
      expect(renderer.canvas).toBe(mockCanvas);
      expect(renderer.context).toBe(mockContext);
      expect(renderer.blockSize).toBe(20); // デフォルトブロックサイズ
    });

    test('should handle null canvas gracefully', () => {
      expect(() => new Renderer(null)).not.toThrow();
    });

    test('should handle canvas without context gracefully', () => {
      mockCanvas.getContext.mockReturnValue(null);
      expect(() => new Renderer(mockCanvas)).not.toThrow();
    });
  });

  describe('Block rendering', () => {
    test('should call fillRect with correct parameters for single block', () => {
      const x = 2;
      const y = 3;
      const color = 'blue';

      renderer.drawBlock(x, y, color);

      expect(mockContext.fillStyle).toBe(color);
      expect(mockContext.fillRect).toHaveBeenCalledWith(
        x * 20, // x * blockSize
        y * 20, // y * blockSize
        20,     // blockSize
        20      // blockSize
      );
    });

    test('should draw block with custom block size', () => {
      renderer.blockSize = 30;
      const x = 1;
      const y = 2;
      const color = 'red';

      renderer.drawBlock(x, y, color);

      expect(mockContext.fillRect).toHaveBeenCalledWith(30, 60, 30, 30);
    });

    test('should handle invalid coordinates gracefully', () => {
      expect(() => renderer.drawBlock(-1, -1, 'blue')).not.toThrow();
      expect(() => renderer.drawBlock(null, null, 'blue')).not.toThrow();
    });
  });

  describe('Board rendering', () => {
    test('should render empty board without drawing blocks', () => {
      const board = createEmptyBoard(3, 3);
      
      renderer.drawBoard(board);
      
      expect(mockContext.fillRect).not.toHaveBeenCalled();
    });

    test('should render board with blocks correctly', () => {
      const board = [
        [0, 1, 0],
        [1, 1, 1],
        [0, 0, 0]
      ];

      renderer.drawBoard(board);

      // 非ゼロブロックの数だけfillRectが呼ばれる
      expect(mockContext.fillRect).toHaveBeenCalledTimes(4);
      
      // 特定の位置のブロックが描画されることを確認
      expect(mockContext.fillRect).toHaveBeenCalledWith(20, 0, 20, 20); // [0][1]
      expect(mockContext.fillRect).toHaveBeenCalledWith(0, 20, 20, 20);  // [1][0]
      expect(mockContext.fillRect).toHaveBeenCalledWith(20, 20, 20, 20); // [1][1]
      expect(mockContext.fillRect).toHaveBeenCalledWith(40, 20, 20, 20); // [1][2]
    });

    test('should use different colors for different block values', () => {
      const board = [
        [1, 2, 0],
        [0, 3, 0]
      ];

      renderer.drawBoard(board);

      expect(mockContext.fillRect).toHaveBeenCalledTimes(3);
    });

    test('should handle null board gracefully', () => {
      expect(() => renderer.drawBoard(null)).not.toThrow();
      expect(mockContext.fillRect).not.toHaveBeenCalled();
    });
  });

  describe('Tetromino rendering', () => {
    test('should render tetromino at correct position', () => {
      const tetromino = {
        shape: [[1, 1], [1, 1]], // O-piece
        x: 3,
        y: 5,
        color: 'yellow'
      };

      renderer.drawTetromino(tetromino);

      expect(mockContext.fillStyle).toBe('yellow');
      expect(mockContext.fillRect).toHaveBeenCalledTimes(4);
      
      // テトリミノの各ブロックが正しい位置に描画される
      expect(mockContext.fillRect).toHaveBeenCalledWith(60, 100, 20, 20); // (3,5)
      expect(mockContext.fillRect).toHaveBeenCalledWith(80, 100, 20, 20); // (4,5)
      expect(mockContext.fillRect).toHaveBeenCalledWith(60, 120, 20, 20); // (3,6)
      expect(mockContext.fillRect).toHaveBeenCalledWith(80, 120, 20, 20); // (4,6)
    });

    test('should handle null tetromino gracefully', () => {
      expect(() => renderer.drawTetromino(null)).not.toThrow();
      expect(mockContext.fillRect).not.toHaveBeenCalled();
    });

    test('should handle tetromino without shape gracefully', () => {
      const tetromino = { x: 0, y: 0, color: 'blue' };
      expect(() => renderer.drawTetromino(tetromino)).not.toThrow();
    });
  });

  describe('Canvas operations', () => {
    test('should clear canvas correctly', () => {
      renderer.clear();
      
      expect(mockContext.clearRect).toHaveBeenCalledWith(
        0, 0, mockCanvas.width, mockCanvas.height
      );
    });

    test('should handle clear without context gracefully', () => {
      renderer.context = null;
      expect(() => renderer.clear()).not.toThrow();
    });
  });

  describe('Color management', () => {
    test('should get color for block value', () => {
      expect(renderer.getBlockColor(1)).toBe('#FF0000'); // 赤
      expect(renderer.getBlockColor(2)).toBe('#00FF00'); // 緑
      expect(renderer.getBlockColor(0)).toBe('transparent'); // 透明
    });

    test('should handle invalid block values', () => {
      expect(renderer.getBlockColor(-1)).toBe('transparent');
      expect(renderer.getBlockColor(999)).toBe('#FFFFFF'); // デフォルト白
    });
  });
});
