// Test setup file for Jest
// This file is run before each test file

// Import jest globals for ES modules
import { jest } from '@jest/globals';

// Mock requestAnimationFrame for testing
global.requestAnimationFrame = jest.fn((callback) => {
  return setTimeout(callback, 16); // ~60fps
});

global.cancelAnimationFrame = jest.fn((id) => {
  clearTimeout(id);
});

// Mock performance.now for consistent timing in tests
global.performance = {
  now: jest.fn(() => Date.now())
};

// Console setup for cleaner test output
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is deprecated')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
