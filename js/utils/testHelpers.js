// Test helper functions for Tetris game testing

/**
 * Creates an empty game board
 * @param {number} width - Board width (default: 10)
 * @param {number} height - Board height (default: 20)
 * @returns {number[][]} Empty board filled with zeros
 */
export function createEmptyBoard(width = 10, height = 20) {
  return Array(height).fill().map(() => Array(width).fill(0));
}

/**
 * Creates a board with a completed line at specified index
 * @param {number} lineIndex - Index of the line to complete (default: 19)
 * @param {number} width - Board width (default: 10)
 * @param {number} height - Board height (default: 20)
 * @returns {number[][]} Board with completed line
 */
export function createBoardWithCompletedLine(lineIndex = 19, width = 10, height = 20) {
  const board = createEmptyBoard(width, height);
  board[lineIndex] = Array(width).fill(1); // Fill line with blocks
  return board;
}

/**
 * Creates a board with multiple completed lines
 * @param {number[]} lineIndices - Array of line indices to complete
 * @param {number} width - Board width (default: 10)
 * @param {number} height - Board height (default: 20)
 * @returns {number[][]} Board with multiple completed lines
 */
export function createBoardWithMultipleCompletedLines(lineIndices = [18, 19], width = 10, height = 20) {
  const board = createEmptyBoard(width, height);
  lineIndices.forEach(index => {
    board[index] = Array(width).fill(1);
  });
  return board;
}

/**
 * Creates a test tetromino with specified type
 * @param {string} type - Tetromino type ('I', 'O', 'T', 'S', 'Z', 'J', 'L')
 * @returns {Object} Test tetromino object
 */
export function createTestTetromino(type = 'I') {
  // This will be updated once TETROMINOS is defined
  const mockShapes = {
    'I': [[0,0,0,0], [1,1,1,1], [0,0,0,0], [0,0,0,0]],
    'O': [[1,1], [1,1]],
    'T': [[0,1,0], [1,1,1], [0,0,0]],
    'S': [[0,1,1], [1,1,0], [0,0,0]],
    'Z': [[1,1,0], [0,1,1], [0,0,0]],
    'J': [[1,0,0], [1,1,1], [0,0,0]],
    'L': [[0,0,1], [1,1,1], [0,0,0]]
  };

  const mockColors = {
    'I': 'cyan',
    'O': 'yellow',
    'T': 'purple',
    'S': 'green',
    'Z': 'red',
    'J': 'blue',
    'L': 'orange'
  };

  return {
    type,
    shape: mockShapes[type] || mockShapes['I'],
    color: mockColors[type] || mockColors['I'],
    x: 4,
    y: 0,
    rotation: 0
  };
}

/**
 * Creates a board with specific pattern for testing
 * @param {string} pattern - Pattern type ('almost_full', 'scattered', 'tower')
 * @returns {number[][]} Board with specified pattern
 */
export function createBoardWithPattern(pattern = 'almost_full') {
  const board = createEmptyBoard();
  
  switch (pattern) {
    case 'almost_full':
      // Fill bottom rows except for a few gaps
      for (let row = 15; row < 20; row++) {
        for (let col = 0; col < 10; col++) {
          if (!(row === 19 && col === 9)) { // Leave one gap
            board[row][col] = 1;
          }
        }
      }
      break;
      
    case 'scattered':
      // Random scattered blocks
      for (let row = 10; row < 20; row++) {
        for (let col = 0; col < 10; col++) {
          if (Math.random() > 0.7) {
            board[row][col] = 1;
          }
        }
      }
      break;
      
    case 'tower':
      // Tower on the left side
      for (let row = 10; row < 20; row++) {
        for (let col = 0; col < 3; col++) {
          board[row][col] = 1;
        }
      }
      break;
  }
  
  return board;
}

/**
 * Compares two boards for equality
 * @param {number[][]} board1 - First board
 * @param {number[][]} board2 - Second board
 * @returns {boolean} True if boards are equal
 */
export function boardsEqual(board1, board2) {
  if (board1.length !== board2.length) return false;
  
  for (let row = 0; row < board1.length; row++) {
    if (board1[row].length !== board2[row].length) return false;
    for (let col = 0; col < board1[row].length; col++) {
      if (board1[row][col] !== board2[row][col]) return false;
    }
  }
  
  return true;
}

/**
 * Counts non-zero blocks in a board
 * @param {number[][]} board - Game board
 * @returns {number} Number of filled blocks
 */
export function countFilledBlocks(board) {
  let count = 0;
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      if (board[row][col] !== 0) count++;
    }
  }
  return count;
}

/**
 * Creates a mock game state for testing
 * @param {Object} overrides - Properties to override in the default state
 * @returns {Object} Mock game state
 */
export function createMockGameState(overrides = {}) {
  const defaultState = {
    board: createEmptyBoard(),
    currentTetromino: null,
    score: 0,
    level: 1,
    lines: 0,
    gameOver: false,
    paused: false,
    dropInterval: 1000,
    lastDropTime: 0
  };
  
  return { ...defaultState, ...overrides };
}
