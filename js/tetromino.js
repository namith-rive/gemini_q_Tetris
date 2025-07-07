// テトリミノシステム - 最小実装

// テトリミノの形状と色の定義
export const TETROMINOS = {
  'I': {
    color: 'cyan',
    shapes: [
      // 0度
      [
        [0,0,0,0], 
        [1,1,1,1], 
        [0,0,0,0], 
        [0,0,0,0]
      ],
      // 90度
      [
        [0,0,1,0], 
        [0,0,1,0], 
        [0,0,1,0], 
        [0,0,1,0]
      ],
      // 180度
      [
        [0,0,0,0], 
        [0,0,0,0], 
        [1,1,1,1], 
        [0,0,0,0]
      ],
      // 270度
      [
        [0,1,0,0], 
        [0,1,0,0], 
        [0,1,0,0], 
        [0,1,0,0]
      ]
    ]
  },
  'O': {
    color: 'yellow',
    shapes: [
      // 全回転で同じ形状
      [[1,1], [1,1]],
      [[1,1], [1,1]],
      [[1,1], [1,1]],
      [[1,1], [1,1]]
    ]
  },
  'T': {
    color: 'purple',
    shapes: [
      // 0度
      [
        [0,1,0], 
        [1,1,1], 
        [0,0,0]
      ],
      // 90度
      [
        [0,1,0], 
        [0,1,1], 
        [0,1,0]
      ],
      // 180度
      [
        [0,0,0], 
        [1,1,1], 
        [0,1,0]
      ],
      // 270度
      [
        [0,1,0], 
        [1,1,0], 
        [0,1,0]
      ]
    ]
  },
  'S': {
    color: 'green',
    shapes: [
      // 0度
      [
        [0,1,1], 
        [1,1,0], 
        [0,0,0]
      ],
      // 90度
      [
        [0,1,0], 
        [0,1,1], 
        [0,0,1]
      ],
      // 180度
      [
        [0,0,0], 
        [0,1,1], 
        [1,1,0]
      ],
      // 270度
      [
        [1,0,0], 
        [1,1,0], 
        [0,1,0]
      ]
    ]
  },
  'Z': {
    color: 'red',
    shapes: [
      // 0度
      [
        [1,1,0], 
        [0,1,1], 
        [0,0,0]
      ],
      // 90度
      [
        [0,0,1], 
        [0,1,1], 
        [0,1,0]
      ],
      // 180度
      [
        [0,0,0], 
        [1,1,0], 
        [0,1,1]
      ],
      // 270度
      [
        [0,1,0], 
        [1,1,0], 
        [1,0,0]
      ]
    ]
  },
  'J': {
    color: 'blue',
    shapes: [
      // 0度
      [
        [1,0,0], 
        [1,1,1], 
        [0,0,0]
      ],
      // 90度
      [
        [0,1,1], 
        [0,1,0], 
        [0,1,0]
      ],
      // 180度
      [
        [0,0,0], 
        [1,1,1], 
        [0,0,1]
      ],
      // 270度
      [
        [0,1,0], 
        [0,1,0], 
        [1,1,0]
      ]
    ]
  },
  'L': {
    color: 'orange',
    shapes: [
      // 0度
      [
        [0,0,1], 
        [1,1,1], 
        [0,0,0]
      ],
      // 90度
      [
        [0,1,0], 
        [0,1,0], 
        [0,1,1]
      ],
      // 180度
      [
        [0,0,0], 
        [1,1,1], 
        [1,0,0]
      ],
      // 270度
      [
        [1,1,0], 
        [0,1,0], 
        [0,1,0]
      ]
    ]
  }
};

/**
 * 新しいテトリミノを作成する
 * @param {string} type - テトリミノの種類 ('I', 'O', 'T', 'S', 'Z', 'J', 'L')
 * @returns {Object} テトリミノオブジェクト
 */
export function createTetromino(type) {
  // 無効なタイプの場合はI-pieceをデフォルトとする
  if (!TETROMINOS[type]) {
    type = 'I';
  }

  return {
    type,
    shape: TETROMINOS[type].shapes[0], // 初期回転状態
    color: TETROMINOS[type].color,
    x: 4, // ゲームフィールドの中央 (10幅の場合)
    y: 0, // 上部
    rotation: 0 // 初期回転状態
  };
}

/**
 * テトリミノを移動させる（元のオブジェクトは変更しない）
 * @param {Object} tetromino - 移動させるテトリミノ
 * @param {string} direction - 移動方向 ('left', 'right', 'down')
 * @returns {Object} 移動後の新しいテトリミノオブジェクト
 */
export function moveTetromino(tetromino, direction) {
  // 元のオブジェクトをコピー
  const newTetromino = { ...tetromino };

  switch (direction) {
    case 'left':
      newTetromino.x -= 1;
      break;
    case 'right':
      newTetromino.x += 1;
      break;
    case 'down':
      newTetromino.y += 1;
      break;
    default:
      // 無効な方向の場合は移動しない
      break;
  }

  return newTetromino;
}

/**
 * テトリミノを回転させる（元のオブジェクトは変更しない）
 * @param {Object} tetromino - 回転させるテトリミノ
 * @param {string} direction - 回転方向 ('right', 'left')
 * @returns {Object} 回転後の新しいテトリミノオブジェクト
 */
export function rotateTetromino(tetromino, direction = 'right') {
  // 元のオブジェクトをコピー
  const newTetromino = { ...tetromino };
  
  // 現在の回転状態を取得
  let newRotation = tetromino.rotation;
  
  // 回転方向に応じて新しい回転状態を計算
  if (direction === 'right') {
    newRotation = (newRotation + 1) % 4;
  } else if (direction === 'left') {
    newRotation = (newRotation + 3) % 4; // 左回転は右回転3回と同じ
  }
  
  // 新しい回転状態を設定
  newTetromino.rotation = newRotation;
  newTetromino.shape = TETROMINOS[tetromino.type].shapes[newRotation];
  
  return newTetromino;
}
