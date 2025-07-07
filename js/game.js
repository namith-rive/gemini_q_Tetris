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

/**
 * 完成したライン（全てのセルが埋まっている行）を検出する
 * @param {number[][]} board - ゲームボード
 * @returns {number[]} 完成したラインのインデックス配列
 */
export function checkFullLines(board) {
  const fullLines = [];
  
  for (let row = 0; row < board.length; row++) {
    let isFull = true;
    for (let col = 0; col < board[row].length; col++) {
      if (board[row][col] === 0) {
        isFull = false;
        break;
      }
    }
    if (isFull) {
      fullLines.push(row);
    }
  }
  
  return fullLines;
}

/**
 * 指定されたラインをクリア（全てのセルを0にする）
 * @param {number[][]} board - ゲームボード
 * @param {number[]} lineIndices - クリアするラインのインデックス配列
 */
export function clearLines(board, lineIndices) {
  for (const lineIndex of lineIndices) {
    for (let col = 0; col < board[lineIndex].length; col++) {
      board[lineIndex][col] = 0;
    }
  }
}

/**
 * クリアされたライン上のブロックを下に落とす
 * @param {number[][]} board - ゲームボード
 * @param {number[]} clearedLineIndices - クリアされたラインのインデックス配列
 */
export function dropLinesDown(board, clearedLineIndices) {
  if (clearedLineIndices.length === 0) {
    return;
  }
  
  const clearedSet = new Set(clearedLineIndices);
  let writeRow = board.length - 1; // 書き込み位置
  
  // 下から上へチェック
  for (let readRow = board.length - 1; readRow >= 0; readRow--) {
    // クリア対象でない行のみコピー
    if (!clearedSet.has(readRow)) {
      if (writeRow !== readRow) {
        for (let col = 0; col < board[readRow].length; col++) {
          board[writeRow][col] = board[readRow][col];
        }
      }
      writeRow--;
    }
  }
  
  // 上部を空の行で埋める
  for (let row = 0; row <= writeRow; row++) {
    for (let col = 0; col < board[row].length; col++) {
      board[row][col] = 0;
    }
  }
}

/**
 * ライン消去数とレベルからスコアを計算する
 * @param {number} linesCleared - 消去したライン数
 * @param {number} level - 現在のレベル
 * @returns {number} 計算されたスコア
 */
export function calculateScore(linesCleared, level) {
  // 無効な入力のチェック
  if (level <= 0 || linesCleared < 0 || linesCleared > 4) {
    return 0;
  }
  
  // ライン数に応じたベースコア
  const baseScores = {
    0: 0,
    1: 100,   // シングル
    2: 300,   // ダブル
    3: 500,   // トリプル
    4: 800    // テトリス
  };
  
  return baseScores[linesCleared] * level;
}
