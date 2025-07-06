// Canvas API mock for testing
import { jest } from '@jest/globals';

/**
 * Creates a mock Canvas element and 2D context for testing
 * @returns {Object} Object containing mockCanvas and mockContext
 */
export function createMockCanvas() {
  const mockContext = {
    // Drawing methods
    fillRect: jest.fn(),
    clearRect: jest.fn(),
    strokeRect: jest.fn(),
    
    // Path methods
    beginPath: jest.fn(),
    closePath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    arc: jest.fn(),
    
    // Fill and stroke
    fill: jest.fn(),
    stroke: jest.fn(),
    
    // Properties
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    globalAlpha: 1,
    
    // Text methods
    fillText: jest.fn(),
    strokeText: jest.fn(),
    measureText: jest.fn(() => ({ width: 100 })),
    
    // Transform methods
    save: jest.fn(),
    restore: jest.fn(),
    translate: jest.fn(),
    rotate: jest.fn(),
    scale: jest.fn(),
    
    // Image methods
    drawImage: jest.fn(),
    
    // Gradient methods
    createLinearGradient: jest.fn(),
    createRadialGradient: jest.fn(),
    
    // Pattern methods
    createPattern: jest.fn()
  };

  const mockCanvas = {
    // Canvas properties
    width: 800,
    height: 600,
    
    // Context method
    getContext: jest.fn(() => mockContext),
    
    // Event methods
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    
    // DOM methods
    getBoundingClientRect: jest.fn(() => ({
      left: 0,
      top: 0,
      right: 800,
      bottom: 600,
      width: 800,
      height: 600
    })),
    
    // Canvas-specific methods
    toDataURL: jest.fn(() => 'data:image/png;base64,mock'),
    toBlob: jest.fn((callback) => callback(new Blob())),
    
    // Style properties
    style: {}
  };

  return { mockCanvas, mockContext };
}

/**
 * Creates a mock HTML document with canvas element
 * @returns {Object} Mock document with canvas
 */
export function createMockDocument() {
  const { mockCanvas } = createMockCanvas();
  
  const mockDocument = {
    getElementById: jest.fn((id) => {
      if (id === 'gameCanvas') {
        return mockCanvas;
      }
      return null;
    }),
    
    createElement: jest.fn((tagName) => {
      if (tagName === 'canvas') {
        return createMockCanvas().mockCanvas;
      }
      return {};
    }),
    
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    
    body: {
      appendChild: jest.fn(),
      removeChild: jest.fn()
    }
  };
  
  return { mockDocument, mockCanvas };
}

/**
 * Resets all mock function calls
 * @param {Object} mockContext - Mock canvas context
 */
export function resetCanvasMocks(mockContext) {
  Object.keys(mockContext).forEach(key => {
    if (typeof mockContext[key] === 'function' && mockContext[key].mockReset) {
      mockContext[key].mockReset();
    }
  });
}

/**
 * Asserts that a rectangle was drawn at specific coordinates
 * @param {Object} mockContext - Mock canvas context
 * @param {number} x - Expected x coordinate
 * @param {number} y - Expected y coordinate
 * @param {number} width - Expected width
 * @param {number} height - Expected height
 * @param {string} color - Expected fill color
 */
export function expectRectangleDrawn(mockContext, x, y, width, height, color) {
  expect(mockContext.fillStyle).toBe(color);
  expect(mockContext.fillRect).toHaveBeenCalledWith(x, y, width, height);
}

/**
 * Asserts that the canvas was cleared
 * @param {Object} mockContext - Mock canvas context
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 */
export function expectCanvasCleared(mockContext, width = 800, height = 600) {
  expect(mockContext.clearRect).toHaveBeenCalledWith(0, 0, width, height);
}

/**
 * Gets the number of times fillRect was called
 * @param {Object} mockContext - Mock canvas context
 * @returns {number} Number of fillRect calls
 */
export function getFillRectCallCount(mockContext) {
  return mockContext.fillRect.mock.calls.length;
}

/**
 * Gets all fillRect call arguments
 * @param {Object} mockContext - Mock canvas context
 * @returns {Array} Array of call arguments
 */
export function getFillRectCalls(mockContext) {
  return mockContext.fillRect.mock.calls;
}
