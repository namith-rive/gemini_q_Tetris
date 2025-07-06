// ゲームロジック - 最小実装

// ゲーム定数
export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;

/**
 * 空のゲームボードを作成する
 * @param {number} width - ボードの幅 (デフォルト: 10)
 * @param {number} height - ボードの高さ (デフォルト: 20)
 * @returns {number[][]} 空のボード (0で初期化)
 */
export function createEmptyBoard(width = BOARD_WIDTH, height = BOARD_HEIGHT) {
  return Array(height).fill().map(() => Array(width).fill(0));
}

/**
 * 衝突判定を行う
 * @param {number[][]} board - ゲームボード
 * @param {number[][]} shape - テトリミノの形状
 * @param {number} x - X座標
 * @param {number} y - Y座標
 * @param {number} offsetX - X方向のオフセット (デフォルト: 0)
 * @param {number} offsetY - Y方向のオフセット (デフォルト: 0)
 * @returns {boolean} 衝突する場合はtrue
 */
export function checkCollision(board, shape, x, y, offsetX = 0, offsetY = 0) {
  // null や空の形状の場合は衝突しない
  if (!shape || !Array.isArray(shape) || shape.length === 0) {
    return false;
  }

  // 形状の各ブロックをチェック
  for (let row = 0; row < shape.length; row++) {
    for (let col = 0; col < shape[row].length; col++) {
      // ブロックが存在する場合のみチェック
      if (shape[row][col] !== 0) {
        const newX = x + col + offsetX;
        const newY = y + row + offsetY;

        // 境界チェック
        if (newX < 0 || newX >= board[0].length || newY >= board.length) {
          return true; // 境界外は衝突
        }

        // 既存ブロックとの衝突チェック (Y座標が負の場合はスキップ)
        if (newY >= 0 && board[newY][newX] !== 0) {
          return true; // 既存ブロックとの衝突
        }
      }
    }
  }

  return false; // 衝突なし
}
